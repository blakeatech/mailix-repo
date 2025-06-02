# Notaic Backend

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.2-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Notaic is a sophisticated email automation and management platform built with FastAPI. It provides user authentication, email processing, and subscription management capabilities through a robust REST API.

## Features

- **Authentication & Authorization**
  - User registration and email verification
  - OAuth2 authentication
  - JWT-based authentication
  - Rate limiting

- **Email Management**
  - Email classification using ML models
  - Email processing and automation
  - Gmail integration

- **Subscription System**
  - Stripe integration for payment processing
  - Subscription management
  - Usage tracking

- **Additional Features**
  - User settings management
  - Account management
  - CORS protection
  - API rate limiting

## Backend Architecture

### API Service Architecture

```mermaid
graph TB
    subgraph "FastAPI Application"
        MAIN[main.py<br/>Application Entry Point]
        DEPS[dependencies.py<br/>Dependency Injection]
    end
    
    subgraph "API Routers"
        AUTH_R[auth_router<br/>/auth/*]
        OAUTH_R[oauth_router<br/>/auth/oauth/*]
        ACCOUNT_R[account_router<br/>/account/*]
        SETTINGS_R[settings_router<br/>/user/*]
        SUB_R[subscription_router<br/>/subscription/*]
    end
    
    subgraph "Service Layer"
        AUTH_S[Authentication Service<br/>JWT + Password Hashing]
        OAUTH_S[OAuth Service<br/>Google Integration]
        EMAIL_S[Email Service<br/>SMTP + Templates]
        GMAIL_S[Gmail Service<br/>API Integration]
        STRIPE_S[Stripe Service<br/>Payment Processing]
        OPENAI_S[OpenAI Service<br/>AI Email Generation]
    end
    
    subgraph "Data Access Layer"
        FIRESTORE[Firestore Client<br/>Database Operations]
        STORAGE[Cloud Storage<br/>File Operations]
    end
    
    subgraph "External APIs"
        GOOGLE[Google APIs<br/>Gmail + OAuth]
        STRIPE_API[Stripe API<br/>Payments]
        OPENAI_API[OpenAI API<br/>GPT Models]
        FIREBASE[Firebase<br/>Authentication]
    end
    
    MAIN --> AUTH_R
    MAIN --> OAUTH_R
    MAIN --> ACCOUNT_R
    MAIN --> SETTINGS_R
    MAIN --> SUB_R
    
    AUTH_R --> AUTH_S
    OAUTH_R --> OAUTH_S
    ACCOUNT_R --> EMAIL_S
    SETTINGS_R --> GMAIL_S
    SUB_R --> STRIPE_S
    
    AUTH_S --> FIRESTORE
    OAUTH_S --> GOOGLE
    EMAIL_S --> FIRESTORE
    GMAIL_S --> GOOGLE
    STRIPE_S --> STRIPE_API
    OPENAI_S --> OPENAI_API
    
    OAUTH_S --> OPENAI_S
    EMAIL_S --> OPENAI_S
    
    style MAIN fill:#009688,color:#fff
    style AUTH_S fill:#4CAF50,color:#fff
    style FIRESTORE fill:#ff6f00,color:#fff
    style GOOGLE fill:#ea4335,color:#fff
    style STRIPE_API fill:#635bff,color:#fff
    style OPENAI_API fill:#10a37f,color:#fff
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI
    participant AUTH as Auth Service
    participant JWT as JWT Handler
    participant DB as Firestore
    participant EMAIL as Email Service
    
    Note over C,EMAIL: User Registration Flow
    C->>API: POST /auth/register
    API->>AUTH: validate_registration()
    AUTH->>DB: check_user_exists()
    DB-->>AUTH: user_not_found
    AUTH->>AUTH: hash_password()
    AUTH->>DB: create_user()
    AUTH->>JWT: create_access_token()
    AUTH->>EMAIL: send_verification_email()
    EMAIL-->>AUTH: email_sent
    AUTH-->>API: registration_success
    API-->>C: {token, message}
    
    Note over C,EMAIL: User Login Flow
    C->>API: POST /auth/signin
    API->>AUTH: authenticate_user()
    AUTH->>DB: get_user_by_email()
    DB-->>AUTH: user_data
    AUTH->>AUTH: verify_password()
    AUTH->>JWT: create_access_token()
    AUTH-->>API: authentication_success
    API-->>C: {token, user_data}
    
    Note over C,EMAIL: OAuth Flow
    C->>API: GET /auth/oauth
    API->>AUTH: initiate_oauth()
    AUTH-->>C: redirect_to_google
    C->>AUTH: oauth_callback
    AUTH->>DB: store_oauth_tokens()
    AUTH->>JWT: create_access_token()
    AUTH-->>C: redirect_with_token
```

### Email Processing Pipeline

```mermaid
graph LR
    subgraph "Email Input"
        GMAIL_API[Gmail API<br/>Email Fetch]
        USER_INPUT[User Input<br/>Draft Request]
    end
    
    subgraph "Processing Pipeline"
        CLASSIFIER[Email Classifier<br/>ML Model]
        PROCESSOR[Email Processor<br/>Content Analysis]
        GENERATOR[AI Generator<br/>OpenAI GPT]
        VALIDATOR[Content Validator<br/>Safety Checks]
    end
    
    subgraph "Storage & Output"
        VECTOR_DB[Vector Store<br/>Email Embeddings]
        FIRESTORE_DB[(Firestore<br/>Drafts & Metadata)]
        RESPONSE[API Response<br/>Generated Content]
    end
    
    GMAIL_API --> CLASSIFIER
    USER_INPUT --> PROCESSOR
    CLASSIFIER --> VECTOR_DB
    PROCESSOR --> GENERATOR
    GENERATOR --> VALIDATOR
    VALIDATOR --> FIRESTORE_DB
    VALIDATOR --> RESPONSE
    
    VECTOR_DB -.-> GENERATOR
    FIRESTORE_DB -.-> PROCESSOR
    
    style CLASSIFIER fill:#FF9800,color:#fff
    style GENERATOR fill:#10a37f,color:#fff
    style VECTOR_DB fill:#9C27B0,color:#fff
    style FIRESTORE_DB fill:#ff6f00,color:#fff
```

### Database Schema

```mermaid
erDiagram
    USERS {
        string id PK
        string email UK
        string full_name
        string password_hash
        string verification_status
        string verification_token
        timestamp token_expiry
        string google_access_token
        string google_refresh_token
        timestamp token_expiry
        boolean onboarding_completed
        boolean is_pro
        int drafts_remaining
        timestamp created_at
        timestamp updated_at
    }
    
    DRAFTS {
        string id PK
        string user_id FK
        string draft_subject
        string draft_body
        string recipient_email
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    SUBSCRIPTIONS {
        string id PK
        string user_id FK
        string stripe_customer_id
        string stripe_subscription_id
        string status
        string plan_type
        timestamp current_period_start
        timestamp current_period_end
        timestamp created_at
    }
    
    EMAIL_CLASSIFICATIONS {
        string id PK
        string user_id FK
        string email_id
        string classification
        float confidence_score
        json metadata
        timestamp processed_at
    }
    
    HELP_TICKETS {
        string id PK
        string user_id FK
        string name
        string email
        string message
        string status
        timestamp created_at
    }
    
    WAITLIST {
        string id PK
        string email UK
        string verification_token
        timestamp token_expiry
        boolean verified
        timestamp verified_at
        timestamp created_at
    }
    
    USERS ||--o{ DRAFTS : creates
    USERS ||--o| SUBSCRIPTIONS : has
    USERS ||--o{ EMAIL_CLASSIFICATIONS : owns
    USERS ||--o{ HELP_TICKETS : submits
```

### Middleware & Security Stack

```mermaid
graph TB
    subgraph "Request Flow"
        REQUEST[Incoming Request]
        RESPONSE[Outgoing Response]
    end
    
    subgraph "Middleware Stack"
        CORS[CORS Middleware<br/>Cross-Origin Requests]
        RATE[Rate Limiter<br/>SlowAPI Integration]
        AUTH[Authentication<br/>JWT Validation]
        VALIDATION[Request Validation<br/>Pydantic Models]
    end
    
    subgraph "Security Components"
        JWT_HANDLER[JWT Handler<br/>Token Management]
        PWD_CONTEXT[Password Context<br/>Bcrypt Hashing]
        OAUTH_HANDLER[OAuth Handler<br/>Google Integration]
    end
    
    subgraph "Error Handling"
        HTTP_EXCEPTION[HTTP Exception Handler]
        RATE_LIMIT_HANDLER[Rate Limit Handler]
        VALIDATION_HANDLER[Validation Handler]
    end
    
    REQUEST --> CORS
    CORS --> RATE
    RATE --> AUTH
    AUTH --> VALIDATION
    VALIDATION --> RESPONSE
    
    AUTH --> JWT_HANDLER
    AUTH --> PWD_CONTEXT
    AUTH --> OAUTH_HANDLER
    
    RATE --> RATE_LIMIT_HANDLER
    AUTH --> HTTP_EXCEPTION
    VALIDATION --> VALIDATION_HANDLER
    
    style CORS fill:#2196F3,color:#fff
    style RATE fill:#FF9800,color:#fff
    style AUTH fill:#4CAF50,color:#fff
    style JWT_HANDLER fill:#9C27B0,color:#fff
```

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/NotaicBackend.git
   cd NotaicBackend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   .\venv\Scripts\activate
   # On Unix or MacOS
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:
   ```env
   # API Configuration
   API_HOST=0.0.0.0
   API_PORT=8000

   # Authentication
   JWT_SECRET_KEY=your_jwt_secret
   JWT_ALGORITHM=HS256

   # External Services
   STRIPE_API_KEY=your_stripe_key
   OPENAI_API_KEY=your_openai_key
   
   # Add other required environment variables
   ```

## Running the Application

1. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

2. Access the API documentation:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## Testing

The project includes both unit tests and end-to-end tests:

```bash
# Run unit tests
pytest tests/unit/

# Run e2e tests
pytest tests/e2e/

# Run all tests with coverage
pytest --cov=app tests/
```

## Project Structure

```
NotaicBackend/
├── auth/                 # Authentication related modules
├── config/              # Configuration files
├── data/                # Data storage and management
├── miscellaneous/       # Utility scripts
├── models/              # ML models and data schemas
├── settings/            # User settings management
├── tests/               # Test suites
│   ├── e2e/            # End-to-end tests
│   └── unit/           # Unit tests
├── utils/               # Utility functions
├── main.py             # Application entry point
├── dependencies.py     # Dependency injection
└── requirements.txt    # Project dependencies
```

## Security

- CORS is configured to allow only specific origins
- Rate limiting is implemented to prevent abuse
- JWT-based authentication
- Secure password hashing
- Environment variable management for sensitive data

## API Documentation

The API documentation is automatically generated and can be accessed at:
- `/docs` - Swagger UI documentation
- `/redoc` - ReDoc documentation

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature/improvement`)
6. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or concerns, please open an issue in the GitHub repository.

---
Built with ❤️ using FastAPI and Python
