node_modules會跟著傳到Github，你電腦只要載node.js就能用。
但可撥的是Python沒辦法，需要自己pip install模組。
下列為需要自行安裝的模組:
# 直接在NCUACG_NET目錄開啟CMD並輸入install_modules.bat即可

django-cors-headers==4.7.0
django-simple-captcha==0.6.2
djangorestframework>=3.15.0
djangorestframework-simplejwt
dotenv==0.9.9
google==3.0.0
groq>=0.9.0           # 用雲端 Groq
sentence_transformers
tf-keras
psycopg2-binary
bcrypt


# RAG 本地嵌入
sentence-transformers>=2.7.0
numpy>=1.26
python-dotenv>=1.0.1
# 借放一下
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5), # 示例，確保有效期
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256", # 確保與 settings.py 中的 SECRET_KEY 匹配
    "SIGNING_KEY": os.getenv("JWT_SECRET_KEY"), # 確保您有 SECRET_KEY
    "VERIFY_SIGNATURE": True, # 確保驗證簽名
    "AUDIENCE": None,
    "ISSUER": None,
    "JWK_URL": None,
    "LEEWAY": 0,
    "AUTH_HEADER_TYPES": ("Bearer",), # 確保是 Bearer
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id", # 預設是 id
    "USER_ID_CLAIM": "user_id", # 預設是 user_id
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "JTI_CLAIM": "jti",
    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=5),
    "SLIDING_TOKEN_AUTH_HEADER_NAME": "HTTP_SLIDING_TOKEN",
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),
}
