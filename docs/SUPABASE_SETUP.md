# Supabase Setup Guide for Explora.AI

This guide walks through the setup and configuration of Supabase as the database and authentication provider for the Explora.AI project.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Supabase Project Setup](#supabase-project-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Schema](#database-schema)
6. [Authentication Configuration](#authentication-configuration)
7. [Next.js Integration](#nextjs-integration)
8. [Testing the Setup](#testing-the-setup)
9. [Common Issues](#common-issues)

## Overview

Explora.AI uses Supabase as its primary database and authentication provider. The application leverages the following Supabase features:

- PostgreSQL database for data storage
- Row-Level Security (RLS) for data protection
- Supabase Auth for user authentication
- OAuth providers integration (Google, GitHub)

## Prerequisites

Before you begin, ensure you have:

- A Supabase account (create one at [supabase.com](https://supabase.com))
- Node.js 16+ and npm installed
- The Explora.AI codebase cloned locally

## Supabase Project Setup

1. **Create a new Supabase project**:
   - Go to [app.supabase.com](https://app.supabase.com)
   - Click "New Project"
   - Enter a name for your project (e.g., "explora-ai-dev")
   - Choose a database password (store it securely)
   - Select a region closest to your users
   - Click "Create new project"

2. **Get your API keys**:
   - Once your project is created, go to the project dashboard
   - Click on the "Settings" icon (gear) at the bottom of the sidebar
   - Go to "API" in the sidebar
   - Under "Project API keys", copy:
     - Project URL (https://your-project-id.supabase.co)
     - `anon` public key
     - `service_role` secret key (keep this secure)

## Environment Configuration

1. **Set up environment variables**:
   - Copy `.env.example` to `.env.local` if you haven't already
   - Add your Supabase configuration:

   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Configure Next Auth URL**:
   - Set `NEXTAUTH_URL` to your development URL (usually `http://localhost:3000`)
   - Generate a secure random string for `NEXTAUTH_SECRET` (used for encrypting tokens)

## Database Schema

The Explora.AI database schema includes these main tables:

- `profiles`: Extended user information
- `learning_paths`: Learning journeys created by users
- `learning_path_items`: Individual items in learning paths
- `highlights`: Text highlights saved by users
- `assessments`: Self-assessment challenges
- `assessment_questions`: Questions for assessments

To set up the schema:

1. **Run the setup helper**:
   ```
   npm run setup-supabase
   ```

2. **Execute the SQL schema**:
   - Go to the Supabase dashboard
   - Navigate to "SQL Editor"
   - Click "New Query"
   - Copy the contents of `scripts/schema.sql`
   - Paste into the editor and click "Run"

## Authentication Configuration

1. **Enable authentication providers**:
   - In your Supabase dashboard, go to "Authentication" → "Providers"
   - Enable "Email" provider:
     - Toggle "Enable Email Signup"
     - Set "Confirm email" according to your preference
   
   - For OAuth providers (optional):
     - Enable "Google" and configure with your Google OAuth credentials
     - Enable "GitHub" and configure with your GitHub OAuth App credentials

2. **Configure redirect URLs**:
   - Go to "Authentication" → "URL Configuration"
   - Add redirect URLs:
     - For development: `http://localhost:3000/api/auth/callback/*`
     - For production: `https://your-domain.com/api/auth/callback/*`

## Next.js Integration

The codebase already includes the necessary files for Supabase integration:

- `src/lib/db/supabase.ts`: Supabase client setup
- `src/lib/db/connection.ts`: Database connection utility
- `src/lib/db/users.ts`: User-related database operations
- `src/types/database.ts`: TypeScript types for the database schema

The Next.js API routes are also set up to use Supabase:

- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth.js configuration
- `src/app/api/auth/register/route.ts`: User registration endpoint
- `src/app/api/health/route.ts`: Health check endpoint

## Testing the Setup

To verify your Supabase setup is working:

1. **Start the development server**:
   ```
   npm run dev
   ```

2. **Test the health endpoint**:
   - Visit `http://localhost:3000/api/health` in your browser
   - You should see a JSON response with `status: "healthy"` and database connection information
   - If there's an error, check your environment variables and Supabase configuration

3. **Test authentication**:
   - Visit `http://localhost:3000/login`
   - Try to register a new account
   - Verify the user is created in Supabase (Dashboard → Authentication → Users)

## API Testing

The project includes several scripts to test API endpoints and database operations:

### Basic API Test

Test the basic API endpoints including the health check and registration:

```bash
npm run test-api
```

This script:
- Tests the `/api/health` endpoint to verify database connectivity
- Tests the `/api/auth/register` endpoint to create a new user

### Authentication Flow Test

Test the complete authentication flow:

```bash
npm run test-auth
```

This script:
- Creates a test user via registration
- Tests login with credentials
- Validates the session
- Tests accessing protected endpoints

### Database CRUD Operations Test

Test CRUD operations directly against the Supabase database:

```bash
npm run test-db
```

This script:
- Creates a test user in Supabase Auth
- Tests profile creation, reading, and updating
- Tests learning path and items operations
- Tests highlight creation and deletion
- Cleans up all test data

### Manual API Testing

You can also test API endpoints manually using tools like:

1. **curl**:
   ```bash
   # Health check
   curl http://localhost:3000/api/health
   
   # Registration
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

2. **Postman or Insomnia**:
   - Import the provided Postman collection (see `docs/api-collection.json`)
   - Set up the environment variables for your local setup
   - Use the collection to test all API endpoints

3. **Browser DevTools**:
   - For GET requests, simply visit the URL in your browser
   - For POST/PUT/DELETE, use the Network tab to send the requests
   - Using the Console: 
     ```javascript
     fetch('/api/health').then(r => r.json()).then(console.log)
     ```

## Common Issues

### Connection Errors

If you see "Database connection error":

- Check that your Supabase URL and API keys are correct
- Verify that your database is active in the Supabase dashboard
- Check for any firewalls or network restrictions

### Authentication Issues

If user registration or login fails:

- Check if the user exists in Supabase Auth (Authentication → Users)
- Verify that the correct authentication providers are enabled
- Check if email confirmation is required but not confirmed

### Schema Errors

If you see errors related to missing tables or columns:

- Verify that the SQL schema was executed successfully
- Check for any error messages in the SQL Editor
- Review the table structure in the Supabase dashboard (Table Editor)

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [NextAuth.js Documentation](https://next-auth.js.org/) 