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
    
    @action(detail=False, methods=['post'], url_path='save')
    def save_model(self, request):
        """
        Endpoint dedicato per flussi speciali (e.g. admin vs free user).
        """
        user = request.user

        # 1) Esempio: quota max = 8 per utenti free
        if not user.is_staff:
            if GeneratedModel.objects.filter(user=user).count() >= 8:
                return Response(
                    {'detail': 'Hai già raggiunto il limite di 8 modelli.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 2) Validazione / serializzazione
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 3) Logica differenziata
        if user.is_staff:
            # …magari un campo extra, o bypass quota…
            instance = serializer.save(user=user, approved=True)
        else:
            # utente “free”
            instance = serializer.save(user=user)

        # 4) Risposta
        return Response(
            self.get_serializer(instance).data,
            status=status.HTTP_201_CREATED
        )
