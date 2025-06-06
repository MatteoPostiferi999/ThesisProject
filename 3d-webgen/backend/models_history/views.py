from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import GeneratedModel
from .serializers import GeneratedModelSerializer

class GeneratedModelViewSet(viewsets.ModelViewSet):
    """
    ViewSet per gestire i modelli 3D generati dagli utenti autenticati.
    """
    serializer_class = GeneratedModelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Restituisce solo i modelli generati dall'utente autenticato.
        """
        return GeneratedModel.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        """
        Salva il modello associandolo automaticamente all'utente autenticato.
        """
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-models')
    def my_models(self, request):
        """
        Restituisce la cronologia dei modelli generati dall'utente.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='save')
    def save_model(self, request):
        """
        Salva un nuovo modello generato, associandolo all'utente autenticato.
        """
        print("🔍 Incoming data:", request.data)
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print("❌ Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
