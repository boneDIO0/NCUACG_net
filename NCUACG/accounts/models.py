from django.db import models

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




