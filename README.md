# Notaic - Email Automation Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.2-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.13-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

<div align="center">
  <img 
    src="demos/notaic-gif.gif" 
    alt="Notaic Demo" 
    width="800" 
    style="border-radius: 8px; border: 2px solid #000;"
  />
</div>

Notaic is a sophisticated email automation and management platform that helps users streamline their email workflows through AI-powered classification, automation, and intelligent processing.

## Key Features

- **Email Management & Automation**
  - AI-powered email classification
  - Automated email processing
  - Smart email routing and organization

- **User Authentication & Security**
  - Multi-factor authentication
  - OAuth2 integration
  - JWT-based secure sessions

- **Subscription Management**
  - Stripe integration for payments
  - Usage-based billing
  - Multiple subscription tiers

- **Analytics & Insights**
  - Email analytics dashboard
  - Usage statistics
  - Performance metrics

## System Architecture

### High-Level Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile App]
    end
    
    subgraph "Frontend Layer"
        NEXTJS[Next.js Frontend<br/>React + TypeScript]
        UI[UI Components<br/>TailwindCSS + Radix]
    end
    
    subgraph "API Gateway"
        LB[Load Balancer]
        CORS[CORS Middleware]
        RATE[Rate Limiting]
    end
    
    subgraph "Backend Services"
        API[FastAPI Backend<br/>Python 3.8+]
        AUTH[Authentication Service<br/>JWT + OAuth2]
        EMAIL[Email Processing Service<br/>AI Classification]
        SUB[Subscription Service<br/>Stripe Integration]
    end
    
    subgraph "AI/ML Layer"
        OPENAI[OpenAI GPT<br/>Email Generation]
        CLASSIFIER[Email Classifier<br/>ML Model]
        VECTOR[Vector Store<br/>Email Embeddings]
    end
    
    subgraph "External Services"
        GMAIL[Gmail API<br/>Email Integration]
        STRIPE[Stripe API<br/>Payment Processing]
        FIREBASE[Firebase<br/>Authentication]
    end
    
    subgraph "Data Layer"
        FIRESTORE[(Firestore<br/>NoSQL Database)]
        STORAGE[(Cloud Storage<br/>File Storage)]
    end
    
    WEB --> NEXTJS
    MOBILE --> NEXTJS
    NEXTJS --> UI
    NEXTJS --> LB
    LB --> CORS
    CORS --> RATE
    RATE --> API
    
    API --> AUTH
    API --> EMAIL
    API --> SUB
    
    EMAIL --> OPENAI
    EMAIL --> CLASSIFIER
    EMAIL --> VECTOR
    
    AUTH --> FIREBASE
    EMAIL --> GMAIL
    SUB --> STRIPE
    
    API --> FIRESTORE
    API --> STORAGE
    
    style NEXTJS fill:#000,color:#fff
    style API fill:#009688,color:#fff
    style OPENAI fill:#10a37f,color:#fff
    style FIRESTORE fill:#ff6f00,color:#fff
    style GMAIL fill:#ea4335,color:#fff
    style STRIPE fill:#635bff,color:#fff
```

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Gateway
    participant B as Backend
    participant AI as AI Service
    participant G as Gmail API
    participant DB as Firestore
    
    U->>F: Login Request
    F->>A: POST /auth/signin
    A->>B: Authenticate User
    B->>DB: Verify Credentials
    DB-->>B: User Data
    B-->>A: JWT Token
    A-->>F: Authentication Response
    F-->>U: Dashboard Access
    
    U->>F: Connect Gmail
    F->>A: GET /auth/oauth
    A->>B: OAuth Flow
    B->>G: Request Authorization
    G-->>B: Access Token
    B->>DB: Store Token
    B->>AI: Process Email History
    AI-->>B: Email Classifications
    B->>DB: Store Classifications
    B-->>A: Success Response
    A-->>F: Gmail Connected
    
    U->>F: Generate Email Draft
    F->>A: POST /email/generate
    A->>B: Process Request
    B->>DB: Get User Context
    B->>AI: Generate Draft
    AI-->>B: Email Draft
    B->>DB: Store Draft
    B-->>A: Draft Response
    A-->>F: Email Draft
    F-->>U: Display Draft
```

### Security Architecture

```mermaid
graph LR
    subgraph "Security Layers"
        subgraph "Frontend Security"
            CSP[Content Security Policy]
            XSS[XSS Protection]
            HTTPS[HTTPS Enforcement]
        end
        
        subgraph "API Security"
            JWT[JWT Authentication]
            OAUTH[OAuth2 Integration]
            RATE_LIMIT[Rate Limiting]
            CORS_SEC[CORS Protection]
        end
        
        subgraph "Data Security"
            ENCRYPT[Data Encryption]
            HASH[Password Hashing]
            TOKEN[Token Management]
        end
        
        subgraph "Infrastructure Security"
            FIREWALL[Cloud Firewall]
            IAM[Identity & Access Management]
            AUDIT[Audit Logging]
        end
    end
    
    CSP --> JWT
    XSS --> OAUTH
    HTTPS --> RATE_LIMIT
    JWT --> ENCRYPT
    OAUTH --> HASH
    RATE_LIMIT --> TOKEN
    ENCRYPT --> FIREWALL
    HASH --> IAM
    TOKEN --> AUDIT
    
    style JWT fill:#4CAF50,color:#fff
    style OAUTH fill:#2196F3,color:#fff
    style ENCRYPT fill:#FF9800,color:#fff
    style FIREWALL fill:#F44336,color:#fff
```

## Project Structure

The project follows a monorepo structure with separate frontend and backend components:

```
notaic/
├── frontend/                # Next.js frontend application
│   ├── app/                # Application routes and pages
│   ├── components/         # React components
│   ├── lib/               # Utility functions
│   └── [More details in frontend/README.md]
│
├── backend/                # FastAPI backend application
│   ├── auth/              # Authentication services
│   ├── config/            # Configuration management
│   ├── models/            # Data models and ML models
│   ├── tests/             # Test suites
│   │   ├── e2e/          # End-to-end tests
│   │   └── unit/         # Unit tests
│   └── [More details in backend/README.md]
│
├── demos/
└── README.md             # This file
```

For detailed documentation:
- [Frontend Documentation](frontend/README.md)
- [Backend Documentation](backend/README.md)

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- Docker and Docker Compose (optional)
- Git

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/blakeamtech/notaic.git
   cd notaic
   ```

2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

4. Configure environment variables:
   - Backend: Copy `.env.example` to `.env`
   - Frontend: Copy `.env.example` to `.env.local`

5. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   uvicorn main:app --reload

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

### Docker Setup

Run the entire stack using Docker Compose:
```bash
docker-compose up --build
```

## Testing

### Backend Testing

```bash
cd backend

# Run unit tests
pytest tests/unit/

# Run e2e tests
pytest tests/e2e/

# Run with coverage
pytest --cov=app tests/
```

### Frontend Testing

```bash
cd frontend

# Run linting
npm run lint

# Type checking
npm run type-check
```

## API Documentation

- Backend API (when running locally):
  - Swagger UI: http://localhost:8000/docs
  - ReDoc: http://localhost:8000/redoc

## Security

- Environment variables for sensitive data
- JWT-based authentication
- CORS protection
- Rate limiting
- Input validation
- XSS prevention
- Secure password hashing

## Deployment

### Backend Deployment

The backend can be deployed to any cloud platform that supports Docker containers or Python applications. Recommended platforms:
- Google Cloud Run
- AWS ECS
- Heroku

### Frontend Deployment

The Next.js frontend can be deployed to:
- Vercel (recommended)
- Netlify
- AWS Amplify

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and development process.

---
Built with ❤️ by the Notaic Team
