import os
import django
from datetime import datetime, timedelta

# പ്രൊജക്റ്റ് ഫോൾഡർ 'core' ആയതിനാൽ core.settings നൽകുന്നു
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from buses.models import Bus, Seat, Trip, BoardingPoint

def seed():
    print("Clearing old test data...")
    Trip.objects.all().delete()
    Bus.objects.all().delete()

    buses_info = [
        {
            "name": "Sabarimala Special Express",
            "bus_number": "KL-07-AW-2027",
            "bus_type": "AC_SEATER",
            "total_seats": 20,
            "amenities": "AC, Pushback Seats, Water Bottle, Devotional Audio",
        },
        {
            "name": "Guruvayur Darshan Deluxe",
            "bus_number": "KL-11-BH-1008",
            "bus_type": "AC_SEATER",
            "total_seats": 20,
            "amenities": "AC, Mobile Charging, Clean Interiors",
        },
        {
            "name": "Thrissur Pooram Express",
            "bus_number": "KL-08-CD-4500",
            "bus_type": "NON_AC_SEATER",
            "total_seats": 20,
            "amenities": "Comfortable Pushback, Fan, Music",
        }
    ]

    trips_info = [
        {
            "bus_idx": 0,
            "source": "Kozhikode",
            "destination": "Sabarimala (Pamba)",
            "days_ahead": 2,
            "fare": 1500.00,
            "stops": [
                ("Kozhikode KSRTC Stand", "20:00:00", 1),
                ("Pottammal Junction", "20:25:00", 2),
                ("Ramanattukara Bypass", "20:50:00", 3),
            ]
        },
        {
            "bus_idx": 1,
            "source": "Kozhikode",
            "destination": "Guruvayur",
            "days_ahead": 5,
            "fare": 800.00,
            "stops": [
                ("Mofussil Bus Stand", "06:00:00", 1),
                ("Feroke Bridge", "06:30:00", 2),
                ("Kottakkal Changuvetty", "07:15:00", 3),
            ]
        },
        {
            "bus_idx": 2,
            "source": "Kozhikode",
            "destination": "Vadakkunnathan (Thrissur)",
            "days_ahead": 8,
            "fare": 700.00,
            "stops": [
                ("Palayam Stand", "05:30:00", 1),
                ("Pantheerankavu", "06:00:00", 2),
            ]
        }
    ]

    created_buses = []
    for b_data in buses_info:
        bus = Bus.objects.create(**b_data)
        created_buses.append(bus)
        print(f"Created Bus: {bus.name}")

        # 20 സീറ്റുകൾ ഓട്ടോമാറ്റിക് ആയി ഉണ്ടാക്കുന്നു (5 rows x 4 columns = 2x2 Layout)
        seats = []
        for row in range(1, 6):
            for col in range(1, 5):
                seat_char = chr(64 + col) # A, B, C, D
                seat_num = f"{row}{seat_char}"
                seat_type = 'WINDOW' if col in [1, 4] else 'AISLE'
                seats.append(Seat(bus=bus, seat_number=seat_num, row=row, column=col, seat_type=seat_type))
        Seat.objects.bulk_create(seats)
        print(f" -> 20 Seats created for {bus.name}")

    now = datetime.now()
    for t_data in trips_info:
        dep_time = now + timedelta(days=t_data["days_ahead"], hours=4)
        arr_time = dep_time + timedelta(hours=8)
        trip = Trip.objects.create(
            bus=created_buses[t_data["bus_idx"]],
            source=t_data["source"],
            destination=t_data["destination"],
            departure_datetime=dep_time,
            arrival_datetime=arr_time,
            fare=t_data["fare"],
            is_active=True
        )
        print(f"Created Trip: {trip.source} to {trip.destination}")

        for stop_name, p_time, order in t_data["stops"]:
            BoardingPoint.objects.create(
                trip=trip,
                point_name=stop_name,
                pickup_time=p_time,
                order=order
            )

    print("\nData population successful! Ready to test.")

if __name__ == '__main__':
    seed()