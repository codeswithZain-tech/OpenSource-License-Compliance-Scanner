from django.test import TestCase
from scanner.services.github_service import GitHubService

class LicenseDetailsTest(TestCase):
    def test_get_license_details_mit(self):
        svc = GitHubService()
        details = svc._get_license_details('MIT')
        self.assertEqual(details['key'], 'mit')
        self.assertEqual(details['risk'], 'LOW')
