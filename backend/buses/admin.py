from django.contrib import admin
from .models import Bus, Seat, Trip, BoardingPoint

class SeatInline(admin.TabularInline):
    model = Seat
    extra = 0

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ('name', 'bus_number', 'bus_type', 'total_seats')
    inlines = [SeatInline]

class BoardingPointInline(admin.TabularInline):
    model = BoardingPoint
    extra = 3  

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('id', 'source', 'destination', 'departure_datetime', 'fare', 'is_active')
    inlines = [BoardingPointInline]

@admin.register(BoardingPoint)
class BoardingPointAdmin(admin.ModelAdmin):
    list_display = ('point_name', 'trip', 'pickup_time', 'order')