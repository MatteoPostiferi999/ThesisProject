from rest_framework import serializers
from .models import Job, GeneratedModel

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['status', 'result_file', 'error_message', 'created_at', 'updated_at']



class GeneratedModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedModel
        fields = '__all__'
        read_only_fields = ['user', 'created_at']
