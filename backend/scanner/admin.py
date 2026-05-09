from django.contrib import admin
from .models import Scan

@admin.register(Scan)
class ScanAdmin(admin.ModelAdmin):
    list_display = ['repo_name', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['repo_name', 'repo_url']