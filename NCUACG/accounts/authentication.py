from rest_framework_simplejwt.authentication import JWTAuthentication
import logging
logger = logging.getLogger(__name__)

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        logger.info(f"Request cookies: {request.COOKIES}")
        raw_token = request.COOKIES.get("access_token")
        if raw_token is None:
            logger.error("No access_token cookie found")
            return None
        try:
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            logger.info(f"Authenticated user: {user.username}")
            return user, validated_token
        except Exception as e:
            logger.error(f"Token validation failed: {str(e)}")
            return None