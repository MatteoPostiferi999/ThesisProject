from django.db import models
from django.contrib.auth.models import User

class GeneratedModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="generated_models")
    model_name = models.CharField(max_length=100)
    input_image = models.URLField(max_length=500)
    output_model = models.URLField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.model_name} by {self.user.username}"
