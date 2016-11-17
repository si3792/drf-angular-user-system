from rest_framework.response import Response
from usersystem.serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
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
