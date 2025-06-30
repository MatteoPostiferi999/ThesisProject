from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import IntegrityError
from .models import GeneratedModel
from .serializers import GeneratedModelSerializer
import logging

logger = logging.getLogger(__name__)

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
        # Ritorna solo i record dell'utente loggato
        return GeneratedModel.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Associa sempre l'utente corrente
        try:
            serializer.save(user=self.request.user)
        except IntegrityError:
            # Gestisce duplicati che potrebbero arrivare da altre chiamate
            logger.warning(f"⚠️ Duplicato ignorato in perform_create per user {self.request.user.id}")

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
        data = request.data

        # ✅ CONTROLLA DUPLICATI PRIMA DI SALVARE
        existing_model = GeneratedModel.objects.filter(
            user=user,
            input_image=data.get('input_image'),
            output_model=data.get('output_model')
        ).first()

        if existing_model:
            logger.info(f"ℹ️ Modello già esistente per user {user.id}")
            return Response(
                {
                    'detail': 'Modello già esistente nella cronologia.',
                    'model': self.get_serializer(existing_model).data
                },
                status=status.HTTP_200_OK
            )

        # 1) Controllo quota per utenti free
        if not user.is_staff:
            current_count = GeneratedModel.objects.filter(user=user).count()
            if current_count >= 8:
                return Response(
                    {'detail': 'Hai già raggiunto il limite di 8 modelli.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 2) Validazione / serializzazione
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # 3) Logica differenziata per admin/user
            if user.is_staff:
                instance = serializer.save(user=user, approved=True)
                logger.info(f"✅ Modello salvato (admin) per user {user.id}")
            else:
                instance = serializer.save(user=user)
                logger.info(f"✅ Modello salvato (free) per user {user.id}")

            # 4) Risposta di successo
            return Response(
                self.get_serializer(instance).data,
                status=status.HTTP_201_CREATED
            )
            
        except IntegrityError as e:
            # ✅ BACKUP: Gestisce duplicati che sfuggono al controllo preventivo
            logger.warning(f"⚠️ IntegrityError in save_model per user {user.id}: {e}")
            
            # Trova il modello esistente
            existing = GeneratedModel.objects.filter(
                user=user,
                input_image=data.get('input_image'),
                output_model=data.get('output_model')
            ).first()
            
            return Response(
                {
                    'detail': 'Modello già esistente nella cronologia.',
                    'model': self.get_serializer(existing).data if existing else None
                },
                status=status.HTTP_200_OK
            )