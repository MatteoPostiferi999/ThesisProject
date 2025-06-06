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
    path('jobs/status/<int:job_id>/', JobStatusView.as_view(), name='job-status'),


]
