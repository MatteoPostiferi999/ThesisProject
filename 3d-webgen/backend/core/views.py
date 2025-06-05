from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from rest_framework.generics import RetrieveAPIView
from .serializers import JobSerializer, GeneratedModelSerializer
from .models import Job, GeneratedModel
from django.core.files.storage import default_storage
from django.conf import settings
import os
from jobs.tasks import process_image  
from django.utils.text import slugify
from uuid import uuid4



class UploadImageView(APIView):
    def post(self, request):
        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'No image uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        # Crea job vuoto
        job = Job.objects.create(status='PENDING')

        # Crea filename unico
        filename = f"{job.id}_{slugify(image.name)}"
        relative_path = f"jobs/{filename}"

        # Salva immagine
        path = default_storage.save(relative_path, image)

        # Salva percorso nel Job (se hai image=ImageField)
        job.image.name = path  # salva path relativo a MEDIA_ROOT
        job.save()

        # Avvia il task Celery
    
        full_path = os.path.join(settings.MEDIA_ROOT, path)
        process_image.delay(job.id, full_path)

        return Response({'job_id': job.id, 'status': 'PENDING'}, status=status.HTTP_201_CREATED)



class JobResultView(RetrieveAPIView):
    queryset = Job.objects.all()

    def get(self, request, *args, **kwargs):
        job = self.get_object()

        if job.status == "COMPLETED" and job.result_file:
            return Response({
                "id": job.id,
                "status": job.status,
                "mesh_url": request.build_absolute_uri(job.result_file.url),
                "created_at": job.created_at,
                "updated_at": job.updated_at,
            }, status=status.HTTP_200_OK)

        elif job.status == "FAILED":
            return Response({
                "id": job.id,
                "status": job.status,
                "error": job.error_message or "Errore non specificato.",
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:
            return Response({
                "id": job.id,
                "status": job.status,
                "message": "La mesh non è ancora pronta. Riprova più tardi."
            }, status=status.HTTP_202_ACCEPTED)


class JobStatusView(APIView):
    def get(self, request, job_id):
        job = Job.objects.get(id=job_id)
        return Response({'status': job.status, 'output_path': job.output_path})


class GenerateJobView(APIView):
    def post(self, request):
        serializer = JobSerializer(data=request.data)
        if serializer.is_valid():
            job = serializer.save()  # crea il job con status PENDING

            # Esegui il task async
            model_id = request.data.get('model_id', '4')  # default: modello 4
            preprocess = request.data.get('preprocess', False)

            generate_mesh_task.delay(job.id, model_id, preprocess)

            return Response({"job_id": job.id, "status": job.status}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class GeneratedModelViewSet(viewsets.ModelViewSet):
    serializer_class = GeneratedModelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GeneratedModel.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
