import requests
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from jose import jwt
from django.core.cache import cache
from django.conf import settings

User = get_user_model()

class Auth0Authentication(JWTAuthentication):
    def __init__(self):
        self.jwks_client = None
        self.jwks = self.get_jwks()

    def get_jwks(self):
        # Fetch and cache the jwks
        jwks = cache.get('auth0_jwks')
        if not jwks:
            jwks_url = f'https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json'
            jwks = requests.get(jwks_url).json()
            cache.set('auth0_jwks', jwks, timeout=3600)
        return jwks
    
    def get_public_key(self, token):
        # Get the public key for verifying the token
        try:
            kid = jwt.get_unverified_header(token)['kid']
            for key in self.jwks['keys']:
                if key['kid'] == kid:
                    return jwt.algorithms.RSAAlgorithm.from_jwk(key)
        except Exception:
            raise InvalidToken('Invalid token header')
        
    def authenticate(self, request):
        try:
            header = self.get_header(request)
            if header is None:
                return None
            
            raw_token = self.get_raw_token(header)
            if raw_token is None:
                return None
            
            public_key = self.get_public_key(raw_token)

            # Decode and verify the Auth0 token
            auth0_payload = jwt.decode(
                raw_token,
                public_key,
                algorithms=['RS256'],
                audience=settings.AUTH0_AUDIENCE,
                issuer=f'https://{settings.AUTH0_DOMAIN}/'
            )

            auth0_user_id = auth0_payload['sub']
            email = auth0_payload.get(f"{settings.AUTH0_AUDIENCE}/email")
            roles = auth0_payload.get(f"{settings.AUTH0_AUDIENCE}/roles", ['user'])

            # Get or create a user baces on the Auth0 ID
            user, created = User.objects.get_or_create(
                auth0_id=auth0_user_id,
                defaults={
                    'username': auth0_user_id,
                    'email': email,
                    'role': roles[0] if roles else 'user'
                }
            )

            if not created:
                # Update the user's role if it has changed
                if user.role != roles[0]:
                    user.role = roles[0]
                    user.save()

            return user, auth0_payload
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.JWTClaimsError:
            raise AuthenticationFailed('Invalid claims')
        except jwt.JWTError:
            raise AuthenticationFailed('Invalid token')

# Class for checking user roles
class isAdminUser(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role.lower() == 'admin'