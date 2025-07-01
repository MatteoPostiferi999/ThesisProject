# models.py (nella tua app principale)
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # Campi richiesti oltre a email

    def __str__(self):
        return self.email