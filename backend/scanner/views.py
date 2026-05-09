from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from datetime import datetime
import logging
from .models import Scan
from .services.github_service import GitHubService
from .services.pdf_service import PDFService

logger = logging.getLogger(__name__)

@api_view(['GET'])
def test_api(request):
    return Response({
        'message': 'API is working!',
        'status': 'success',
        'data': {
            'scans_count': Scan.objects.count(),
            'server': 'Django is running'
        }
    })

@csrf_exempt
@api_view(['POST'])
def scan_repository(request):
    repo_url = request.data.get('repo_url')
    
    if not repo_url:
        return Response({
            'status': 'error',
            'message': 'Repository URL is required'
        }, status=400)
    
    try:
        github_service = GitHubService()
        repo = github_service.get_repository(repo_url)
        license_info = github_service.get_license_info(repo)
        
        # Manual recommendation based on license key
        license_key = license_info.get('key', 'unknown')
        
        recommendation_text = "No specific recommendations"
        if license_key == 'mit':
            recommendation_text = "✅ Safe to use in commercial projects. Just include the original license and copyright notice."
        elif license_key == 'apache-2.0':
            recommendation_text = "✅ Safe for commercial use. Include license text and state any changes made."
        elif license_key == 'gpl-3.0' or license_key == 'gpl-2.0':
            recommendation_text = "⚠️ Strong copyleft. Your project must also be open source if you distribute it."
        elif license_key == 'bsd-3-clause' or license_key == 'bsd-2-clause':
            recommendation_text = "✅ Very permissive. Include copyright notice and disclaimer."
        elif license_key == 'unknown':
            recommendation_text = "⚠️ No license found! Add a license to protect your work."
        
        # Save to database
        scan = Scan.objects.create(
            repo_url=repo_url,
            repo_name=repo.full_name,
            status='completed'
        )
        
        return Response({
            'status': 'success',
            'message': 'Scan completed',
            'repo_url': repo_url,
            'repo_name': repo.full_name,
            'license': license_info,
            'risk_level': license_info.get('risk', 'MEDIUM'),
            'recommendation': recommendation_text
        })
        
    except Exception as e:
        logger.exception('Error scanning repository: %s', e)
        return Response({
            'status': 'error',
            'message': 'An internal error occurred while scanning the repository. Please try again later.'
        }, status=500)

@api_view(['GET'])
def scan_history(request):
    scans = Scan.objects.all().order_by('-created_at')[:10]
    
    return Response({
        'status': 'success',
        'scans': [
            {
                'id': str(scan.id),
                'repo_url': scan.repo_url,
                'repo_name': scan.repo_name,
                'status': scan.status,
                'created_at': scan.created_at.isoformat()
            }
            for scan in scans
        ]
    })

@api_view(['POST'])
def export_pdf(request):
    """Export scan results as PDF"""
    scan_data = request.data.get('scan_data', {})
    
    try:
        pdf_service = PDFService()
        pdf_bytes, filepath = pdf_service.generate_report(scan_data)
        
        # Create HTTP response with PDF
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="license_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
        
        return response
    
    except Exception as e:
        logger.exception('Error generating PDF: %s', e)
        return Response({
            'status': 'error',
            'message': 'Failed to generate PDF report. Please try again later.'
        }, status=500)