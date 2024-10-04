from rest_framework.permissions import BasePermission
from .auth0backend import require_auth
import logging

logger = logging.getLogger(__name__)

# A custom permission class for authentication methods for api functionality
class Auth0ResourceProtection(BasePermission):
    def has_permission(self, request, view):
        logger.info("Checking Auth0 permission")
        try:
            token = require_auth.acquire_token(request)
            if token:
                logger.info(f"Token acquired: {str(token)[:10]}...")  # Convert to string before slicing
                # Attach token to the request
                request.auth = token
                return True
            else:
                logger.warning("No token acquired")
                return False
        except Exception as e:
            logger.error(f"Permission denied: {str(e)}")
            return False
