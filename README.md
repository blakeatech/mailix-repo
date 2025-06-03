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

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NOTAIC PLATFORM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │   Web Browser   │    │   Mobile App    │    │   API Clients   │          │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘          │
│           │                       │                       │                 │
│           └───────────────────────┼───────────────────────┘                 │
│                                   │                                         │
│  ┌─────────────────────────────────┼─────────────────────────────────────┐  │
│  │                    FRONTEND LAYER                                     │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │  │
│  │  │   Next.js App   │    │  React Components│    │  TailwindCSS    │   │  │
│  │  │   (TypeScript)  │    │   & UI Library   │    │   Styling       │   │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    │  │
│  └─────────────────────────────────┼─────────────────────────────────────┘  │
│                                   │                                         │
│                            ┌──────┴──────┐                                  |
│                            │  API Gateway │                                 │
│                            │ (CORS, Auth) │                                 │
│                            └──────┬──────┘                                  │
│                                   │                                         │
│  ┌─────────────────────────────────┼─────────────────────────────────────┐  │
│  │                     BACKEND LAYER                                     │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │  │
│  │  │   FastAPI App   │    │  Authentication │    │  Email Service  │    │  │
│  │  │   (Python)      │    │   & OAuth2      │    │   Processing    │    │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │  │
│  │  │  Subscription   │    │ LangGraph Agent │    │ Vector Database │    │  │
│  │  │   Management    │    │    Workflow     │    │     (Pinecone)  │    │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │  │
│  │  │   Monitoring    │    │   AI/ML Models  │    │   Data Access   │    │  │
│  │  │    Service      │    │  (OpenAI GPT)   │    │     Layer       │    │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    │  │
│  └─────────────────────────────────┼─────────────────────────────────────┘  │
│                                   │                                         │
│  ┌─────────────────────────────────┼─────────────────────────────────────┐  │
│  │                    EXTERNAL SERVICES                                  │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │  │
│  │  │   Gmail API     │    │   Stripe API    │    │   OpenAI API    │    │  │
│  │  │  (Email Sync)   │    │   (Payments)    │    │ (AI Generation) │    │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    |  │
│  │                                                                       │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │  │
│  │  │   Firestore     │    │  Cloud Storage  │    │  Firebase Auth  │    │  │
│  │  │   (Database)    │    │ (File Storage)  │    │  (OAuth Provider)│   │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    |  │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Request Flow:
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │───▶ Frontend │───▶   API   │───▶ Backend  │───▶ Database │
│ Action  │    │  (UI)   │    │Gateway  │    │Service  │    │ Store   │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
     ▲              │              │              │              │
     │              ▼              ▼              ▼              ▼
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│Response │◀───   UI     │◀─── Response │◀─── Processed│◀───  Data  │
│to User  │    │Update   │    │ Data    │    │ Result  │    │Retrieved│
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

Enhanced Email Processing Pipeline:
```
┌─────────┐    ┌──────────────────────────────────────────────────────────┐     ┌─────────┐
│ Gmail   │───▶│                LangGraph Agent Workflow                  │───▶│ Store & │
│  API    │    │  ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐    │ Respond │
└─────────┘    │  │Classify │───▶ Prioritize│───▶  Retrieve│───▶ Generate│    └─────────┘
               │  └─────────┘    └──────────┘    └──────────┘    └─────────┘ │
               │                                                             │
               │                  ┌───────────────────────────┐              │
               │                  │ Vector Database (Pinecone)│              │
               │                  └───────────────────────────┘              │
               │                               ▲                             │
               └───────────────────────────────┼─────────────────────────────┘
                                               │
                                               │
┌──────────────────────────────────────────────┴───────────────────────────┐
│                         CI/CD & Monitoring                               │
│                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐       │
│  │  GitHub Actions │    │  Metrics API    │    │  Structured     │       │
│  │ (CI/CD Pipeline)│    │  Endpoint       │    │  Logging        │       │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘       │
└──────────────────────────────────────────────────────────────────────────┘
```
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
│   ├── agents/            # LangGraph agents for email processing
│   ├── auth/              # Authentication services
│   ├── config/            # Configuration management
│   ├── models/            # Data models and ML models
│   ├── prompts/           # Example prompts for AI processing
│   ├── services/          # Core services including vector database
│   ├── tests/             # Test suites
│   │   ├── e2e/          # End-to-end tests
│   │   └── unit/         # Unit tests
│   └── [More details in backend/README.md]
│
├── demos/
├── .github/               # GitHub Actions workflows
└── README.md             # This file
```

For detailed documentation:
- [Frontend Documentation](frontend/README.md)
- [Backend Documentation](backend/README.md)

## Agentic Workflow

Notaic implements an intelligent email processing pipeline using LangGraph for orchestrating a multi-stage workflow:

```
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│  Classify │────▶│ Prioritize │────▶│  Retrieve  │────▶│  Generate │
│   Email   │     │   Email    │     │  Similar   │     │  Response │
└───────────┘     └───────────┘     │   Emails   │     └───────────┘
                                     └───────────┘
```

The workflow consists of the following stages:

1. **Classification**: Analyzes incoming emails to determine category, urgency, and required actions
2. **Prioritization**: Determines the priority level and suggested response timeframe
3. **Memory Retrieval**: Searches for similar past emails to provide context
4. **Response Generation**: Creates appropriate responses based on email content and context

This workflow is implemented in `backend/agents/email_agent.py` using LangGraph's state management and conditional branching capabilities. The system leverages vector embeddings stored in Pinecone or Weaviate to enable memory-aware responses.

## Monitoring & Observability

Notaic includes comprehensive monitoring and observability features:

- **Structured Logging**: All pipeline stages include detailed logging with `logging.info()` calls
- **Metrics Endpoint**: The `/metrics` API endpoint exposes real-time processing statistics
- **Performance Tracking**: Response times and throughput metrics are automatically collected
- **Error Tracking**: Detailed error logs with context for debugging and analysis

The monitoring system tracks:
- Email processing volumes and success rates
- Category and priority distributions
- API request patterns and response times
- User activity metrics

## Continuous Integration & Deployment

The project uses GitHub Actions for automated testing and deployment:

- **Automated Testing**: Runs pytest on all backend code
- **Code Quality**: Enforces style and quality standards with flake8
- **Conditional Deployment**: Optionally triggers deployment on successful builds

The CI/CD pipeline is configured in `.github/workflows/backend.yml` and runs automatically on pushes to the main branch.

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
