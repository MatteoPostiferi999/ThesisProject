from django.urls import path
from .views import GeneratedModelViewSet

urlpatterns = [
    path('save/', GeneratedModelViewSet.as_view({'post': 'save_model'}), name='save_model'),
    path('my-models/', GeneratedModelViewSet.as_view({'get': 'my_models'}), name='user_models'),
    path('', GeneratedModelViewSet.as_view({'get': 'list', 'post': 'create'}), name='generatedmodel-list'),
    path('<int:pk>/', GeneratedModelViewSet.as_view({'get': 'retrieve'}), name='generatedmodel-detail'),
]
