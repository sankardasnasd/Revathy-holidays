from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        trip_id = self.request.query_params.get('trip')
        queryset = Review.objects.filter(is_approved=True)
        if trip_id:
            queryset = queryset.filter(trip_id=trip_id)
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        # Automatically set review user as current logged-in devotee
        serializer.save(user=self.request.user)