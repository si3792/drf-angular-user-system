from rest_framework.response import Response
from usersystem.serializers import UserSerializer
from rest_framework.views import APIView
# Create your views here.


class AccountView(APIView):
    """
    An API endpoint for managing the current user.

    GET returns basic information about the current user.
    """

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)
