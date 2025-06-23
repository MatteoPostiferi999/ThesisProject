from rest_framework import serializers
from .models import Job
from rest_framework.fields import SerializerMethodField

class JobSerializer(serializers.ModelSerializer):
    image_url       = SerializerMethodField()
    result_file_url = SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'image', 'image_url',
            'result_file', 'result_file_url',
            'status', 'error_message',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'image_url', 'result_file',
            'result_file_url', 'status',
            'error_message', 'created_at', 'updated_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url)

    def get_result_file_url(self, obj):
        if not obj.result_file:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.result_file.url)

