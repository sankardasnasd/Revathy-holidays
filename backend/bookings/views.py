from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Booking, PassengerSeat
from .serializers import BookingSerializer

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def pay_due(self, request, pk=None):
        booking = self.get_object()
        if booking.due_amount <= 0:
            return Response({'detail': 'No pending balance due for this booking.'}, status=status.HTTP_400_BAD_REQUEST)
        
        booking.paid_amount = booking.total_fare
        booking.payment_status = 'FULL'
        booking.save()
        return Response({
            'status': 'Balance payment cleared successfully!',
            'paid_amount': booking.paid_amount,
            'due_amount': booking.due_amount,
            'payment_status': booking.payment_status
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def cancel_booking(self, request, pk=None):
        booking = self.get_object()
        if booking.booking_status == 'CANCELLED':
            return Response({'detail': 'This booking is already cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

        # Booking status cancel aakkunnu
        booking.booking_status = 'CANCELLED'
        booking.save()

        # Booked seats free aakkaanaayi associated passenger seats delete cheyyunnu
        booking.passengers.all().delete()

        return Response({
            'status': 'Booking has been cancelled successfully. Reserved seats are now released.',
            'booking_status': booking.booking_status
        }, status=status.HTTP_200_OK)