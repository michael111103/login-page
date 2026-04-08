# Javis Auth

A simple login system built for the PT. Javis Teknologi Albarokah Web Programmer Assessment.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Redis (ioredis) — user store and rate limiting
- bcryptjs — password hashing
- jsonwebtoken — session management via HttpOnly Cookie

## Getting Started

### Prerequisites

- Node.js 18+
- A Redis instance (Redis Cloud, Upstash, or local)

### Installation

```bash
git clone https://github.com/michael111103/loginpage.git
cd javis-auth
npm install
cp .env.example .env.local
```

Edit `.env.local` with your Redis URL and JWT secret:

```env
REDIS_URL=redis://default:PASSWORD@hostname:PORT
JWT_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

```
Email    : demo@javis.com
Password : Password123!
```

The demo user is seeded automatically on first login attempt.

## Architecture

The app uses Next.js API Routes as the backend. User data is stored directly in Redis using hash structures, removing the need for a traditional relational database. Authentication is handled with JWT tokens stored in HttpOnly cookies, which are validated on every request to protected routes via Next.js middleware.

Rate limiting is also Redis-backed — each IP address gets a maximum of 5 login attempts per minute before being temporarily blocked.

```
src/
  app/
    api/auth/
      login/route.ts       POST - verify credentials, issue JWT cookie
      logout/route.ts      POST - clear JWT cookie
      me/route.ts          GET  - return current user from token
    login/
      page.tsx             Suspense boundary wrapper
      LoginForm.tsx        Login form component
    dashboard/page.tsx     Protected page
  lib/
    redis.ts               ioredis singleton client
    userStore.ts           User read/write operations on Redis
    rateLimiter.ts         Redis-based rate limiting
    jwt.ts                 JWT helpers and cookie config
    validation.ts          Form validation
  middleware.ts            Redirect unauthenticated users away from /dashboard
```

## Deployment

Deployed on Vercel. Add the following environment variables before deploying:

- `REDIS_URL` — your Redis connection string
- `JWT_SECRET` — a long random string

## Tests

```bash
npm test
```
