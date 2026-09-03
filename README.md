# Developer Collaboration Hub (DevCollab)

A production-quality MERN stack SaaS-style web application where developers discover projects, apply to collaborate, manage teams, chat in real-time, and maintain rich professional profiles.

## Features

- **Feed** — Skill-matched project discovery (default landing page after login)
- **Dashboard** — My projects, application stats, incoming applications
- **Projects** — Browse, search, and filter all projects
- **Project Detail** — Full info, team members, apply/manage applications
- **Applications** — Track pending, accepted, and rejected applications
- **Profile** — Editable professional profile with GitHub API integration
- **Chat** — Real-time project-based group chat via Socket.io
- **Notifications** — Application status updates
- **Bookmarks** — Save projects from the feed

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, React Router, Axios, Socket.io Client |
| Backend | Node.js, Express.js (MVC architecture) |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt |
| Realtime | Socket.io |
| External API | GitHub REST API |

## Project Structure

```
developer-collaboration-hub/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── services/        # Matching algorithm
│   ├── socket/          # Socket.io handlers
│   ├── utils/           # Helpers
│   └── server.js        # Entry point
├── frontend/
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── context/     # Auth context
│       ├── pages/       # Route pages
│       └── services/    # API client
├── docs/
│   └── API.md           # API documentation
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

### 1. Clone and install dependencies

```bash
cd developer-collaboration-hub

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Configure environment variables

**Backend (`backend/.env`):**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dev-collab-hub
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GITHUB_TOKEN=          # Optional: increases GitHub API rate limits
```

**Frontend (`frontend/.env`):**

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start MongoDB

Ensure MongoDB is running locally, or use a MongoDB Atlas connection string in `MONGODB_URI`.

### 4. Run the application

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Application Flow

1. Register or log in
2. Land on **Feed** (not Dashboard)
3. Browse skill-matched projects and apply
4. Manage projects and applications from **Dashboard**
5. Chat with team members on accepted projects

## Matching Algorithm

```
match % = (matched skills / total required skills) × 100
```

Endpoint: `GET /api/projects/match`

## API Documentation

See [docs/API.md](docs/API.md) for the full REST API reference.

## Scripts

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | backend | Start API with file watching |
| `npm start` | backend | Start API (production) |
| `npm run dev` | frontend | Start Vite dev server |
| `npm run build` | frontend | Production build |

## License

MIT
