from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test_api, name='test_api'),
    path('scan/', views.scan_repository, name='scan_repository'),
    path('history/', views.scan_history, name='scan_history'),
    path('export-pdf/', views.export_pdf, name='export_pdf'),  # ← YEH ADD KARO
]