
# models_history/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GeneratedModelViewSet, save_generated_model, list_user_models

router = DefaultRouter()
router.register(r'', GeneratedModelViewSet, basename='generatedmodel')

urlpatterns = [
    path('save/', save_generated_model, name='save_model'),
    path('my-models/', list_user_models, name='user_models'),
    path('', include(router.urls)),  # includes: /, /<pk>/, etc.
]
