from django.db import models
import uuid

RISK_CHOICES = [
    ('LOW', 'Low Risk'),
    ('MEDIUM', 'Medium Risk'),
    ('HIGH', 'High Risk'),
    ('UNKNOWN', 'Unknown'),
]

class Scan(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('scanning', 'Scanning'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    repo_url = models.URLField(max_length=500)
    repo_name = models.CharField(max_length=200, blank=True)
    license_name = models.CharField(max_length=200, blank=True, default='')
    license_key = models.CharField(max_length=100, blank=True, default='')
    risk_level = models.CharField(max_length=10, choices=RISK_CHOICES, default='UNKNOWN')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.repo_name} - {self.risk_level}"

class LicensePolicy(models.Model):
    ACTION_CHOICES = [
        ('allow', 'Allow'),
        ('block', 'Block'),
        ('warn', 'Warn'),
    ]

    license_key = models.CharField(max_length=100, unique=True)
    license_name = models.CharField(max_length=200)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES, default='warn')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "License policies"

    def __str__(self):
        return f"{self.license_name} -> {self.action}"
