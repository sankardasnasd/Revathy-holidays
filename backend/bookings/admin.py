from django.contrib import admin
from django.utils.html import format_html
from .models import Booking, PassengerSeat

class PassengerSeatInline(admin.TabularInline):
    model = PassengerSeat
    extra = 0
    readonly_fields = ('seat', 'passenger_name', 'passenger_age', 'passenger_gender')
    can_delete = False

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'customer_name',
        'trip_route',
        'bus_name',
        'seats_booked',
        'total_fare_display',
        'paid_amount_display',
        'due_amount_display',
        'payment_status_badge',
        'booking_status_badge',
        'created_at',
    )
    list_filter = (
        'payment_status',
        'booking_status',
        'trip__destination',
        'trip__departure_datetime',
    )
    search_fields = (
        'id',
        'user__username',
        'user__email',
        'trip__destination',
        'trip__source',
        'passengers__passenger_name',
    )
    readonly_fields = (
        'user',
        'trip',
        'boarding_point',
        'total_fare',
        'paid_amount',
        'due_amount_display',
        'created_at',
    )
    inlines = [PassengerSeatInline]
    ordering = ('-created_at',)

    def customer_name(self, obj):
        return obj.user.username
    customer_name.short_description = "Customer"

    def trip_route(self, obj):
        return f"{obj.trip.source} → {obj.trip.destination}"
    trip_route.short_description = "Route"

    def bus_name(self, obj):
        return f"{obj.trip.bus.name} ({obj.trip.bus.bus_number})"
    bus_name.short_description = "Bus"

    def seats_booked(self, obj):
        seats = [p.seat.seat_number for p in obj.passengers.all()]
        return ", ".join(seats) if seats else "None"
    seats_booked.short_description = "Seats"

    def total_fare_display(self, obj):
        return f"₹{obj.total_fare}"
    total_fare_display.short_description = "Total Fare"

    def paid_amount_display(self, obj):
        return f"₹{obj.paid_amount}"
    paid_amount_display.short_description = "Paid"

    def due_amount_display(self, obj):
        due = obj.due_amount
        if due > 0:
            return format_html('<span style="color: #dc2626; font-weight: bold;">₹{}</span>', due)
        return format_html('<span style="color: #16a34a; font-weight: bold;">₹0.00</span>')
    due_amount_display.short_description = "Due Amount"

    def payment_status_badge(self, obj):
        if obj.payment_status == 'FULL':
            return format_html(
                '<span style="background-color: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px;">FULLY PAID</span>'
            )
        elif obj.payment_status == 'ADVANCE':
            return format_html(
                '<span style="background-color: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px;">ADVANCE PAID</span>'
            )
        return format_html(
            '<span style="background-color: #fee2e2; color: #b91c1c; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px;">PENDING</span>'
        )
    payment_status_badge.short_description = "Payment Status"

    def booking_status_badge(self, obj):
        if obj.booking_status == 'CONFIRMED':
            return format_html(
                '<span style="background-color: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px;">CONFIRMED</span>'
            )
        elif obj.booking_status == 'CANCELLED':
            return format_html(
                '<span style="background-color: #ffe4e6; color: #be123c; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px;">CANCELLED</span>'
            )
        return format_html(
            '<span style="background-color: #f3f4f6; color: #374151; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px;">{}</span>',
            obj.booking_status
        )
    booking_status_badge.short_description = "Booking Status"