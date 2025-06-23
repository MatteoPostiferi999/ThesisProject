from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.text import slugify
from django.core.files.base import ContentFile
from .serializers import JobSerializer

from .models import Job
from jobs.tasks import generate_mesh_task

class JobViewSet(viewsets.ModelViewSet):
    queryset           = Job.objects.all()
    serializer_class   = JobSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='upload')
    def upload_image(self, request):
        image = request.FILES.get('image')
        if not image:
            return Response({'detail': 'No image uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        job = Job.objects.create(status='PENDING')

        name, ext   = image.name.rsplit('.', 1)
        safe_name   = slugify(name)
        filename    = f"jobs/{job.id}/{safe_name}.{ext}"

        job.image.save(filename, ContentFile(image.read()))
        job.save(update_fields=['image'])

        generate_mesh_task.delay(job.id)

        return Response({
            'job_id':           job.id,
            'status':           job.status,
            'input_image_url':  request.build_absolute_uri(job.image.url)
        }, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        job        = self.get_object()
        serializer = self.get_serializer(job, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='status')
    def status(self, request, pk=None):
        job        = self.get_object()
        serializer = self.get_serializer(job, context={'request': request})
        mesh_url   = serializer.data.get('result_file_url')
        progress   = 100 if job.status == "COMPLETED" else 0

        return Response({
            'status':   job.status,
            'mesh_url': mesh_url,
            'progress': progress
        })

    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        job = serializer.save(status='PENDING')
        model_id   = request.data.get('model_id', '4')
        preprocess = request.data.get('preprocess', False)

        generate_mesh_task.delay(job.id, model_id, preprocess)

        data = serializer.data
        data.update({
            'job_id': job.id,
            'status': job.status
        })
        return Response(data, status=status.HTTP_201_CREATED)
