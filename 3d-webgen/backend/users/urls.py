from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView  # solo se hai la tua vista di registrazione

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),  # endpoint per registrazione
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # JWT login
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),       # refresh token
]
