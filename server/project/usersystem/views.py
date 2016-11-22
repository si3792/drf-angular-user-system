from rest_framework.response import Response
from usersystem.serializers import UserSerializer, UserRegisterSerializer
from rest_framework.views import APIView
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_201_CREATED, HTTP_404_NOT_FOUND
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from usersystem.settings import PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, LOCAL_OAUTH2_KEY
import requests as makerequest
from usersystem.secrets import SOCIAL_AUTH_GOOGLE_OAUTH2_KEY, SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET
from social.apps.django_app.default.models import UserSocialAuth
# Create your views here.


class AccountView(APIView):
    """
    An API endpoint for managing the current user.

    GET returns basic information about the current user.

    POST expects at least one of 'email', 'first_name' or 'last_name' fields.

    DELETE deletes the current user.
    """

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if not request.data:
            return Response(status=HTTP_400_BAD_REQUEST)
        serializer = UserSerializer(data=request.data, partial=True)

        # Return a 400 response if the data was invalid.
        serializer.is_valid(raise_exception=True)

        request.user.email = serializer.validated_data.get(
            'email', request.user.email)
        request.user.first_name = serializer.validated_data.get(
            'first_name', request.user.first_name)
        request.user.last_name = serializer.validated_data.get(
            'last_name', request.user.last_name)
        request.user.save()
        return Response(status=HTTP_200_OK)

    def delete(self, request):
        # If this is a Google social account, revoke its Google tokens
        socAuth = next(
            iter(UserSocialAuth.get_social_auth_for_user(request.user)), None)
        if socAuth and socAuth.provider == 'google-oauth2':
            refresh_token = socAuth.extra_data.get(
                'refresh_token', socAuth.extra_data['access_token'])
            makerequest.post(
                'https://accounts.google.com/o/oauth2/revoke?token=' + refresh_token)

        request.user.delete()
        return Response(status=HTTP_200_OK)


class AccountPasswordView(APIView):
    """
    An API endpoint for password management (for the current user)

    GET returns 200 if user has a password or 404 otherwise
    POST must contain 'newPassword' field ( and 'oldPassword' if user already has a password )
    """

    def post(self, request):
        newpass = request.data.get('newPassword', None)
        if newpass is None:
            return Response({"message": "Missing 'newPassword' field"}, status=HTTP_400_BAD_REQUEST)

        if len(newpass) < PASSWORD_MIN_LENGTH or len(newpass) > PASSWORD_MAX_LENGTH:
            return Response({"message": "New password doesn't match length requirements"}, status=HTTP_400_BAD_REQUEST)

        if request.user.has_usable_password():
            oldpass = request.data.get('oldPassword', None)
            if oldpass is None:
                return Response({"message": "Missing 'oldPassword' field"}, status=HTTP_400_BAD_REQUEST)

            if not request.user.check_password(oldpass):
                return Response({"message": "'oldPassword' is invalid"}, status=HTTP_400_BAD_REQUEST)

            if oldpass == newpass:
                return Response({"message": "oldPassword and newPassword are identical"}, status=HTTP_400_BAD_REQUEST)

        request.user.set_password(newpass)
        request.user.save()
        return Response(status=HTTP_200_OK)

    def get(self, request):
        if request.user.has_usable_password():
            return Response(status=HTTP_200_OK)
        return Response(status=HTTP_404_NOT_FOUND)


class AccountSocialView(APIView):
    """
    A simple API endpoint for checking if user has connected social account

    GET returns 200 and the name of the social auth provider if user has connected social account or 404 otherwise.
    """

    def get(self, request):
        socAuth = next(
            iter(UserSocialAuth.get_social_auth_for_user(request.user)), None)
        if not socAuth:
            return Response(status=HTTP_404_NOT_FOUND)
        else:
            return Response({"social_provider": socAuth.provider}, status=HTTP_200_OK)


class RegisterView(APIView):
    """
    An API endpoint for user registration.

    POST must contain 'username', 'email', 'first_name', 'last_name' and 'password' fields.
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = UserRegisterSerializer(
            data=request.data, context={'request': request})

        # Return a 400 response if the data was invalid.
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        return Response(status=HTTP_201_CREATED)


class RegisterCheckEmailView(APIView):
    """
    A simple API endpoint for checking if an user with a given email exists.

    POST must contain 'email' field. Server returns 400 if email is already used or 200 otherwise.
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get('email', None)
        if email is None:
            return Response({"message": "'email' field is missing"}, status=HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email):
            return Response(status=HTTP_400_BAD_REQUEST)

        return Response(status=HTTP_200_OK)


class RegisterCheckUsernameView(APIView):
    """
    An API endpoint for checking if an username is taken.

    POST must contain 'username' field. Server returns 400 if username is already used or 200 is it is available
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        username = request.data.get('username', None)
        if username is None:
            return Response({"message": "'username' field is missing"}, status=HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username):
            return Response(status=HTTP_400_BAD_REQUEST)

        return Response(status=HTTP_200_OK)


class GoogleAuthCodeView(APIView):
    """
    An API endpoint which expects a google auth code, which is then used for social login.

    POST must contain a 'code' field with the authorization code. This code is
    exchanged for google's access and refresh tokens, which are stored on server.
    Afterwards local access and refresh tokens are generated and returned, which are
    then used to communicate with our API.

    Go to https://developers.google.com/identity/sign-in/web/server-side-flow
    for more information on the google server-side auth flow implemented here.
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        code = request.data.get('code', None)
        if not code:
            return Response({"message": "Authorization code missing"}, status=HTTP_400_BAD_REQUEST)

        # Exchange auth code for tokens
        googleurl = 'https://accounts.google.com/o/oauth2/token'
        exchangeCodeRequest = makerequest.post(
            googleurl,
            data={
                'code': code,
                'redirect_uri': 'postmessage',
                'client_id': SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
                'client_secret': SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET,
                'grant_type': 'authorization_code'
            })

        # We can now exchange the external token for a token linked to *OUR*
        # OAuth2 provider
        exchangeExternalTokenUrl = 'http://' + \
            request.META['HTTP_HOST'] + '/social-auth/convert-token'

        externalToken = exchangeCodeRequest.json().get('access_token', None)
        if externalToken is None:
            return Response({"message": "Server could not retrieve external tokens"}, status=HTTP_400_BAD_REQUEST)

        exchangeExternalTokenRequest = makerequest.post(exchangeExternalTokenUrl, data={
            'grant_type': 'convert_token',
            'client_id': LOCAL_OAUTH2_KEY,
            'backend': 'google-oauth2',
            'token': externalToken}
        )

        # Get user and add exchangeCodeRequest's (Google's) refresh token to UserSocialAuth extra_data
        # This is a bit hacky, @TODO use python-social-auth's pipeline
        # mechanism instead
        if exchangeExternalTokenRequest.status_code is not makerequest.codes.ok:
            # If the social account's email is already used in another account,
            # throw an error
            return Response({"message": "User with that email already exists!"}, status=HTTP_400_BAD_REQUEST)

        getUserUrl = 'http://' + request.META['HTTP_HOST'] + '/account/'
        getUserRequest = makerequest.get(getUserUrl, data={}, headers={
            'Authorization': 'Bearer ' + exchangeExternalTokenRequest.json()['access_token']})

        refreshToken = exchangeCodeRequest.json().get('refresh_token', None)
        if refreshToken is not None:
            user = User.objects.all().filter(
                username=getUserRequest.json()['username'])[0]
            userSocial = user.social_auth.get(provider='google-oauth2')
            userSocial.extra_data['refresh_token'] = refreshToken
            userSocial.save()

        return Response(exchangeExternalTokenRequest.json())
