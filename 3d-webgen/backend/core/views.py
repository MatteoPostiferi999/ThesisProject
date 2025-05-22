from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from .serializers import JobSerializer
from .models import Job
from .tasks import generate_mesh_task  


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


class JobDetailView(RetrieveAPIView):
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
