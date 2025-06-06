from rest_framework import serializers
from .models import GeneratedModel

class GeneratedModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedModel
        fields = '__all__'
        read_only_fields = ['user', 'created_at']
