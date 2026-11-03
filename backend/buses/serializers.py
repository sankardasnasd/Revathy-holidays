from rest_framework import serializers
from .models import Bus, Trip, Seat, BoardingPoint
from bookings.models import Booking, PassengerSeat

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        # 'is_active' ഒഴിവാക്കി മോഡലിലുള്ള യഥാർത്ഥ ഫീൽഡുകൾ മാത്രം നൽകുക
        fields = ['id', 'seat_number', 'row', 'column']

class BoardingPointSerializer(serializers.ModelSerializer):
    formatted_time = serializers.SerializerMethodField()

    class Meta:
        model = BoardingPoint
        fields = ['id', 'point_name', 'pickup_time', 'formatted_time']

    def get_formatted_time(self, obj):
        return obj.pickup_time.strftime("%I:%M %p") if obj.pickup_time else ""

class BusSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)

    class Meta:
        model = Bus
        fields = ['id', 'name', 'bus_number', 'bus_type', 'total_seats', 'image', 'seats']

class TripSerializer(serializers.ModelSerializer):
    bus = BusSerializer(read_only=True)
    boarding_points = BoardingPointSerializer(many=True, read_only=True)
    booked_seat_ids = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            'id', 'bus', 'source', 'destination', 'departure_datetime', 
            'arrival_datetime', 'fare', 'is_active', 'boarding_points', 'booked_seat_ids'
        ]

    def get_booked_seat_ids(self, obj):
        confirmed_bookings = Booking.objects.filter(trip=obj, booking_status='CONFIRMED')
        return list(
            PassengerSeat.objects.filter(booking__in=confirmed_bookings).values_list('seat_id', flat=True)
        )