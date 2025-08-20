from django.db import models
from django.utils import timezone
from datetime import timedelta

class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    registered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.email})"


class Credential(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='credential')
    username = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=256)
    last_login = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.username} (user_id={self.user.id})"


class VerificationToken(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(hours=24)



