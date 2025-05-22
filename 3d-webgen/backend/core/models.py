from django.db import models


class Job(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
    ]

    image = models.ImageField(upload_to="jobs/images/")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    result_file = models.FileField(upload_to="jobs/results/", null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Job #{self.id} - {self.status}"
 