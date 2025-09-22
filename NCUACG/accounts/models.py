from django.db import models
from django.utils import timezone
from datetime import timedelta

class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    registered_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    is_super_admin = models.BooleanField(default=False)
    last_login = models.DateTimeField(blank=True, null=True)
    is_authenticated=models.BooleanField(default=False)
    def __str__(self):
        return f"{self.name} ({self.email})"


class Credential(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='credential')
    password_hash = models.CharField(max_length=256)

    def __str__(self):
        return f"(user_id={self.user.id})"


class VerificationToken(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(hours=24)



