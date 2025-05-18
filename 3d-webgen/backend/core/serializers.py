from rest_framework import serializers
from .models import Job  # importa il modello vero

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'
