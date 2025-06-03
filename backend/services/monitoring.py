"""
Monitoring service for Notaic
Provides functionality to track and expose application metrics
"""
import time
import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta
from collections import defaultdict, deque
from threading import Lock

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MonitoringService:
    """
    Service for tracking and exposing application metrics
    """
    _instance = None
    _lock = Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(MonitoringService, cls).__new__(cls)
                cls._instance._initialize()
            return cls._instance
    
    def _initialize(self):
        """Initialize the monitoring service"""
        # Email processing metrics
        self.email_counts = {
            "processed": 0,
            "classified": 0,
            "prioritized": 0,
            "responded": 0,
            "failed": 0
        }
        
        # Category distribution
        self.category_counts = defaultdict(int)
        
        # Priority distribution
        self.priority_counts = defaultdict(int)
        
        # Response time tracking (last 100 emails)
        self.response_times = deque(maxlen=100)
        
        # Error tracking
        self.errors = deque(maxlen=50)
        
        # API request counts
        self.api_requests = defaultdict(int)
        
        # User activity
        self.user_activity = defaultdict(int)
        
        # Rate tracking (per minute)
        self.minute_rates = {
            "emails": defaultdict(int),
            "api_calls": defaultdict(int)
        }
        
        # Current minute for rate tracking
        self.current_minute = datetime.now().strftime("%Y-%m-%d %H:%M")
        
        logger.info("Monitoring service initialized")
    
    def track_email_processing(self, stage: str, email_id: str, user_id: str, 
                              category: str = None, priority: str = None, 
                              duration_ms: int = None, error: str = None):
        """
        Track an email processing event
        
        Args:
            stage (str): Processing stage (e.g., 'ingest', 'classify', 'prioritize', 'respond')
            email_id (str): ID of the email being processed
            user_id (str): ID of the user who owns the email
            category (str, optional): Email category if classified
            priority (str, optional): Email priority if prioritized
            duration_ms (int, optional): Processing duration in milliseconds
            error (str, optional): Error message if processing failed
        """
        logger.info(f"Email {email_id} at stage '{stage}' for user {user_id}")
        
        # Update minute-based rates
        current_min = datetime.now().strftime("%Y-%m-%d %H:%M")
        if current_min != self.current_minute:
            self.current_minute = current_min
        
        self.minute_rates["emails"][self.current_minute] += 1
        
        # Update user activity
        self.user_activity[user_id] += 1
        
        # Update stage-specific metrics
        if stage == "process":
            self.email_counts["processed"] += 1
        elif stage == "classify":
            self.email_counts["classified"] += 1
            if category:
                self.category_counts[category] += 1
        elif stage == "prioritize":
            self.email_counts["prioritized"] += 1
            if priority:
                self.priority_counts[priority] += 1
        elif stage == "respond":
            self.email_counts["responded"] += 1
        
        # Track response time
        if duration_ms is not None:
            self.response_times.append(duration_ms)
        
        # Track errors
        if error:
            self.email_counts["failed"] += 1
            self.errors.append({
                "timestamp": datetime.now().isoformat(),
                "email_id": email_id,
                "user_id": user_id,
                "stage": stage,
                "error": error
            })
    
    def track_api_request(self, endpoint: str, method: str, user_id: str = None, 
                         duration_ms: int = None, status_code: int = 200):
        """
        Track an API request
        
        Args:
            endpoint (str): API endpoint path
            method (str): HTTP method
            user_id (str, optional): ID of the user making the request
            duration_ms (int, optional): Request duration in milliseconds
            status_code (int): HTTP status code
        """
        # Update API request counts
        key = f"{method} {endpoint}"
        self.api_requests[key] += 1
        
        # Update minute-based rates
        current_min = datetime.now().strftime("%Y-%m-%d %H:%M")
        if current_min != self.current_minute:
            self.current_minute = current_min
        
        self.minute_rates["api_calls"][self.current_minute] += 1
        
        # Update user activity if user_id provided
        if user_id:
            self.user_activity[user_id] += 1
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get all metrics as a dictionary
        
        Returns:
            Dict[str, Any]: All metrics
        """
        # Calculate average response time
        avg_response_time = 0
        if self.response_times:
            avg_response_time = sum(self.response_times) / len(self.response_times)
        
        # Calculate rates (last 5 minutes)
        now = datetime.now()
        last_5_min = [(now - timedelta(minutes=i)).strftime("%Y-%m-%d %H:%M") for i in range(5)]
        
        email_rates = [self.minute_rates["emails"].get(minute, 0) for minute in last_5_min]
        api_rates = [self.minute_rates["api_calls"].get(minute, 0) for minute in last_5_min]
        
        # Compile all metrics
        return {
            "timestamp": datetime.now().isoformat(),
            "email_processing": {
                "counts": self.email_counts,
                "categories": dict(self.category_counts),
                "priorities": dict(self.priority_counts),
                "avg_response_time_ms": avg_response_time,
                "rates": {
                    "per_minute": email_rates
                }
            },
            "api": {
                "requests": dict(self.api_requests),
                "rates": {
                    "per_minute": api_rates
                }
            },
            "errors": list(self.errors),
            "users": {
                "active_count": len(self.user_activity),
                "most_active": sorted(self.user_activity.items(), key=lambda x: x[1], reverse=True)[:5]
            }
        }

# Create singleton instance
monitoring_service = MonitoringService()
