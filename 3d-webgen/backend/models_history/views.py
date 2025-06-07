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

    VALID_MODELS = [
        'hunyuan-mini-turbo',
        'hunyuan-mini-fast',
        'hunyuan-mini',
        'hunyuan-mv-turbo',
        'hunyuan-mv-fast',
        'hunyuan-mv',
        'hunyuan-v2-0-turbo',
        'hunyuan-v2-0-fast',
        'hunyuan-v2-0',
    ]


    def get_queryset(self):
        """
        Restituisce solo i modelli generati dall'utente autenticato.
        """
        return GeneratedModel.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Salva il modello associandolo automaticamente all'utente autenticato.
        """
        serializer.save(user=self.request.user)

    
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


    @action(detail=False, methods=['get'], url_path='my-models')
    def my_models(self, request):
        queryset = self.get_queryset()

        model_name = request.query_params.get('model_name', 'all')
        if model_name != 'all' and model_name in self.VALID_MODELS:
            queryset = queryset.filter(model_name=model_name)


        # Filtro per modello AI – default: hunyuan-mini-turbo
        model_name = request.query_params.get('model_name', 'hunyuan-mini-turbo')
        if model_name in self.VALID_MODELS:
            queryset = queryset.filter(model_name=model_name)

        # Ordinamento – default: desc
        order = request.query_params.get('order', 'desc')
        if order == 'asc':
            queryset = queryset.order_by('created_at')
        else:
            queryset = queryset.order_by('-created_at')

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

