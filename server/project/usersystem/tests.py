from rest_framework.test import APITestCase, APIRequestFactory, APIClient, force_authenticate
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

    def test_anonymous_delete(self):
        client = APIClient()
        response = client.delete('/account/')
        self.assertEqual(response.status_code, 401)

    def test_authenticated_delete(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.delete('/account/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(User.objects.all().filter(
            username='testuser').count(), 0)


class AccountPasswordViewTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create(username='testuser',
                                        email='testuser@foo.bar',
                                        first_name='Test',
                                        last_name='User')

        self.userWithPass = User.objects.create_user(
            'user2', password='password')

    def test_password_get_missing(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.get('/account/password/')
        self.assertEqual(response.status_code, 404)

    def test_password_get_exists(self):

        client = APIClient()
        client.force_authenticate(user=self.userWithPass)
        response = client.get('/account/password/')
        self.assertEqual(response.status_code, 200)

    def test_password_get_unauthenticated(self):

        client = APIClient()
        response = client.get('/account/password/')
        self.assertEqual(response.status_code, 401)

    def test_password_set_unathenticated(self):

        client = APIClient()
        response = client.post('/account/password/', {})
        self.assertEqual(response.status_code, 401)

    def test_password_set_success(self):

        client = APIClient()
        password = 'A' * (settings.PASSWORD_MAX_LENGTH - 1)
        client.force_authenticate(user=self.userWithPass)
        response = client.post('/account/password/', {
            'newPassword':  password,
            'oldPassword': 'password'
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.userWithPass.check_password(password), True)

    def test_password_set_success_2(self):

        client = APIClient()
        password = 'A' * (settings.PASSWORD_MAX_LENGTH - 1)
        client.force_authenticate(user=self.user)
        response = client.post('/account/password/', {
            'newPassword': password
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.user.check_password(password), True)

    def test_password_set_error_wrong_credentials(self):

        client = APIClient()
        client.force_authenticate(user=self.userWithPass)
        response = client.post('/account/password/', {
            'newPassword': 'password',
            'oldPassword': 'INVALID-password'
        })
        self.assertEqual(response.status_code, 400)

    def test_password_set_error_missing_credentials(self):

        client = APIClient()
        client.force_authenticate(user=self.userWithPass)
        response = client.post('/account/password/', {
            'newPassword': 'password'
        })
        self.assertEqual(response.status_code, 400)

    def test_password_set_error_passwords_match(self):

        client = APIClient()
        client.force_authenticate(user=self.userWithPass)
        response = client.post('/account/password/', {
            'newPassword': 'password',
            'oldPassword': 'password'
        })
        self.assertEqual(response.status_code, 400)

    def test_password_set_error_too_short(self):

        client = APIClient()
        client.force_authenticate(user=self.user)
        shortPassword = 'A' * (settings.PASSWORD_MIN_LENGTH - 1)
        response = client.post('/account/password/', {
            'newPassword': shortPassword,
        })
        self.assertEqual(response.status_code, 400)

    def test_password_set_error_too_long(self):

        client = APIClient()
        client.force_authenticate(user=self.user)
        longPassword = 'A' * (settings.PASSWORD_MAX_LENGTH + 1)
        response = client.post('/account/password/', {
            'newPassword': longPassword,
        })
        self.assertEqual(response.status_code, 400)


class RegisterViewTest(APITestCase):

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


class RegisterCheckEmailViewTest(APITestCase):

    def setUp(self):
        self.someUser = User.objects.create(username='testuser',
                                            email='testuser@foo.bar',
                                            first_name='Test',
                                            last_name='User')

    def test_check_email_free(self):
        client = APIClient()
        response = client.post('/register/check-email/', {
            'email': 'available@foo.bar'
        })
        self.assertEqual(response.status_code, 200)

    def test_check_email_used(self):
        client = APIClient()
        response = client.post('/register/check-email/', {
            'email': 'testuser@foo.bar'
        })
        self.assertEqual(response.status_code, 400)

    def test_check_email_invalid_request(self):
        client = APIClient()
        response = client.post('/register/check-email/', {})
        self.assertEqual(response.status_code, 400)


class RegisterCheckUsernameViewTest(APITestCase):

    def setUp(self):
        self.someUser = User.objects.create(username='testuser',
                                            email='testuser@foo.bar',
                                            first_name='Test',
                                            last_name='User')

    def test_check_username_free(self):
        client = APIClient()
        response = client.post('/register/check-username/', {
            'username': 'availableUsername'
        })
        self.assertEqual(response.status_code, 200)

    def test_check_username_used(self):
        client = APIClient()
        response = client.post('/register/check-username/', {
            'username': 'testuser'
        })
        self.assertEqual(response.status_code, 400)

    def test_check_username_invalid_request(self):
        client = APIClient()
        response = client.post('/register/check-username/', {})
        self.assertEqual(response.status_code, 400)
