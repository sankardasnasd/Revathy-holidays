from rest_framework import serializers
from .models import Booking, PassengerSeat
from buses.serializers import TripSerializer

class PassengerSeatSerializer(serializers.ModelSerializer):
    seat_number = serializers.ReadOnlyField(source='seat.seat_number')

    class Meta:
        model = PassengerSeat
        fields = ['id', 'seat', 'seat_number', 'passenger_name', 'passenger_age', 'passenger_gender']

class BookingSerializer(serializers.ModelSerializer):
    passengers = PassengerSeatSerializer(many=True, read_only=True)
    trip_details = TripSerializer(source='trip', read_only=True)
    boarding_point_name = serializers.ReadOnlyField(source='boarding_point.point_name')
    due_amount = serializers.ReadOnlyField()

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'trip', 'trip_details', 'boarding_point',
            'boarding_point_name', 'total_fare', 'paid_amount',
            'payment_status', 'booking_status', 'due_amount',
            'created_at', 'passengers'
        ]
        read_only_fields = ['user', 'total_fare', 'paid_amount', 'payment_status', 'booking_status']

    def create(self, validated_data):
        request = self.context.get('request')
        passengers_data = request.data.get('passenger_seats', [])
        trip = validated_data.get('trip')
        payment_type = request.data.get('payment_type', 'FULL')  # 'FULL' or 'ADVANCE'

        seat_count = len(passengers_data) if passengers_data else 1
        total_fare = float(trip.fare) * seat_count

        if payment_type == 'ADVANCE':
            paid_amount = round(total_fare * 0.30, 2)
            payment_status = 'ADVANCE'
        else:
            paid_amount = total_fare
            payment_status = 'FULL'

        booking = Booking.objects.create(
            user=request.user,
            trip=trip,
            boarding_point=validated_data.get('boarding_point'),
            total_fare=total_fare,
            paid_amount=paid_amount,
            payment_status=payment_status,
            booking_status='CONFIRMED'
        )

        for p_data in passengers_data:
            PassengerSeat.objects.create(
                booking=booking,
                seat_id=p_data.get('seat'),
                passenger_name=p_data.get('passenger_name'),
                passenger_age=int(p_data.get('passenger_age', 18)),
                passenger_gender=p_data.get('passenger_gender', 'M')
            )

        return booking