"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/', include('core.urls')),
    path('api/users/', include('users.urls')),
    path('api/generated-models/', include('models_history.urls')),


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# The above code is a Django URL configuration file that defines the URL patterns for the backend project.
# It includes the admin site and the core app's URLs. The `urlpatterns` list is used by Django to route incoming requests to the appropriate view based on the URL.
# The `include` function allows you to reference other URLconf modules, making it easier to manage URLs in larger projects.
# The `path` function is used to define URL patterns, where the first argument is the URL path, the second argument is the view to be called, and the third argument is an optional name for the URL pattern.
# The `admin.site.urls` is a built-in Django URL pattern that provides the admin interface for managing the application.
