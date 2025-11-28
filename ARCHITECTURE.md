# Ideas.net Architecture Documentation

This document provides a comprehensive overview of the Ideas.net system architecture, design decisions, and technical implementation details.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagrams](#architecture-diagrams)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Design](#api-design)
6. [Authentication & Authorization](#authentication--authorization)
7. [Real-time Communication](#real-time-communication)
8. [Security Architecture](#security-architecture)
9. [Deployment Architecture](#deployment-architecture)
10. [Performance Considerations](#performance-considerations)

---

## System Overview

Ideas.net is a full-stack web application built with a modern, scalable architecture. The system follows a three-tier architecture pattern:

1. **Presentation Layer:** React frontend with TypeScript
2. **Application Layer:** Node.js/Express backend API
3. **Data Layer:** PostgreSQL database via Supabase

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Application (SPA)                  │   │
│  │  • React Router for navigation                        │   │
│  │  • Context API for state management                   │   │
│  │  • React Query for server state                       │   │
│  │  • Socket.io-client for real-time                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTP/REST + WebSocket
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer (Server)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Express.js API Server                     │   │
│  │  • RESTful API endpoints                              │   │
│  │  • Socket.io server for real-time                      │   │
│  │  • Authentication middleware                           │   │
│  │  • Rate limiting & security                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                  │
│  ┌─────────────────────────┴──────────────────────────────┐   │
│  │              Business Logic Layer                      │   │
│  │  • Route handlers                                     │   │
│  │  • Validation logic                                    │   │
│  │  • Business rules                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                    Prisma ORM
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (Database)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            PostgreSQL (Supabase)                      │   │
│  │  • Relational database                               │   │
│  │  • ACID compliance                                    │   │
│  │  • Connection pooling                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture Diagrams

### Request Flow Diagram

```
┌──────────┐
│  Client  │
│ (Browser)│
└────┬─────┘
     │
     │ 1. HTTP Request
     │    GET /api/ideas
     │    Authorization: Bearer <token>
     ▼
┌─────────────────────────────────────┐
│      Express Server                 │
│  ┌───────────────────────────────┐ │
│  │  Middleware Stack              │ │
│  │  1. CORS                       │ │
│  │  2. Helmet (Security)          │ │
│  │  3. Rate Limiter               │ │
│  │  4. Body Parser                │ │
│  │  5. Auth Middleware            │ │
│  └───────────────────────────────┘ │
│           │                        │
│           ▼                        │
│  ┌───────────────────────────────┐ │
│  │  Route Handler                │ │
│  │  /api/ideas                   │ │
│  └───────────────────────────────┘ │
│           │                        │
│           ▼                        │
│  ┌───────────────────────────────┐ │
│  │  Prisma Client                │ │
│  │  prisma.idea.findMany()       │ │
│  └───────────────────────────────┘ │
└───────────┬─────────────────────────┘
            │
            │ 2. SQL Query
            ▼
┌─────────────────────────────────────┐
│      PostgreSQL Database            │
│  ┌───────────────────────────────┐ │
│  │  SELECT * FROM ideas          │ │
│  │  WHERE is_public = true       │ │
│  └───────────────────────────────┘ │
└───────────┬─────────────────────────┘
            │
            │ 3. Query Results
            ▼
┌─────────────────────────────────────┐
│      Response Processing            │
│  • Transform data                   │
│  • Include relations                │
│  • Format JSON                      │
└───────────┬─────────────────────────┘
            │
            │ 4. JSON Response
            ▼
┌──────────┐
│  Client  │
│ (Browser)│
└──────────┘
```

### Real-time Communication Flow

```
┌──────────┐                    ┌──────────┐
│ Client 1 │                    │ Client 2 │
└────┬─────┘                    └────┬─────┘
     │                                │
     │ 1. Socket.io Connection        │
     ├───────────────────────────────►│
     │                                │
     │ 2. Join Room: idea-123         │
     ├───────────────────────────────►│
     │                                │
     │                                │ 3. User votes
     │                                ├───►
     │                                │
     │ 4. Broadcast: vote-updated     │
     │◄───────────────────────────────┤
     │                                │
     │ 5. Update UI                   │
     │                                │
```

### Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. POST /api/auth/login
     │    { email, password }
     ▼
┌─────────────────────────────────────┐
│      Auth Route Handler             │
│  ┌───────────────────────────────┐ │
│  │  1. Validate input            │ │
│  │  2. Find user by email        │ │
│  │  3. Compare password (bcrypt) │ │
│  │  4. Generate JWT token        │ │
│  └───────────────────────────────┘ │
└───────────┬─────────────────────────┘
            │
            │ 2. JWT Token
            ▼
┌──────────┐
│  Client  │
│  • Store token in localStorage     │
│  • Add to Authorization header      │
└────┬─────┘
     │
     │ 3. Request with token
     │    Authorization: Bearer <token>
     ▼
┌─────────────────────────────────────┐
│      Auth Middleware                │
│  ┌───────────────────────────────┐ │
│  │  1. Extract token             │ │
│  │  2. Verify JWT                │ │
│  │  3. Load user from DB         │ │
│  │  4. Attach to req.user        │ │
│  └───────────────────────────────┘ │
└───────────┬─────────────────────────┘
            │
            │ 4. Authenticated Request
            ▼
┌─────────────────────────────────────┐
│      Protected Route Handler        │
└─────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI framework | 18.2.0 |
| TypeScript | Type safety | 4.9.5 |
| React Router | Client-side routing | 6.20.1 |
| React Query | Server state management | 3.39.3 |
| Tailwind CSS | Styling | 3.3.6 |
| Socket.io-client | Real-time communication | 4.7.4 |
| Axios | HTTP client | 1.6.2 |
| React Hook Form | Form handling | 7.48.2 |
| Framer Motion | Animations | 10.16.16 |

### Backend Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 18+ |
| Express | Web framework | 4.18.2 |
| TypeScript | Type safety | 5.3.2 |
| Prisma | ORM | 6.11.1 |
| PostgreSQL | Database | 14+ |
| Socket.io | WebSocket server | 4.7.4 |
| JWT | Authentication | 9.0.2 |
| Passport.js | OAuth | 0.7.0 |
| bcryptjs | Password hashing | 2.4.3 |

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ id (PK)                                               │  │
│  │ email (UNIQUE)                                        │  │
│  │ username (UNIQUE)                                     │  │
│  │ password (hashed)                                     │  │
│  │ googleId (UNIQUE, nullable)                          │  │
│  │ firstName, lastName                                   │  │
│  │ role: BUILDER | INVESTOR | MENTOR | ENTHUSIAST       │  │
│  │ skills: String[]                                      │  │
│  │ interests: String[]                                   │  │
│  │ bio, avatar, location, website                        │  │
│  │ linkedin, twitter, github                             │  │
│  │ isVerified, isPremium, emailVerified                  │  │
│  │ createdAt, updatedAt, lastActive                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ 1:N                │ 1:N                │ 1:N
         │                    │                    │
    ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
    │  Idea   │          │ Comment  │          │  Vote   │
    └─────────┘          └──────────┘          └─────────┘
         │                    │                    │
         │ 1:N                │ 1:N                │
         │                    │                    │
    ┌────▼────┐          ┌────▼────┐          ┌─────────────┐
    │ Comment │          │  Vote   │          │ Notification│
    └─────────┘          └─────────┘          └─────────────┘
```

### Key Relationships

1. **User → Idea (1:N)**
   - One user can create many ideas
   - Cascade delete: deleting user deletes their ideas

2. **Idea → Comment (1:N)**
   - One idea can have many comments
   - Comments can be nested (parent-child relationship)

3. **User → Vote (1:N)**
   - One user can vote on many ideas/comments
   - Unique constraint: one vote per user per idea/comment per type

4. **User → User (N:N via Follow)**
   - Users can follow other users
   - Many-to-many relationship through Follow table

5. **User → User (N:N via Message)**
   - Users can message each other
   - Bidirectional messaging relationship

### Indexes and Constraints

- **Unique Constraints:**
  - `users.email` (unique)
  - `users.username` (unique)
  - `users.googleId` (unique, nullable)
  - `ideas.slug` (unique)
  - `votes.userId_ideaId_type` (composite unique)
  - `follows.followerId_followingId` (composite unique)

- **Indexes:**
  - Primary keys on all tables
  - Foreign key indexes for performance
  - `ideas.createdAt` for sorting
  - `ideas.isPublic` for filtering

---

## API Design

### RESTful Principles

The API follows RESTful design principles:

- **Resources:** Nouns (ideas, users, comments)
- **HTTP Methods:** GET (read), POST (create), PUT (update), DELETE (delete)
- **Status Codes:** 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
- **JSON:** All requests and responses use JSON

### API Versioning

Currently using unversioned API (`/api/*`). Future versions will use `/api/v1/*`, `/api/v2/*`, etc.

### Error Response Format

```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "stack": "..." // Only in development
  }
}
```

### Pagination

Pagination is implemented using `limit` and `offset` query parameters:

```
GET /api/ideas?limit=20&offset=0
```

---

## Authentication & Authorization

### JWT Authentication

1. **Token Generation:**
   - Signed with `JWT_SECRET`
   - Contains `userId` and `role`
   - Expires in 7 days (configurable)

2. **Token Storage:**
   - Client: `localStorage`
   - Sent in `Authorization: Bearer <token>` header

3. **Token Verification:**
   - Middleware verifies token on protected routes
   - Loads user from database
   - Attaches to `req.user`

### OAuth Integration

**Google OAuth Flow:**
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. User authorizes
4. Google redirects to `/api/auth/google/callback`
5. Server creates/updates user
6. JWT token generated and sent to client

### Role-Based Access Control

User roles:
- **ENTHUSIAST:** Default role, can post ideas and comment
- **BUILDER:** Can create and manage ideas
- **INVESTOR:** Can express investment interest
- **MENTOR:** Can provide mentorship
- **ADMIN:** Full system access (future)

---

## Real-time Communication

### Socket.io Implementation

**Server Setup:**
- Socket.io server attached to Express HTTP server
- CORS configured for frontend origin
- Room-based architecture for idea-specific updates

**Client Connection:**
- Connects when user is authenticated
- Joins rooms for active idea pages
- Receives real-time updates for comments and votes

**Events:**
- `join-idea`: Join idea room
- `leave-idea`: Leave idea room
- `new-comment`: Broadcast new comment
- `new-vote`: Broadcast vote update
- `comment-added`: Receive new comment
- `vote-updated`: Receive vote update

---

## Security Architecture

### Security Layers

1. **Network Layer:**
   - HTTPS/TLS encryption
   - CORS restrictions
   - Rate limiting

2. **Application Layer:**
   - Input validation
   - SQL injection prevention (Prisma)
   - XSS protection (Helmet)
   - Authentication middleware

3. **Data Layer:**
   - Password hashing (bcrypt, 12 rounds)
   - JWT token expiration
   - Database connection pooling

### Security Headers (Helmet)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

### Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per IP
- **Purpose:** Prevent abuse and DDoS

---

## Deployment Architecture

### Recommended Production Setup

```
┌─────────────────────────────────────────────────────────────┐
│                    CDN / Load Balancer                      │
│                    (CloudFlare / AWS)                        │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼────────┐                    ┌────────▼────────┐
│  Frontend      │                    │   Backend API   │
│  (Static Host) │                    │  (Node.js App)  │
│  • Vercel      │                    │  • Railway      │
│  • Netlify     │                    │  • Heroku       │
│  • AWS S3      │                    │  • DigitalOcean │
└────────────────┘                    └────────┬─────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │   Database          │
                                    │   (Supabase)        │
                                    │   • PostgreSQL      │
                                    │   • Connection Pool │
                                    └─────────────────────┘
```

### Environment Variables

**Production Checklist:**
- [ ] `NODE_ENV=production`
- [ ] Strong `JWT_SECRET` (32+ characters)
- [ ] Production database URL
- [ ] CORS configured for production domain
- [ ] SSL/TLS certificates
- [ ] Rate limiting tuned for production
- [ ] Error logging configured
- [ ] Monitoring and alerting set up

---

## Performance Considerations

### Database Optimization

1. **Indexes:** Strategic indexes on frequently queried columns
2. **Connection Pooling:** Prisma manages connection pool
3. **Query Optimization:** Use `select` to limit fields
4. **Pagination:** Implement pagination for large datasets

### Caching Strategy

**Future Implementation:**
- Redis for session storage
- Cache frequently accessed ideas
- Cache user profiles

### Frontend Optimization

1. **Code Splitting:** React lazy loading
2. **Image Optimization:** Lazy loading, WebP format
3. **Bundle Size:** Tree shaking, minification
4. **CDN:** Static assets served from CDN

### API Optimization

1. **Response Compression:** Gzip compression enabled
2. **Pagination:** Limit response sizes
3. **Selective Fields:** Only return needed data
4. **Database Queries:** Optimize with Prisma `select`

---

## Monitoring & Logging

### Logging Strategy

- **Development:** Console logging with timestamps
- **Production:** Structured logging (JSON format)
- **Log Levels:** INFO, WARN, ERROR, DEBUG

### Monitoring Points

1. **API Endpoints:** Response times, error rates
2. **Database:** Query performance, connection pool
3. **Authentication:** Failed login attempts
4. **Real-time:** Socket connection counts

### Future Enhancements

- Integration with logging service (Datadog, LogRocket)
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Uptime monitoring (Pingdom)

---

## Scalability Considerations

### Horizontal Scaling

- **Stateless API:** No server-side sessions (JWT-based)
- **Database:** Can scale with read replicas
- **Load Balancing:** Multiple API instances behind load balancer

### Vertical Scaling

- **Database:** Upgrade instance size
- **API Server:** Increase memory/CPU
- **Connection Pool:** Tune pool size

### Future Scaling Strategies

- **Microservices:** Split into smaller services
- **Message Queue:** For async processing
- **Caching Layer:** Redis for frequently accessed data
- **CDN:** For static assets and API responses

---

This architecture is designed to be scalable, maintainable, and secure. As the application grows, these patterns can be extended and optimized further.

