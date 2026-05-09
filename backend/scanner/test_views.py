from django.test import TestCase, Client

class APITest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_test_api(self):
        resp = self.client.get('/api/test/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('message', data)
        self.assertEqual(data.get('status'), 'success')
