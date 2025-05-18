from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import JobSerializer
from rest_framework.generics import RetrieveAPIView
from .models import Job

class JobCreateView(APIView):
    """
    View to create a new job.
    """
    def post(self, request):
        serializer = JobSerializer(data=request.data) 
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class JobDetailView(RetrieveAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
