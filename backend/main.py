from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
import logging
import time
from auth.auth_service import auth_router
from auth.oauth_service import oauth_router
from auth.account_service import account_router
from settings.settings_service import settings_router
from auth.subscription_service import subscription_router
from services.monitoring import monitoring_service
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# Middleware to track API requests
@app.middleware("http")
async def track_requests(request: Request, call_next):
    # Start timer
    start_time = time.time()
    
    # Get request details
    method = request.method
    url = request.url.path
    
    # Process the request
    try:
        response = await call_next(request)
        
        # Calculate duration
        duration_ms = int((time.time() - start_time) * 1000)
        
        # Track the request
        user_id = None
        if hasattr(request.state, "user") and request.state.user:
            user_id = request.state.user.id
        
        monitoring_service.track_api_request(
            endpoint=url,
            method=method,
            user_id=user_id,
            duration_ms=duration_ms,
            status_code=response.status_code
        )
        
        return response
    except Exception as e:
        logger.error(f"Request error: {str(e)}")
        # Still track the request, but with error status
        monitoring_service.track_api_request(
            endpoint=url,
            method=method,
            status_code=500
        )
        raise

@app.get("/")
@limiter.limit("5/minute")
async def root(request: Request):
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to the Notaic API."}

@app.get("/metrics")
async def get_metrics(request: Request):
    """Return application metrics for monitoring"""
    logger.info("Metrics endpoint accessed")
    return JSONResponse(content=monitoring_service.get_metrics())
