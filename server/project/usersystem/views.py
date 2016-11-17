from rest_framework.response import Response
from usersystem.serializers import UserSerializer, UserRegisterSerializer
from rest_framework.views import APIView
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_201_CREATED
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
# Create your views here.


class AccountView(APIView):
    """
    An API endpoint for managing the current user.

    GET returns basic information about the current user.

    POST expects at least one of 'email', 'first_name' or 'last_name' fields.
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
        if User.objects.filter(email=email) or email is None:
            return Response(email, status=HTTP_400_BAD_REQUEST)
        return Response(status=HTTP_200_OK)


class RegisterCheckUsernameView(APIView):
    """
    An API endpoint for checking if an username is taken.

    POST must contain 'username' field. Server returns 400 if username is already used or 200 is it is available
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        username = request.data.get('username', None)
        if User.objects.filter(username=username) or username is None:
            return Response(username, status=HTTP_400_BAD_REQUEST)
        return Response(status=HTTP_200_OK)
