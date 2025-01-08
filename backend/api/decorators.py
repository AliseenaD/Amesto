from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from .models import User

# Function that requires a certain role for functionality. Will be a decorator
def require_role(required_role):
    def decorator(view_function):
        @wraps(view_function)
        def wrapped_view(self, request, *args, **kwargs):
            try:
                if request.user.role.lower() == required_role:
                    return view_function(self, request, *args, **kwargs)
                else:
                    return Response({"Error": "User does not match role"}, status=status.HTTP_403_FORBIDDEN)
            except User.DoesNotExist:
                return Response({"Error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        return wrapped_view
    return decorator