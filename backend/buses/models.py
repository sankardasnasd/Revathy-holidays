from django.db import models

class Bus(models.Model):
    BUS_TYPE_CHOICES = (
        ('AC_SEATER', 'AC Seater'),
        ('NON_AC_SEATER', 'Non-AC Seater'),
        ('AC_SLEEPER', 'AC Sleeper'),
        ('NON_AC_SLEEPER', 'Non-AC Sleeper'),
    )

    name = models.CharField(max_length=100)
    bus_number = models.CharField(max_length=20, unique=True)
    bus_type = models.CharField(max_length=20, choices=BUS_TYPE_CHOICES, default='AC_SEATER')
    total_seats = models.PositiveIntegerField(default=40)
    amenities = models.TextField(help_text="e.g., Wi-Fi, Charging Point, Water Bottle, Blanket")
    image = models.ImageField(upload_to='bus_images/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.bus_number})"


class Seat(models.Model):
    SEAT_TYPE_CHOICES = (
        ('WINDOW', 'Window'),
        ('AISLE', 'Aisle'),
        ('MIDDLE', 'Middle'),
        ('LOWER_BERTH', 'Lower Berth'),
        ('UPPER_BERTH', 'Upper Berth'),
    )

    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10)
    row = models.PositiveIntegerField(help_text="Row index in the grid layout (1, 2, 3...)")
    column = models.PositiveIntegerField(help_text="Column index in the grid layout (1, 2, 3, 4)")
    seat_type = models.CharField(max_length=20, choices=SEAT_TYPE_CHOICES, default='WINDOW')

    class Meta:
        unique_together = ('bus', 'seat_number')
        ordering = ['row', 'column']

    def __str__(self):
        return f"{self.bus.name} - Seat {self.seat_number}"


class Trip(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='trips')
    source = models.CharField(max_length=100, help_text="e.g., Ernakulam")
    destination = models.CharField(max_length=100, default="Sabarimala (Pamba)")
    departure_datetime = models.DateTimeField()
    arrival_datetime = models.DateTimeField()
    fare = models.DecimalField(max_digits=8, decimal_places=2, help_text="Base fare per seat")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.source} to {self.destination} - {self.departure_datetime.strftime('%d-%m-%Y %H:%M')}"



from django.db import models

class BoardingPoint(models.Model):
    trip = models.ForeignKey('Trip', on_delete=models.CASCADE, related_name='boarding_points')
    point_name = models.CharField(max_length=150) 
    pickup_time = models.TimeField()
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order', 'pickup_time']

    def __str__(self):
        return f"{self.point_name} ({self.pickup_time.strftime('%I:%M %p')})"