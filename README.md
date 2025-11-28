# Ideas.net

A collaborative platform for sharing, validating, and building startup ideas. Connect founders, investors, makers, and mentors in a modern, AI-augmented community.

---

## 🚀 Project Overview

Ideas.net is an open-source platform where anyone can:
- **Post and refine startup ideas** with rich descriptions, problem/solution statements, and tags
- **Gather feedback and validation** from the community through comments and votes
- **Upvote, comment, and express interest** ("Would Invest", "Would Use", "Would Pay")
- **Collaborate in real time** with live updates for comments and votes via WebSocket
- **Leverage AI-powered features** (planned) for discussion summaries and idea validation

**Target users:** Founders, investors, indie hackers, mentors, and innovation enthusiasts.

---

## ✨ Key Features

### Core Features (Implemented)
- ✅ **Idea Submission:** Create rich idea profiles with tags, problem/solution, target market, and business model
- ✅ **Discussion Threads:** Comment, ask questions, and give feedback on ideas with nested replies
- ✅ **Voting & Validation:** Upvote, "Would Invest", "Would Use", "Would Pay", and downvote signals
- ✅ **Real-time Collaboration:** Live updates for comments and votes via Socket.io
- ✅ **User Authentication:** JWT-based auth with email/password and Google OAuth support
- ✅ **User Profiles:** Customizable profiles with skills, interests, and social links
- ✅ **Private Messaging:** Direct messages between users
- ✅ **Notifications:** Real-time notifications for user activities
- ✅ **Minimalist, Responsive UI:** Mobile-first, distraction-free design with Tailwind CSS

### Planned Features
- 🔄 **AI Summaries:** Summarize discussions with OpenAI
- 🔄 **AI Brainstorming:** AI-powered idea generation assistance
- 🔄 **AI Validation:** AI-powered idea validation and feedback

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (React)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Pages      │  │  Components  │  │  Contexts    │          │
│  │  - Home      │  │  - Navbar    │  │  - Auth      │          │
│  │  - Ideas     │  │  - Footer    │  │  - Socket    │          │
│  │  - Create    │  └──────────────┘  └──────────────┘          │
│  │  - Profile   │                                                │
│  └──────────────┘                                                │
│         │                                                         │
│         │ HTTP/REST API                                          │
│         │ WebSocket (Socket.io)                                  │
│         ▼                                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Routes    │  │  Middleware  │  │   Utils      │          │
│  │  - /auth    │  │  - Auth      │  │  - Database  │          │
│  │  - /ideas   │  │  - Error     │  │  - JWT       │          │
│  │  - /votes   │  │  - RateLimit │  │  - Logger    │          │
│  │  - /comments│  └──────────────┘  └──────────────┘          │
│  │  - /users   │                                                │
│  │  - /messages│                                                │
│  └──────────────┘                                                │
│         │                                                         │
│         │ Prisma ORM                                             │
│         ▼                                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────────┐
│              Database (PostgreSQL via Supabase)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Users      │  │   Ideas      │  │   Comments   │          │
│  │   Votes      │  │   Messages   │  │ Notifications│          │
│  │   Follows    │  │ IdeaMembers  │  │  AISummaries│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
User Action (Frontend)
    │
    ├─► HTTP Request → Express Router → Middleware (Auth/RateLimit)
    │                                      │
    │                                      ▼
    │                                 Controller/Route Handler
    │                                      │
    │                                      ▼
    │                                 Prisma ORM → PostgreSQL
    │                                      │
    │                                      ▼
    │                                 Response ←────────┘
    │                                      │
    └──────────────────────────────────────┘
                    │
                    ▼
            Socket.io Event
                    │
                    ▼
        Real-time Update (All Clients)
```

### Database Schema Overview

```
User (1) ──< (N) Idea
  │              │
  │              │ (1)
  │              ▼
  │          Comment
  │              │
  │              │ (N)
  │              ▼
  │          Vote
  │
  ├──< (N) Follow (N) ──> User
  │
  ├──< (N) Message (N) ──> User
  │
  └──< (N) Notification
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API, React Query
- **Routing:** React Router v6
- **Real-time:** Socket.io-client
- **HTTP Client:** Axios
- **UI Components:** Headless UI, Heroicons
- **Forms:** React Hook Form
- **Notifications:** React Hot Toast
- **Animations:** Framer Motion

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** JWT, Passport.js (Google OAuth)
- **Real-time:** Socket.io
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** Joi
- **Logging:** Custom logger utility

### DevOps & Tools
- **Package Manager:** npm
- **Build Tool:** TypeScript Compiler
- **Development:** Nodemon, Concurrently
- **Code Quality:** ESLint, Prettier

---

## ⚡ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL database (Supabase recommended)
- Git

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
cd client && npm install && cd ..
```

### 3. Set Up Environment Variables

#### Backend (Root `.env`)

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?schema=public&sslmode=require"

# Supabase (for client-side auth if needed)
SUPABASE_URL="https://PROJECT_REF.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"

# Session
SESSION_SECRET="your-session-secret-key"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# OpenAI (Optional - for AI features)
OPENAI_API_KEY="your-openai-api-key"
```

#### Frontend (`client/.env`)

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_SUPABASE_URL=https://PROJECT_REF.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Set Up the Database

#### Option A: Using Supabase (Recommended)

1. Create a new project on [Supabase](https://supabase.com)
2. Get your connection string from **Project Settings → Database**
3. Copy the connection string to `DATABASE_URL` in your `.env` file
4. Run Prisma migrations:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npx prisma db push

# Or run migrations
npx prisma migrate deploy
```

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database: `createdb ideas_net`
3. Update `DATABASE_URL` in `.env`
4. Run migrations as above

#### Verify Database Connection

```bash
# Test database connection
curl http://localhost:3001/api/db/test
```

### 5. Start the Application

#### Development Mode (Both Frontend & Backend)

```bash
npm run dev
```

This will start:
- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:3000

#### Production Build

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

### 6. (Optional) Open Prisma Studio

```bash
npm run db:studio
```

This opens a GUI to view and edit your database at http://localhost:5555

---

## 📁 Project Structure

```
ideas.net/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   │   └── layout/   # Layout components (Navbar, Footer)
│   │   ├── contexts/     # React Context providers
│   │   │   ├── AuthContext.tsx
│   │   │   └── SocketContext.tsx
│   │   ├── pages/        # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Ideas.tsx
│   │   │   ├── IdeaDetail.tsx
│   │   │   ├── CreateIdea.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── AuthCallback.tsx
│   │   ├── utils/        # Utility functions
│   │   │   └── supabase.ts
│   │   ├── App.tsx       # Main app component
│   │   └── index.tsx    # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
├── prisma/                # Prisma schema and migrations
│   ├── schema.prisma     # Database schema definition
│   └── migrations/       # Database migration files
│
├── src/                   # Backend source code
│   ├── config/          # Configuration files
│   │   └── passport.ts  # Passport.js OAuth configuration
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # Authentication middleware
│   │   └── errorHandler.ts
│   ├── server/          # Server code
│   │   ├── index.ts     # Express app setup
│   │   └── routes/      # API route handlers
│   │       ├── auth.ts
│   │       ├── ideas.ts
│   │       ├── votes.ts
│   │       ├── comments.ts
│   │       ├── users.ts
│   │       ├── messages.ts
│   │       ├── notifications.ts
│   │       └── ai.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   └── utils/           # Utility functions
│       ├── database.ts  # Prisma client
│       ├── jwt.ts       # JWT utilities
│       └── logger.ts    # Logging utility
│
├── dist/                 # Compiled TypeScript (generated)
├── .env                  # Environment variables (not in git)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔌 API Documentation

### Base URL

- **Development:** `http://localhost:3001/api`
- **Production:** `https://your-domain.com/api`

### Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication (`/api/auth`)

##### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "password": "securepassword",
  "role": "ENTHUSIAST" // Optional: BUILDER, INVESTOR, MENTOR, ENTHUSIAST
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ENTHUSIAST"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

##### Google OAuth
```http
GET /api/auth/google
# Redirects to Google OAuth
```

```http
GET /api/auth/google/callback
# OAuth callback (handled automatically)
```

#### Ideas (`/api/ideas`)

##### Get All Ideas
```http
GET /api/ideas
```

**Response:**
```json
[
  {
    "id": "clx...",
    "title": "AI-Powered Code Review",
    "slug": "ai-powered-code-review-abc123",
    "description": "...",
    "problem": "...",
    "solution": "...",
    "author": {
      "id": "clx...",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "upvoteCount": 42,
    "commentCount": 15,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

##### Get Idea by Slug
```http
GET /api/ideas/:slug
```

##### Create Idea (Auth Required)
```http
POST /api/ideas
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Startup Idea",
  "description": "A brief description",
  "problem": "The problem it solves",
  "solution": "How it solves the problem",
  "targetMarket": "Startups and SMEs",
  "businessModel": "SaaS subscription",
  "tags": "ai,saas,automation",
  "industry": "Technology",
  "technology": "React, Node.js",
  "isPublic": true
}
```

##### Update Idea (Auth Required)
```http
PUT /api/ideas/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  ...
}
```

##### Delete Idea (Auth Required)
```http
DELETE /api/ideas/:id
Authorization: Bearer <token>
```

#### Votes (`/api/votes`)

##### Vote on Idea (Auth Required)
```http
POST /api/votes/idea/:ideaId
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "UPVOTE" // UPVOTE, DOWNVOTE, INVEST_INTEREST, WOULD_USE, WOULD_PAY
}
```

##### Remove Vote (Auth Required)
```http
DELETE /api/votes/idea/:ideaId
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "UPVOTE"
}
```

#### Comments (`/api/comments`)

##### Get Comments for Idea
```http
GET /api/comments/idea/:ideaId
```

##### Create Comment (Auth Required)
```http
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This is a great idea!",
  "ideaId": "clx...",
  "parentId": null, // Optional: for nested comments
  "type": "FEEDBACK" // FEEDBACK, QUESTION, SUGGESTION, CRITIQUE
}
```

##### Update Comment (Auth Required)
```http
PUT /api/comments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment text"
}
```

##### Delete Comment (Auth Required)
```http
DELETE /api/comments/:id
Authorization: Bearer <token>
```

#### Users (`/api/users`)

##### Get Current User Profile (Auth Required)
```http
GET /api/users/me
Authorization: Bearer <token>
```

##### Get User by Username
```http
GET /api/users/:username
```

##### Update User Profile (Auth Required)
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Software developer and entrepreneur",
  "skills": ["JavaScript", "React", "Node.js"],
  "interests": ["AI", "Startups"],
  "location": "San Francisco, CA",
  "website": "https://johndoe.com",
  "linkedin": "johndoe",
  "twitter": "johndoe",
  "github": "johndoe"
}
```

#### Messages (`/api/messages`)

##### Get Conversations (Auth Required)
```http
GET /api/messages/conversations
Authorization: Bearer <token>
```

##### Get Messages with User (Auth Required)
```http
GET /api/messages/user/:userId?limit=50&offset=0
Authorization: Bearer <token>
```

##### Send Message (Auth Required)
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "clx...",
  "content": "Hello! I'm interested in your idea."
}
```

##### Mark Messages as Read (Auth Required)
```http
PUT /api/messages/read/:userId
Authorization: Bearer <token>
```

#### Notifications (`/api/notifications`)

##### Get Notifications (Auth Required)
```http
GET /api/notifications?limit=50&offset=0
Authorization: Bearer <token>
```

##### Mark Notification as Read (Auth Required)
```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

##### Mark All Notifications as Read (Auth Required)
```http
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

#### Health & Database

##### Health Check
```http
GET /health
```

##### Database Connection Test
```http
GET /api/db/test
```

---

## 🔐 Security Features

- **JWT Authentication:** Secure token-based authentication
- **Password Hashing:** bcrypt with 12 salt rounds
- **Rate Limiting:** Prevents abuse with configurable limits
- **CORS:** Configured for specific origins
- **Helmet:** Security headers for Express
- **Input Validation:** Comprehensive validation on all inputs
- **SQL Injection Protection:** Prisma ORM prevents SQL injection
- **XSS Protection:** Helmet and input sanitization

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Google OAuth authentication
- [ ] Create, read, update, delete ideas
- [ ] Vote on ideas (all vote types)
- [ ] Create and reply to comments
- [ ] Real-time updates via WebSocket
- [ ] User profile management
- [ ] Private messaging
- [ ] Notifications

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## 🚀 Deployment

### Environment Setup

1. Set `NODE_ENV=production` in your production `.env`
2. Use a production-grade `JWT_SECRET`
3. Configure CORS for your production domain
4. Set up SSL/TLS certificates
5. Use connection pooling for database (Supabase pooler recommended)

### Build for Production

```bash
npm run build
```

### Recommended Hosting

- **Frontend:** Vercel, Netlify, or AWS S3 + CloudFront
- **Backend:** Heroku, Railway, AWS EC2, or DigitalOcean
- **Database:** Supabase (recommended) or AWS RDS

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run linting:** `npm run lint`
5. **Commit your changes:** `git commit -m 'Add amazing feature'`
6. **Push to the branch:** `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Community

- **GitHub Issues:** Report bugs and request features
- **Discussions:** Join our GitHub Discussions for Q&A
- **Email:** [Add your contact email]

---

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core idea submission and browsing
- ✅ User authentication and profiles
- ✅ Comments and voting system
- ✅ Real-time updates
- ✅ Private messaging

### Phase 2 (In Progress)
- 🔄 AI-powered discussion summaries
- 🔄 Advanced search and filtering
- 🔄 Idea analytics dashboard
- 🔄 Email notifications

### Phase 3 (Planned)
- 📋 AI brainstorming assistant
- 📋 Idea validation scoring
- 📋 Team collaboration features
- 📋 Investment tracking
- 📋 Mobile app (React Native)

---

## 🙏 Acknowledgments

- Built with ❤️ by the Ideas.net team
- Inspired by Product Hunt, Hacker News, and Indie Hackers
- Powered by amazing open-source technologies

---

**Let's build the future of startup collaboration, together!** 🚀
