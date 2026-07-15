from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from datetime import datetime
import logging
from .models import Scan, LicensePolicy
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

@api_view(['POST'])
def scan_repository(request):
    repo_url = request.data.get('repo_url')

    if not repo_url:
        return Response({'status': 'error', 'message': 'Repository URL is required'}, status=400)

    try:
        if not repo_url.startswith('http'):
            return Response({'status': 'error', 'message': 'Invalid repository URL'}, status=400)

        github_service = GitHubService()
        repo = github_service.get_repository(repo_url)
        license_info = github_service.get_license_info(repo)
        recommendation_text = github_service._get_recommendation(license_info.get('key'))
        dependencies = github_service.get_dependencies(repo)
        policy = github_service.check_policy(license_info.get('key'))
        risk_level = license_info.get('risk', 'MEDIUM')

        scan = Scan.objects.create(
            repo_url=repo_url,
            repo_name=repo.full_name,
            license_name=license_info.get('name', ''),
            license_key=license_info.get('key', ''),
            risk_level=risk_level,
            status='completed'
        )

        return Response({
            'status': 'success',
            'message': 'Scan completed',
            'repo_url': repo_url,
            'repo_name': repo.full_name,
            'license': license_info,
            'risk_level': risk_level,
            'recommendation': recommendation_text,
            'stars': repo.stargazers_count,
            'forks': repo.forks_count,
            'compliance_status': 'Compliant' if risk_level == 'LOW' else 'Review Required',
            'dependencies': dependencies,
            'policy': policy,
        })

    except Exception as e:
        logger.exception('Error scanning repository: %s', e)
        err_msg = str(e)
        if 'rate limit' in err_msg.lower():
            msg = 'GitHub API rate limit exceeded. Set GITHUB_TOKEN in .env file or wait and try again.'
        elif 'not found' in err_msg.lower() or '404' in err_msg:
            msg = 'Repository not found. Please check the URL and try again.'
        else:
            msg = 'An internal error occurred while scanning the repository. Please try again later.'
        return Response({'status': 'error', 'message': msg}, status=500)

@api_view(['POST'])
def batch_scan(request):
    urls = request.data.get('urls', [])
    if not urls:
        return Response({'status': 'error', 'message': 'No URLs provided'}, status=400)

    results = []
    github_service = GitHubService()

    for url in urls[:10]:
        try:
            repo = github_service.get_repository(url)
            license_info = github_service.get_license_info(repo)
            risk = license_info.get('risk', 'UNKNOWN')
            policy = github_service.check_policy(license_info.get('key'))
            scan = Scan.objects.create(
                repo_url=url, repo_name=repo.full_name,
                license_name=license_info.get('name', ''),
                license_key=license_info.get('key', ''),
                risk_level=risk, status='completed'
            )
            results.append({
                'repo_url': url, 'repo_name': repo.full_name,
                'license': license_info.get('name', 'Unknown'),
                'risk_level': risk, 'policy': policy,
            })
        except Exception as e:
            err = str(e)
            if 'rate limit' in err.lower():
                err = 'GitHub API rate limit. Add GITHUB_TOKEN to .env'
            results.append({'repo_url': url, 'repo_name': 'Error', 'license': 'Failed', 'risk_level': 'UNKNOWN', 'error': err})

    return Response({'status': 'success', 'results': results})

@api_view(['GET'])
def scan_history(request):
    scans = Scan.objects.all().order_by('-created_at')[:50]
    return Response({
        'status': 'success',
        'scans': [
            {
                'id': str(scan.id),
                'repo_url': scan.repo_url,
                'repo_name': scan.repo_name,
                'status': scan.status,
                'license_name': scan.license_name,
                'risk_level': scan.risk_level,
                'created_at': scan.created_at.isoformat()
            }
            for scan in scans
        ]
    })

@api_view(['GET'])
def license_policies(request):
    policies = LicensePolicy.objects.all().order_by('license_name')
    return Response({
        'status': 'success',
        'policies': [
            {'id': p.id, 'license_key': p.license_key, 'license_name': p.license_name, 'action': p.action}
            for p in policies
        ]
    })

@api_view(['POST'])
def update_policy(request):
    policy_id = request.data.get('id')
    action = request.data.get('action')
    if not policy_id or not action:
        return Response({'status': 'error', 'message': 'Missing id or action'}, status=400)
    try:
        policy = LicensePolicy.objects.get(id=policy_id)
        policy.action = action
        policy.save()
        return Response({'status': 'success', 'message': 'Policy updated'})
    except LicensePolicy.DoesNotExist:
        return Response({'status': 'error', 'message': 'Policy not found'}, status=404)

@api_view(['POST'])
def export_pdf(request):
    scan_data = request.data.get('scan_data', {})
    try:
        pdf_service = PDFService()
        pdf_bytes, filepath = pdf_service.generate_report(scan_data)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="license_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
        return response
    except Exception as e:
        logger.exception('Error generating PDF: %s', e)
        return Response({'status': 'error', 'message': 'Failed to generate PDF report.'}, status=500)
