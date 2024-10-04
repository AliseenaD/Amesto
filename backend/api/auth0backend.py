import json
from urllib.request import urlopen
import logging

from authlib.oauth2.rfc7523 import JWTBearerTokenValidator
from authlib.jose.rfc7517.jwk import JsonWebKey
from authlib.integrations.django_oauth2 import ResourceProtector
from django.conf import settings

logger = logging.getLogger(__name__)

# Class meant to validate access tokens provided in API calls
class Auth0JWTBearerTokenValidator(JWTBearerTokenValidator):
    def __init__(self, domain, audience):
        logger.info(f"Initializing Auth0JWTBearerTokenValidator with domain: {domain}, audience: {audience}")
        issuer = f"https://{domain}/"
        jsonurl = urlopen(f"{issuer}.well-known/jwks.json")
        public_key = JsonWebKey.import_key_set(
            json.loads(jsonurl.read())
        )
        super(Auth0JWTBearerTokenValidator, self).__init__(
            public_key
        )
        self.claims_options = {
            "exp": {"essential": "True"},
            "aud": {"essential": True, "value": audience},
            "iss": {"essential": True, "value": issuer}
        }

    def authenticate_token(self, token_string):
        logger.info("Attempting to authenticate token")
        try:
            claims = super().authenticate_token(token_string)
            logger.info(f"Token authenticated successfully. Claims: {claims}")
            return claims
        except Exception as e:
            logger.error(f"Token authentication failed: {str(e)}")
            raise

    # Print out the token for debugging issues
    def __call__(self, token, scopes=None):
        print(f"Validating token: {token[:10]}")
        try:
            return super().__call__(token, scopes)
        except Exception as e:
            print(f"Token failed: {str(e)}")
            raise

# Initialize the resource protector and give it the validator
require_auth = ResourceProtector()
validator = Auth0JWTBearerTokenValidator(
    settings.AUTH0_DOMAIN, 
    settings.AUTH0_AUDIENCE
)
require_auth.register_token_validator(validator)
print('Validator registered')