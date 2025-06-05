from django.db import models
from django.contrib.auth.models import User


class Job(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
    ]

    image = models.ImageField(upload_to='uploads/', null=True, blank=True)
    result_file = models.FileField(upload_to='results/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Job #{self.id} - {self.status}"
 

class GeneratedModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="generated_models")
    input_image = models.ImageField(upload_to="uploads/")
    output_model = models.FileField(upload_to="results/")
    model_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.model_name} - {self.user.username} @ {self.created_at.strftime('%Y-%m-%d %H:%M')}"
