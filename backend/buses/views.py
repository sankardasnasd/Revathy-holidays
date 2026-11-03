from django.shortcuts import render

# Create your views here.


from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Bus, Trip
from .serializers import BusSerializer, TripSerializer

class BusViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [AllowAny]


class TripViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Trip.objects.filter(is_active=True).order_by('departure_datetime')
    serializer_class = TripSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        source = self.request.query_params.get('source')
        destination = self.request.query_params.get('destination')
        date = self.request.query_params.get('date')

        if source:
            queryset = queryset.filter(source__icontains=source)
        if destination:
            queryset = queryset.filter(destination__icontains=destination)
        if date:
            queryset = queryset.filter(departure_datetime__date=date)

        return queryset