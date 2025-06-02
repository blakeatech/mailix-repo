# Notaic Frontend

[![Next.js](https://img.shields.io/badge/Next.js-14.2.13-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

Modern, responsive frontend for Notaic - an email automation and management platform. Built with Next.js, React, TypeScript, and TailwindCSS.

## ✨ Features

- **Modern Tech Stack**
  - Next.js 14 with App Router
  - React 18 with Hooks
  - TypeScript for type safety
  - TailwindCSS for styling

- **UI Components**
  - Radix UI primitives
  - Custom components
  - Responsive design
  - Dark/Light mode support

- **Data Visualization**
  - Chart.js integration
  - Tremor components
  - Interactive dashboards

- **Authentication**
  - Secure user authentication
  - Protected routes
  - OAuth integration

- **Payment Integration**
  - Stripe payment processing
  - Subscription management
  - Secure checkout flow

## Frontend Architecture

### Application Architecture

```mermaid
graph TB
    subgraph "Next.js App Router"
        LAYOUT[app/layout.tsx<br/>Root Layout]
        PAGES[Page Components<br/>app/*/page.tsx]
        LOADING[Loading States<br/>loading.tsx]
        ERROR[Error Boundaries<br/>error.tsx]
    end
    
    subgraph "Component Layer"
        UI[UI Components<br/>components/ui/*]
        SHARED[Shared Components<br/>components/shared/*]
        PAGES_COMP[Page Components<br/>components/*]
        FORMS[Form Components<br/>React Hook Form]
    end
    
    subgraph "State Management"
        LOCAL[Local State<br/>useState/useReducer]
        CONTEXT[React Context<br/>Global State]
        STORAGE[Local Storage<br/>Token Management]
        CACHE[API Cache<br/>SWR/React Query]
    end
    
    subgraph "Styling & UI"
        TAILWIND[TailwindCSS<br/>Utility Classes]
        RADIX[Radix UI<br/>Primitives]
        FRAMER[Framer Motion<br/>Animations]
        CHARTS[Chart.js<br/>Data Visualization]
    end
    
    subgraph "External Services"
        API[Backend API<br/>FastAPI]
        STRIPE[Stripe<br/>Payment Processing]
        OAUTH[OAuth Providers<br/>Google]
    end
    
    LAYOUT --> PAGES
    PAGES --> PAGES_COMP
    PAGES_COMP --> UI
    PAGES_COMP --> SHARED
    PAGES_COMP --> FORMS
    
    PAGES_COMP --> LOCAL
    PAGES_COMP --> CONTEXT
    PAGES_COMP --> STORAGE
    PAGES_COMP --> CACHE
    
    UI --> TAILWIND
    UI --> RADIX
    SHARED --> FRAMER
    PAGES_COMP --> CHARTS
    
    PAGES_COMP --> API
    FORMS --> STRIPE
    PAGES_COMP --> OAUTH
    
    style LAYOUT fill:#000,color:#fff
    style TAILWIND fill:#38B2AC,color:#fff
    style API fill:#009688,color:#fff
    style STRIPE fill:#635bff,color:#fff
```

### Component Hierarchy

```mermaid
graph TB
    subgraph "App Structure"
        ROOT[app/layout.tsx<br/>Root Layout]
        
        subgraph "Public Pages"
            HOME[app/page.tsx<br/>Landing Page]
            SIGNIN[app/signin/page.tsx<br/>Sign In]
            EXAMPLE[app/example/page.tsx<br/>Examples]
        end
        
        subgraph "Protected Pages"
            DASHBOARD[app/dashboard/page.tsx<br/>Dashboard]
            SETTINGS[app/settings/page.tsx<br/>Settings]
            PRO[app/pro/page.tsx<br/>Premium]
            HELP[app/help/page.tsx<br/>Help & Support]
        end
    end
    
    subgraph "Component Library"
        subgraph "Page Components"
            GET_STARTED[GetStartedPage]
            SIGNIN_COMP[SignInPage]
            DASHBOARD_COMP[DashboardPage]
            SETTINGS_COMP[SettingsPage]
            PREMIUM_COMP[PremiumPage]
        end
        
        subgraph "UI Components"
            BUTTON[Button]
            INPUT[Input]
            CARD[Card]
            MODAL[Modal]
            DROPDOWN[Dropdown]
        end
        
        subgraph "Shared Components"
            HEADER[Header]
            SIDEBAR[Sidebar]
            FOOTER[Footer]
            LOADING[LoadingSpinner]
            ERROR_COMP[ErrorBoundary]
        end
    end
    
    ROOT --> HOME
    ROOT --> SIGNIN
    ROOT --> EXAMPLE
    ROOT --> DASHBOARD
    ROOT --> SETTINGS
    ROOT --> PRO
    ROOT --> HELP
    
    HOME --> GET_STARTED
    SIGNIN --> SIGNIN_COMP
    DASHBOARD --> DASHBOARD_COMP
    SETTINGS --> SETTINGS_COMP
    PRO --> PREMIUM_COMP
    
    GET_STARTED --> BUTTON
    GET_STARTED --> CARD
    SIGNIN_COMP --> INPUT
    SIGNIN_COMP --> BUTTON
    DASHBOARD_COMP --> HEADER
    DASHBOARD_COMP --> SIDEBAR
    
    style ROOT fill:#000,color:#fff
    style DASHBOARD_COMP fill:#4CAF50,color:#fff
    style BUTTON fill:#2196F3,color:#fff
    style CARD fill:#FF9800,color:#fff
```

### State Management Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant S as State
    participant API as Backend API
    participant LS as Local Storage
    
    Note over U,LS: Authentication Flow
    U->>C: Login Action
    C->>API: POST /auth/signin
    API-->>C: {token, user_data}
    C->>LS: Store Token
    C->>S: Update Auth State
    S-->>C: Re-render UI
    C-->>U: Dashboard View
    
    Note over U,LS: Data Fetching Flow
    U->>C: Navigate to Dashboard
    C->>LS: Get Token
    C->>API: GET /dashboard/data
    API-->>C: Dashboard Data
    C->>S: Update Dashboard State
    S-->>C: Re-render Components
    C-->>U: Updated Dashboard
    
    Note over U,LS: Form Submission Flow
    U->>C: Submit Form
    C->>S: Validate Form Data
    S-->>C: Validation Result
    C->>API: POST /api/endpoint
    API-->>C: Success Response
    C->>S: Update UI State
    S-->>C: Show Success Message
    C-->>U: Feedback
```

### UI Component System

```mermaid
graph LR
    subgraph "Design System"
        TOKENS[Design Tokens<br/>Colors, Spacing, Typography]
        THEME[Theme Configuration<br/>tailwind.config.ts]
    end
    
    subgraph "Base Components"
        BUTTON[Button<br/>Primary, Secondary, Ghost]
        INPUT[Input<br/>Text, Email, Password]
        CARD[Card<br/>Header, Content, Footer]
        MODAL[Modal<br/>Dialog, Drawer]
    end
    
    subgraph "Composite Components"
        FORM[Form Components<br/>Login, Register, Settings]
        DASHBOARD[Dashboard Widgets<br/>Charts, Stats, Tables]
        NAVIGATION[Navigation<br/>Header, Sidebar, Breadcrumbs]
    end
    
    subgraph "Page Templates"
        AUTH_TEMPLATE[Authentication Pages]
        DASHBOARD_TEMPLATE[Dashboard Layout]
        SETTINGS_TEMPLATE[Settings Layout]
    end
    
    TOKENS --> THEME
    THEME --> BUTTON
    THEME --> INPUT
    THEME --> CARD
    THEME --> MODAL
    
    BUTTON --> FORM
    INPUT --> FORM
    CARD --> DASHBOARD
    MODAL --> NAVIGATION
    
    FORM --> AUTH_TEMPLATE
    DASHBOARD --> DASHBOARD_TEMPLATE
    NAVIGATION --> SETTINGS_TEMPLATE
    
    style TOKENS fill:#9C27B0,color:#fff
    style BUTTON fill:#2196F3,color:#fff
    style FORM fill:#4CAF50,color:#fff
    style AUTH_TEMPLATE fill:#FF9800,color:#fff
```

### Data Flow & API Integration

```mermaid
graph TB
    subgraph "Frontend Data Layer"
        COMPONENTS[React Components]
        HOOKS[Custom Hooks<br/>useAuth, useAPI]
        CONTEXT[Context Providers<br/>AuthContext]
        STORAGE[Browser Storage<br/>localStorage, sessionStorage]
    end
    
    subgraph "API Layer"
        AXIOS[Axios Client<br/>HTTP Requests]
        INTERCEPTORS[Request/Response<br/>Interceptors]
        ERROR_HANDLER[Error Handling<br/>Global Error Boundary]
    end
    
    subgraph "Backend Integration"
        AUTH_API[Authentication API<br/>/auth/*]
        USER_API[User Management API<br/>/account/*]
        EMAIL_API[Email Processing API<br/>/email/*]
        PAYMENT_API[Payment API<br/>/subscription/*]
    end
    
    subgraph "External Services"
        STRIPE_JS[Stripe.js<br/>Payment Processing]
        GOOGLE_OAUTH[Google OAuth<br/>Authentication]
    end
    
    COMPONENTS --> HOOKS
    HOOKS --> CONTEXT
    HOOKS --> STORAGE
    HOOKS --> AXIOS
    
    AXIOS --> INTERCEPTORS
    INTERCEPTORS --> ERROR_HANDLER
    
    AXIOS --> AUTH_API
    AXIOS --> USER_API
    AXIOS --> EMAIL_API
    AXIOS --> PAYMENT_API
    
    COMPONENTS --> STRIPE_JS
    COMPONENTS --> GOOGLE_OAUTH
    
    style COMPONENTS fill:#61DAFB,color:#000
    style HOOKS fill:#4CAF50,color:#fff
    style AXIOS fill:#009688,color:#fff
    style STRIPE_JS fill:#635bff,color:#fff
```

### Responsive Design System

```mermaid
graph LR
    subgraph "Breakpoints"
        SM[sm: 640px<br/>Mobile]
        MD[md: 768px<br/>Tablet]
        LG[lg: 1024px<br/>Desktop]
        XL[xl: 1280px<br/>Large Desktop]
    end
    
    subgraph "Layout Components"
        GRID[CSS Grid<br/>Dashboard Layout]
        FLEX[Flexbox<br/>Component Layout]
        CONTAINER[Container<br/>Max Width Control]
    end
    
    subgraph "Responsive Features"
        NAV[Navigation<br/>Mobile Menu Toggle]
        SIDEBAR[Sidebar<br/>Collapsible on Mobile]
        TABLES[Tables<br/>Horizontal Scroll]
        MODALS[Modals<br/>Full Screen on Mobile]
    end
    
    SM --> GRID
    MD --> FLEX
    LG --> CONTAINER
    XL --> CONTAINER
    
    GRID --> NAV
    FLEX --> SIDEBAR
    CONTAINER --> TABLES
    CONTAINER --> MODALS
    
    style SM fill:#FF5722,color:#fff
    style MD fill:#FF9800,color:#fff
    style LG fill:#4CAF50,color:#fff
    style XL fill:#2196F3,color:#fff
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/NotaicFrontend.git
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   # Add other required environment variables
   ```

### Development

Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
# or
yarn build
```

### Running Production Build

```bash
npm run start
# or
yarn start
```

## 📁 Project Structure

```
frontend/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── [...routes]/    # Application routes
├── components/         # React components
│   ├── ui/            # UI components
│   └── shared/        # Shared components
├── lib/               # Utility functions
├── public/            # Static assets
├── styles/           # Global styles
├── types/            # TypeScript types
└── config/           # Configuration files
```

## 🎨 Styling

- TailwindCSS for utility-first styling
- Custom theme configuration
- Dark mode support
- Responsive design system

## 🔧 Configuration Files

- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - TailwindCSS configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.mjs` - PostCSS configuration

## 🐳 Docker Support

Build the Docker image:
```bash
docker build -t notaic-frontend .
```

Run the container:
```bash
docker run -p 3000:3000 notaic-frontend
```

## 🧪 Testing

```bash
# Run ESLint
npm run lint

# Run type checking
npm run type-check
```

## 📝 Development Guidelines

1. **Code Style**
   - Follow TypeScript best practices
   - Use functional components and hooks
   - Implement proper error handling
   - Write meaningful comments

2. **Component Structure**
   - Keep components small and focused
   - Use proper file naming conventions
   - Implement proper prop typing
   - Follow atomic design principles

3. **State Management**
   - Use React hooks effectively
   - Implement proper data fetching
   - Handle loading and error states

## 🔒 Security Best Practices

- Environment variables for sensitive data
- Input validation and sanitization
- Secure API communication
- Protected routes implementation
- XSS prevention

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Support

For support, please open an issue in the GitHub repository or contact the development team.

---
Built with ❤️ using Next.js and React
