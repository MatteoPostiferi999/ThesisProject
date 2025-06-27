import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

app = Celery("backend")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
    
# This is a Celery configuration file for a Django project.
# It sets up the Celery application, configures it to use Django settings,
# and automatically discovers tasks in the Django app.
# The Celery application is used for handling asynchronous tasks in the Django project.
# Celery is a distributed task queue that allows you to run tasks in the background,
# schedule tasks, and manage task execution.