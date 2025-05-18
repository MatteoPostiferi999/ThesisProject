import time
from celery import shared_task
from .models import Job
from django.core.files.base import ContentFile

# This is a Celery task that processes a job.
# It simulates a long-running task by sleeping for 5 seconds,
# then creates a dummy `.ply` file and saves it to the job's result_file field.
# The task updates the job's status to "IN_PROGRESS" while processing,
# and to "COMPLETED" or "FAILED" based on the outcome.
# The task is decorated with @shared_task, which allows it to be run asynchronously
# by Celery. The task takes a job_id as an argument, retrieves the job from the database,
# updates its status, and handles any exceptions that may occur during processing.


# The task is imported in the views.py file and called using the delay() method,
# which sends the task to the Celery worker for 
# asynchronous execution. 

@shared_task
def process_job(job_id):
    try:
        job = Job.objects.get(id=job_id)
        job.status = "IN_PROGRESS"
        job.save()

        time.sleep(5)  # Simula tempo di elaborazione

        # Crea file `.ply` finto
        dummy_content = b"ply\nformat ascii 1.0\nelement vertex 3\nproperty float x\nproperty float y\nproperty float z\nend_header\n0 0 0\n1 0 0\n0 1 0\n"
        job.result_file.save(f"job_{job_id}.ply", ContentFile(dummy_content))

        job.status = "COMPLETED"
        job.save()
    except Exception as e:
        job.status = "FAILED"
        job.error_message = str(e)
        job.save()
