from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class GeneratedModel(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="generated_models"
    )
    model_name = models.CharField(max_length=100)
    input_image = models.URLField(max_length=500)
    output_model = models.URLField(max_length=500)
    job = models.ForeignKey(
       'core.Job',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_results'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'input_image', 'output_model']
        # Oppure usa constraints per maggiore controllo:
        # constraints = [
        #     models.UniqueConstraint(
        #         fields=['user', 'input_image', 'output_model'],
        #         name='unique_user_model'
        #     )
        # ]
    

    def __str__(self):
         return f"{self.model_name} by {self.user.username}"