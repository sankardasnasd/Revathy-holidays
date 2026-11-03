#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

python manage.py shell << END
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if username and password:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f"Superuser '{username}' created successfully!")
    else:
        print(f"Superuser '{username}' already exists.")
END