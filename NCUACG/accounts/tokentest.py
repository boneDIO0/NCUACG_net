from rest_framework_simplejwt.tokens import AccessToken
from accounts.models import User
def JWTtest(access_token):
    token = AccessToken(access_token)
    user_id = token['user_id']  # 或 id
    user = User.objects.get(id=user_id)
    print(user)