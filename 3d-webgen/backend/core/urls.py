from django.urls import path
from .views import GenerateJobView, JobDetailView

urlpatterns = [
    path('generate/', GenerateJobView.as_view(), name='generate-job'),
    path('jobs/<int:pk>/', JobDetailView.as_view(), name='job-detail'),  

]
# This URL pattern maps the path 'jobs/' to the JobCreateView, which handles job creation requests.
# The name 'job-create' is used to refer to this URL pattern in other parts of the application.
# This allows the frontend to send a POST request to this endpoint with the job data.
# The JobCreateView will process the request, create a new job, and return a response.
# The view is expected to handle the logic for creating a new job, including validation and saving the job to the database.
# The URL pattern is defined using Django's path function, which takes the URL path, the view to be called, and an optional name for the URL pattern.