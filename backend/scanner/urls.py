from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test_api, name='test_api'),
    path('scan/', views.scan_repository, name='scan_repository'),
    path('scan/batch/', views.batch_scan, name='batch_scan'),
    path('history/', views.scan_history, name='scan_history'),
    path('policies/', views.license_policies, name='license_policies'),
    path('policies/update/', views.update_policy, name='update_policy'),
    path('export-pdf/', views.export_pdf, name='export_pdf'),
]
