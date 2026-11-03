from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BusViewSet, TripViewSet

router = DefaultRouter()
router.register(r'buses', BusViewSet, basename='bus')
router.register(r'trips', TripViewSet, basename='trip')

urlpatterns = [
    path('', include(router.urls)),
]