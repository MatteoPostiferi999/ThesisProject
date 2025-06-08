from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.core.files.storage import default_storage
from django.conf import settings
from django.utils.text import slugify
from .models import Job
from .serializers import JobSerializer
from jobs.tasks import process_image, generate_mesh_task
import os


class JobViewSet(viewsets.ViewSet):
    queryset = Job.objects.all()

    def get_permissions(self):
        if self.action in ['upload_image', 'status']:
            return [IsAuthenticated()]
        return []

    @action(detail=False, methods=['post'], url_path='upload')
    def upload_image(self, request):
            image = request.FILES.get('image')
            if not image:
                return Response({'error': 'No image uploaded'}, status=status.HTTP_400_BAD_REQUEST)

            # 1. Crea Job
            job = Job.objects.create(status='PENDING')

            # 2. Salva immagine nel percorso corretto
            filename = f"{job.id}_{slugify(image.name)}"
            relative_path = f"jobs/{filename}"
            saved_path = default_storage.save(relative_path, image)

            # 3. Salva il path nel Job
            job.image.name = saved_path
            job.save()

            # 4. Avvia generazione mesh vera
            model_id = request.data.get('model_id', '4')
            preprocess = request.data.get('preprocess', True)
            generate_mesh_task.delay(job.id, model_id, preprocess)

            # 5. Risposta
            image_url = request.build_absolute_uri(job.image.url)
            return Response({
                'job_id': job.id,
                'status': job.status,
                'input_image': image_url
            }, status=status.HTTP_201_CREATED)


    def retrieve(self, request, pk=None):
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            raise NotFound("Job not found")

        if job.status == "COMPLETED" and job.result_file:
            return Response({
                "id": job.id,
                "status": job.status,
                "mesh_url": request.build_absolute_uri(job.result_file.url),
                "created_at": job.created_at,
                "updated_at": job.updated_at,
            })
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

    @action(detail=True, methods=['get'], url_path='status')
    def status(self, request, pk=None):
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            raise NotFound("Job not found")

        mesh_url = request.build_absolute_uri(job.result_file.url) if job.result_file else None
        return Response({
            'status': job.status,
            'mesh_url': mesh_url,
            'progress': 100 if job.status == "COMPLETED" else 0
        })

    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        serializer = JobSerializer(data=request.data)
        if serializer.is_valid():
            job = serializer.save()
            model_id = request.data.get('model_id', '4')
            preprocess = request.data.get('preprocess', False)
            generate_mesh_task.delay(job.id, model_id, preprocess)
            return Response({"job_id": job.id, "status": job.status}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
