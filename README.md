# AI-Powered Job Application Tracker

A full-stack PERN app to track job applications with Groq-powered resume matching, cover letters, and interview questions.

## Tech stack

- **Backend:** Node.js, Express, PostgreSQL, JWT, bcryptjs, Groq API
- **Frontend:** React (Vite), React Router, Axios, Context API

## Project structure

```
jobappntracker/
├── client/          # React frontend
├── server/          # Express API
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL (local or [Neon](https://neon.tech))
- Groq API key ([console.groq.com](https://console.groq.com/keys))

## Setup

### 1. Database

Create a database and run the schema:

```bash
psql -U postgres -c "CREATE DATABASE jobtracker;"
psql -U postgres -d jobtracker -f server/models/db.sql
```

### 2. Backend

```bash
cd server
copy .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, GROQ_API_KEY

npm install
npm run dev
```

Server runs at `http://localhost:5000`

### 3. Frontend

```bash
cd client
copy .env.example .env
# VITE_API_URL=http://localhost:5000/api

npm install
npm run dev
```

App runs at `http://localhost:5173`

## API routes

| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET/POST/PUT/DELETE | `/api/jobs` | Yes |
| POST | `/api/ai/match` | Yes |
| POST | `/api/ai/coverletter` | Yes |
| POST | `/api/ai/questions` | Yes |

## Deployment

- **Frontend:** Vercel — set `VITE_API_URL` to your production API
- **Backend:** Render.com — set env vars from `.env.example`
- **Database:** Neon.tech — use connection string as `DATABASE_URL`

## License

MIT
