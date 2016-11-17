from rest_framework.test import APITestCase, APIRequestFactory, APIClient, force_authenticate
from usersystem.views import RegisterView, RegisterCheckEmailView, RegisterCheckUsernameView
from usersystem.views import AccountView
from django.contrib.auth.models import User
from usersystem import settings


class AccountViewTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create(username='testuser',
                                        email='testuser@foo.bar',
                                        first_name='Test',
                                        last_name='User')

    def test_anonymous_get(self):
        client = APIClient()
        response = client.get('/account/')
        self.assertEqual(response.status_code, 401)

    def test_authenticated_get(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.get('/account/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'testuser@foo.bar')
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')

    def test_anonymous_post(self):
        client = APIClient()
        response = client.post('/account/', {})
        self.assertEqual(response.status_code, 401)

    def test_authenticated_valid_post(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.post('/account/', {
            'first_name': 'newfirstname',
            'last_name': 'newlastname',
            'email': 'new@email.bar'
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.user.first_name, 'newfirstname')
        self.assertEqual(self.user.last_name, 'newlastname')
        self.assertEqual(self.user.email, 'new@email.bar')

    def test_authenticated_invalid_post(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.post('/account/', {
            'email': 'NOTAVALIDMAIL'
        })
        self.assertEqual(response.status_code, 400)

    def test_authenticated_empty_post(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.post('/account/', {})
        self.assertEqual(response.status_code, 400)


class RegistrationTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create(username='testuser',
                                        email='testuser@foo.bar',
                                        first_name='Test',
                                        last_name='User')

    def test_email_checking_free(self):
        client = APIClient()
        response = client.post('/register/check-email/', {
            'email': 'freemail@foo.bar'
        })
        self.assertEqual(response.status_code, 200)

    def test_email_checking_used(self):
        client = APIClient()
        response = client.post('/register/check-email/', {
            'email': 'testuser@foo.bar'
        })
        self.assertEqual(response.status_code, 400)

    def test_username_checking_free(self):
        client = APIClient()
        response = client.post('/register/check-username/', {
            'username': 'free_username'
        })
        self.assertEqual(response.status_code, 200)

    def test_username_checking_used(self):
        client = APIClient()
        response = client.post('/register/check-username/', {
            'username': 'testuser'
        })
        self.assertEqual(response.status_code, 400)

    def test_registration_valid(self):
        client = APIClient()
        username = 'A' * (settings.USERNAME_MAX_LENGTH - 1)
        password = 'A' * (settings.PASSWORD_MAX_LENGTH - 1)
        response = client.post('/register/', {
            'username': username,
            'password': password,
            'email': 'email@foo.bar',
            'first_name': 'Fname',
            'last_name': 'Lname'
        })
        self.assertEqual(response.status_code, 201)
        newuser = User.objects.all().filter(email='email@foo.bar')[0]
        self.assertEqual(newuser.first_name, 'Fname')
        self.assertEqual(newuser.last_name, 'Lname')

    def test_registration_username_used(self):
        client = APIClient()
        response = client.post('/register/', {
            'username': 'testuser',
            'password': 'newpass',
            'email': 'email@foo.bar',
            'first_name': 'Fname',
            'last_name': 'Lname'
        })
        self.assertEqual(response.status_code, 400)

    def test_registration_email_used(self):
        client = APIClient()
        response = client.post('/register/', {
            'username': 'newuser',
            'password': 'newpass',
            'email': 'testuser@foo.bar',
            'first_name': 'Fname',
            'last_name': 'Lname'
        })
        self.assertEqual(response.status_code, 400)

    def test_registartion_short_password(self):
        client = APIClient()
        shortPassword = 'A' * (settings.PASSWORD_MIN_LENGTH - 1)
        response = client.post('/register/', {
            'username': 'newuser',
            'password': shortPassword,
            'email': 'email@foo.bar',
            'first_name': 'Fname',
            'last_name': 'Lname'
        })
        self.assertEqual(response.status_code, 400)

    def test_registartion_long_password(self):
        client = APIClient()
        longPassword = 'A' * (settings.PASSWORD_MAX_LENGTH + 1)
        response = client.post('/register/', {
            'username': 'newuser',
            'password': longPassword,
            'email': 'email@foo.bar',
            'first_name': 'Fname',
            'last_name': 'Lname'
        })
        self.assertEqual(response.status_code, 400)

    def test_registartion_short_username(self):
        client = APIClient()
        shortUsername = 'A' * (settings.USERNAME_MIN_LENGTH - 1)
        response = client.post('/register/', {
            'username': shortUsername,
            'password': 'newpass',
            'email': 'email@foo.bar',
            'first_name': 'Fname',
            'last_name': 'Lname'
        })
        self.assertEqual(response.status_code, 400)

    def test_registartion_long_username(self):
        client = APIClient()
        longUsername = 'A' * (settings.USERNAME_MAX_LENGTH + 1)
        response = client.post('/register/', {
            'username': longUsername,
            'password': 'newpass',
            'email': 'email@foo.bar',
            'first_name': 'Fname',
            'last_name': 'Lname'
        })
        self.assertEqual(response.status_code, 400)

    def test_registartion_missing_data(self):
        client = APIClient()
        response = client.post('/register/', {
            'username': 'username',
            'password': 'newpass'
        })
        self.assertEqual(response.status_code, 400)
