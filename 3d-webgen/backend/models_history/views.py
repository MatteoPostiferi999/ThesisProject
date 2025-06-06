from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import GeneratedModel
from .serializers import GeneratedModelSerializer
from rest_framework import viewsets, permissions



class GeneratedModelViewSet(viewsets.ModelViewSet):
    serializer_class = GeneratedModelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GeneratedModel.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_generated_model(request):
    serializer = GeneratedModelSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_user_models(request):
    models = GeneratedModel.objects.filter(user=request.user).order_by('-created_at')
    serializer = GeneratedModelSerializer(models, many=True)
    return Response(serializer.data)
