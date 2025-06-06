# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GenerateJobView,
    JobResultView,
    UploadImageView,
    JobStatusView,
)

urlpatterns = [
    path('jobs/', GenerateJobView.as_view(), name='job-create'),
    path('job/<int:pk>/', JobResultView.as_view(), name='job-detail'),
    path('upload/', UploadImageView.as_view(), name='upload'),

    # Include all model history routes
    path('generated-models/', include('models_history.urls')),
]
