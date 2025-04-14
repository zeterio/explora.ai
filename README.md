# Explora.AI

Your personal AI learning guide - explore concepts, highlight text, and create custom learning paths. Explora.AI helps you learn more effectively by enabling natural conversations with AI, organizing insights, and generating personalized learning materials.

## Features

- **Chat with AI**: Start natural conversations about any topic to learn and explore new concepts
- **Learning Paths**: Pin important messages and concepts to create personalized learning tracks
- **Text Highlighting**: Highlight specific text and branch into related topics for deeper exploration
- **Self-Assessment Tagging**: Tag content based on your understanding to focus learning efforts
- **Diagnostic Challenges**: Test your understanding with AI-generated challenges
- **Guide Generation**: Convert your learning journey into comprehensive guides for review

## Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/explora.ai.git
   cd explora.ai
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Copy the `.env.example` file to `.env` and update the environment variables:

   ```bash
   cp .env.example .env
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
explora.ai/
├── scripts/            # Task Master scripts
├── src/
│   ├── app/            # Next.js app folder
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── assets/         # Static assets
├── public/             # Public static files
├── tasks/              # Task Master tasks
├── .eslintrc.js        # ESLint configuration
├── .prettierrc         # Prettier configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Development Guidelines

### Code Style

This project follows a consistent code style enforced by ESLint and Prettier:

- Run linting checks: `npm run lint`
- Format code: `npm run format`

Pre-commit hooks will automatically run these checks when you commit changes.

### Commit Guidelines

We use conventional commits to maintain a clean and descriptive git history:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Changes that don't affect code functionality (formatting, etc.)
- `refactor:` - Code changes that neither fix bugs nor add features
- `test:` - Adding or modifying tests
- `chore:` - Changes to the build process or auxiliary tools

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes and ensure tests pass
3. Update documentation if necessary
4. Submit a pull request to the `main` branch

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **AI Integration**: OpenAI/Anthropic APIs
- **Data Storage**: MongoDB/PostgreSQL
- **Authentication**: Auth0
- **Deployment**: Vercel/AWS

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI/Anthropic for AI capabilities
- Task Master for project management
- Contributors and maintainers

## Deployment

This project is configured for continuous deployment using Vercel. Every push to the `main` branch triggers an automatic deployment to production, while pushes to other branches create preview deployments.

### CI/CD Pipeline

The project uses GitHub Actions for continuous integration and Vercel for continuous deployment:

1. **Continuous Integration (GitHub Actions)**
   - Runs on every push and pull request
   - Checks code formatting
   - Runs linting
   - Performs type checking
   - Builds the project
   - Caches build output for faster deployments

2. **Continuous Deployment (Vercel)**
   - Automatic deployments for every push
   - Preview deployments for pull requests
   - Production deployment from the `main` branch
   - Environment variables managed through Vercel dashboard

### Manual Deployment

To deploy manually:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to production:
   ```bash
   npm run deploy
   ```

### Environment Variables

The following environment variables need to be configured in Vercel:

- `NEXT_PUBLIC_APP_URL`: The public URL of your application
- `NEXT_PUBLIC_APP_VERSION`: Current version of the application
- `NEXTAUTH_URL`: Authentication callback URL (same as APP_URL)
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

Configure these in the Vercel dashboard under Project Settings > Environment Variables.

### Backend Deployment

The backend API routes are deployed alongside the frontend using Vercel's serverless functions. Each API route is automatically converted into a serverless function with the following configuration:

- Memory: 1024MB
- Execution timeout: 10 seconds
- Automatic scaling based on demand
- Edge network distribution

#### API Route Testing

The CI pipeline includes specific tests for API routes:

1. **Health Check**: Verifies the `/api/health` endpoint is responding correctly
2. **Route Validation**: Ensures all API routes export the required HTTP methods
3. **Security Headers**: Validates that appropriate security headers are set

#### API Monitoring

Monitor your API endpoints through the Vercel dashboard:

- Real-time logs
- Performance metrics
- Error tracking
- Request/response monitoring

#### Environment Variables for Backend

Additional environment variables for backend services:

- `DATABASE_URL`: Connection string for the database (when implemented)
- `AI_SERVICE_API_KEY`: API key for AI service integration
- `JWT_SECRET`: Secret for JWT token generation
- `CORS_ORIGINS`: Allowed origins for CORS

Configure these in the Vercel dashboard under Project Settings > Environment Variables.

## Frontend-Backend Integration

The application uses a unified architecture where the frontend and backend are integrated within the same Next.js project:

### Architecture Overview

- **Frontend**: React with Next.js App Router
- **Backend**: Next.js API Routes (serverless functions)
- **API Client**: Custom fetch-based client with environment-specific configuration

### Environment Configuration

Environment variables control how the frontend and backend interact:

```
# Frontend URL and version
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_VERSION=1.0.0

# API URL (used by frontend to access backend)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Feature flags
NEXT_PUBLIC_ENABLE_GUIDES=true
NEXT_PUBLIC_ENABLE_SELF_ASSESSMENT=true
```

### API Communication

The application uses a centralized API client located in `src/lib/api.ts`. This client:

1. Automatically selects the correct API base URL based on the environment
2. Handles authentication through cookies/sessions
3. Provides consistent error handling
4. Offers a simple interface for making HTTP requests

Example usage:

```typescript
import { api } from '@/lib/api';

// Get data from the API
const data = await api.get<ResponseType>('endpoint-path');

// Post data to the API
const response = await api.post<ResponseType>('endpoint-path', { key: 'value' });
```

### Testing the Connection

The application includes an API status component that verifies connectivity between frontend and backend. This component:

1. Makes a request to the `/api/health` endpoint
2. Displays connection status (connected, loading, or error)
3. Shows API version and environment information when connected

## Database Configuration

Explora.AI uses Supabase as its database and authentication provider. The database is configured with the following components:

- **Profiles**: User profiles with preferences and metadata
- **Learning Paths**: Customizable learning journeys 
- **Highlights**: Text highlights saved by users
- **Assessments**: Self-assessment challenges and diagnostics

### Setting Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your Supabase URL and API keys to `.env.local`:
   ```
   SUPABASE_URL=your-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run the database setup helper:
   ```
   npm run setup-supabase
   ```
4. Follow the instructions provided by the setup script

### Authentication

Explora.AI uses Next-Auth with Supabase Auth as the backend. The following authentication methods are supported:

- Email/Password
- Magic Link Email
- Google OAuth
- GitHub OAuth

Each authentication method is configured in the NextAuth setup and integrated with Supabase.
