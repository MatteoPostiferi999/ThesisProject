# models_history/urls.py
from rest_framework.routers import DefaultRouter
from .views import GeneratedModelViewSet

router = DefaultRouter()
router.register(r'', GeneratedModelViewSet, basename='generatedmodel')

urlpatterns = router.urls
