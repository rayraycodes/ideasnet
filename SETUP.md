# Setup Guide

This guide will help you set up Ideas.net from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **PostgreSQL Database** - We recommend using [Supabase](https://supabase.com) (free tier available)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_GITHUB/ideas.net.git
cd ideas.net
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be set up (takes ~2 minutes)
4. Go to **Project Settings → Database**
5. Copy the **Connection string** (use the "URI" format)
6. You'll need this for the `DATABASE_URL` in your `.env` file

### 4. Configure Environment Variables

#### Backend `.env` File

Create a `.env` file in the root directory:

```env
# Database Connection (from Supabase)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public&sslmode=require"

# Supabase (for client-side features)
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Google OAuth (Optional - for Google Sign-In)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"

# Session Secret (generate a random string)
SESSION_SECRET="your-session-secret-key"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**To generate secure secrets:**

```bash
# On Linux/Mac
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### Frontend `.env` File

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_SUPABASE_URL=https://[PROJECT-REF].supabase.co
REACT_APP_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

### 5. Set Up the Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push the schema to your database
npx prisma db push
```

This will create all the necessary tables in your database.

### 6. Verify Database Connection

```bash
# Start the backend server
npm run dev:server
```

In another terminal, test the connection:

```bash
curl http://localhost:3001/api/db/test
```

You should see:
```json
{
  "status": "connected",
  "database": "OK",
  "hasDatabaseUrl": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 7. Start the Application

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- **Backend API:** http://localhost:3001
- **Frontend:** http://localhost:3000

Open http://localhost:3000 in your browser.

### 8. Create Your First Account

1. Go to http://localhost:3000/register
2. Fill in the registration form
3. You'll be automatically logged in after registration

## Troubleshooting

### Database Connection Issues

**Error: "Connection refused" or "Connection timeout"**

1. Check your `DATABASE_URL` is correct
2. Ensure your IP is allowed in Supabase (Settings → Database → Connection Pooling)
3. For local development, you may need to add `0.0.0.0/0` temporarily (not recommended for production)

**Error: "Table does not exist"**

Run the database migrations:
```bash
npx prisma db push
```

### Port Already in Use

**Error: "Port 3001 is already in use"**

Kill the process using the port:

```bash
# On Linux/Mac
lsof -ti:3001 | xargs kill

# On Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process
```

Or change the port in your `.env` file:
```env
PORT=3002
```

### Frontend Can't Connect to Backend

1. Ensure the backend is running on the correct port
2. Check `REACT_APP_API_URL` in `client/.env`
3. Verify CORS settings in `src/server/index.ts`

### JWT Token Issues

1. Ensure `JWT_SECRET` is set in `.env`
2. The secret should be at least 32 characters long
3. Restart the server after changing `JWT_SECRET`

## Next Steps

- Read the [README.md](README.md) for project overview
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- Explore the API endpoints in the documentation
- Start building features!

## Getting Help

- Check existing [GitHub Issues](https://github.com/YOUR_GITHUB/ideas.net/issues)
- Create a new issue if you encounter a bug
- Join our discussions for questions

---

Happy coding! 🚀

