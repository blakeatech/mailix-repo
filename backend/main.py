from fastapi import FastAPI, Request
from auth.auth_service import auth_router
from auth.oauth_service import oauth_router
from auth.account_service import account_router
from settings.settings_service import settings_router
from auth.subscription_service import subscription_router
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Notaic API",
    description="An API for user registration, email verification, OAuth2 authentication, and email automation.",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Allow only https://www.notaic.site
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.notaic.site", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=None,
    expose_headers=[],
    max_age=600,
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(oauth_router, prefix="/auth", tags=["OAuth2"])
app.include_router(account_router, prefix="/account", tags=["Account"])
app.include_router(settings_router, prefix="/user", tags=["User Settings"])
app.include_router(subscription_router, prefix="/subscription", tags=["Subscription"])

@app.get("/")
@limiter.limit("5/minute")
async def root(request: Request):
    return {"message": "Welcome to the Notaic API."}
