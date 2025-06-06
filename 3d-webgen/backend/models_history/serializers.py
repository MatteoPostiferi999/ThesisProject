from rest_framework import serializers
from .models import GeneratedModel

class GeneratedModelSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)  # oppure 'user.id'

    class Meta:
        model = GeneratedModel
        fields = ['id', 'user', 'input_image', 'output_model', 'model_name', 'created_at']
