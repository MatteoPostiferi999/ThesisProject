from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import GeneratedModel
from .serializers import GeneratedModelSerializer

class GeneratedModelViewSet(viewsets.ModelViewSet):
    """
    ViewSet per gestire i modelli 3D generati dagli utenti autenticati.
    """
    serializer_class   = GeneratedModelSerializer
    permission_classes = [permissions.IsAuthenticated]

    # I modelli supportati
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
        # Ritorna solo i record dell’utente loggato
        return GeneratedModel.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Associa sempre l’utente corrente
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-models')
    def my_models(self, request):
        qs = self.get_queryset()
        model_name = request.query_params.get('model_name')
        if model_name in self.VALID_MODELS:
            qs = qs.filter(model_name=model_name)

        order = request.query_params.get('order', 'desc')
        qs = qs.order_by('created_at' if order == 'asc' else '-created_at')

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
