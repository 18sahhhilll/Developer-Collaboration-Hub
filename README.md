# DevCollab — Developer Collaboration Hub

A production-quality MERN stack SaaS-style application for developers to discover projects, apply to collaborate, manage teams, chat in real time, and maintain rich professional profiles.

## Overview

DevCollab connects developers with projects that match their skills. Users build a profile, get matched to relevant projects in a personalized feed, apply to join teams, and collaborate through live chat once accepted — all backed by a full application-tracking and notification system.

## Features

| Feature | Description |
|---|---|
| **Feed** | Skill-matched project discovery — the default landing page after login |
| **Dashboard** | Overview of your projects, application stats, and incoming applications |
| **Projects** | Browse, search, and filter all available projects |
| **Project Detail** | Full project info, team member list, and apply/manage-applications actions |
| **Applications** | Track applications by status — pending, accepted, rejected |
| **Profile** | Editable professional profile with GitHub API integration |
| **Chat** | Real-time, project-based group chat via Socket.io |
| **Notifications** | Live updates on application status changes |
| **Bookmarks** | Save interesting projects from the feed for later |

## Tech Stack

| Layer | Technology |
|---|---|
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
- MongoDB (local instance or Atlas)

## Getting Started

### 1. Clone the repository and install dependencies

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

**`backend/.env`**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dev-collab-hub
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GITHUB_TOKEN=          # Optional: increases GitHub API rate limits
```

**`frontend/.env`**

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start MongoDB

Make sure MongoDB is running locally, or point `MONGODB_URI` at a MongoDB Atlas connection string.

### 4. Run the app

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Then open **[http://localhost:5173](http://localhost:5173)** in your browser.

## Application Flow

1. Register or log in
2. Land on the **Feed** (not the Dashboard)
3. Browse skill-matched projects and apply to the ones you like
4. Manage your projects and incoming applications from the **Dashboard**
5. Chat with your team once you're accepted onto a project

## Matching Algorithm

```
match % = (matched skills / total required skills) × 100
```

**Endpoint:** `GET /api/projects/match`

## API Documentation

Full REST API reference: [`docs/API.md`](docs/API.md)

## NPM Scripts

| Command | Location | Description |
|---|---|---|
| `npm run dev` | `backend/` | Start the API with file watching (hot reload) |
| `npm start` | `backend/` | Start the API in production mode |
| `npm run dev` | `frontend/` | Start the Vite dev server |
| `npm run build` | `frontend/` | Create a production build |

## License

MIT
