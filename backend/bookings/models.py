from decimal import Decimal
from django.db import models
from django.contrib.auth.models import User
from buses.models import Trip, Seat, BoardingPoint

class Booking(models.Model):
    STATUS_CHOICES = (
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('FULL', 'Fully Paid'),
        ('ADVANCE', 'Advance Paid (Partial)'),
        ('PENDING', 'Payment Pending'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='bookings')
    boarding_point = models.ForeignKey(
        BoardingPoint,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings'
    )
    total_fare = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='FULL')
    booking_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CONFIRMED')
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def due_amount(self):
        # Python-ൽ Decimal-ഉം int/float-ഉം തമ്മിലുള്ള TypeError ഒഴിവാക്കുന്നു
        total = self.total_fare or Decimal('0.00')
        paid = self.paid_amount or Decimal('0.00')
        due = total - paid
        return max(Decimal('0.00'), due)

    def __str__(self):
        return f"Booking #{self.id} - {self.user.username} ({self.get_payment_status_display()})"


class PassengerSeat(models.Model):
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    )
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='passengers')
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    passenger_name = models.CharField(max_length=150)
    passenger_age = models.PositiveIntegerField()
    passenger_gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')

    def __str__(self):
        return f"{self.passenger_name} ({self.seat.seat_number}) - Booking #{self.booking.id}"