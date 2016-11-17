from django.db import models
from django.contrib.auth.models import User


# Enforce unique email addresses
User._meta.get_field('email')._unique = True
