# DevCollab API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require header: `Authorization: Bearer <token>`

---

## Authentication

### Register
```
POST /auth/register
```
**Body:**
```json
{
  "name": "Jane Developer",
  "email": "jane@example.com",
  "password": "secret123"
}
```
**Response:** `{ _id, name, email, token }`

### Login
```
POST /auth/login
```
**Body:**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```
**Response:** `{ _id, name, email, token }`

### Google OAuth
```
POST /auth/google
```
**Body:**
```json
{
  "credential": "<Google ID token from GIS popup>"
}
```
**Response:** `{ _id, name, email, token, onboardingCompleted }`

- Creates account if email is new (auto `emailVerified: true`)
- Logs in if email or `googleId` already exists
- Links Google to existing email/password accounts

### Get Current User
```
GET /auth/me
```
**Auth:** Required  
**Response:** Full user object (no password)

---

## Users / Profile

### Get Own Profile
```
GET /users/profile
```
**Auth:** Required

### Update Profile
```
PUT /users/profile
```
**Auth:** Required  
**Body:**
```json
{
  "name": "Jane Developer",
  "bio": "Full stack developer passionate about open source",
  "skills": ["React", "Node.js", "MongoDB"],
  "role": "Full Stack Developer",
  "experience": "3 years",
  "availability": "Available",
  "interests": ["Open Source", "AI"],
  "githubUsername": "octocat",
  "socialLinks": {
    "github": "https://github.com/octocat",
    "linkedin": "https://linkedin.com/in/jane",
    "leetcode": "https://leetcode.com/jane",
    "portfolio": "https://jane.dev"
  }
}
```

### Get Public Profile
```
GET /users/profile/:id
```
**Auth:** Required

### Bookmarks

```
GET /users/bookmarks
POST /users/bookmarks/:projectId
```
**Auth:** Required  
Toggle bookmark on/off. POST returns `{ bookmarks: [...] }`.

---

## Projects

### Get All Projects (with filters)
```
GET /projects?search=react&category=Web&skill=Node.js&status=open
```
**Auth:** Required  
Returns projects with `matchPercentage` based on user skills.

### Get Skill-Matched Projects
```
GET /projects/match
```
**Auth:** Required  
Returns open projects sorted by match percentage (descending).

**Matching formula:**
```
match % = (matched skills / total required skills) × 100
```

### Get Dashboard Stats
```
GET /projects/stats
```
**Auth:** Required  
**Response:**
```json
{
  "myProjects": 3,
  "applications": { "pending": 2, "accepted": 1, "rejected": 0 },
  "incomingApplications": 4
}
```

### Get My Projects
```
GET /projects/my
```
**Auth:** Required

### Create Project
```
POST /projects
```
**Auth:** Required  
**Body:**
```json
{
  "title": "Open Source Task Manager",
  "description": "Building a collaborative task manager...",
  "requiredSkills": ["React", "Node.js", "MongoDB"],
  "teamSize": 5,
  "category": "Web"
}
```

### Get Project by ID
```
GET /projects/:id
```
**Auth:** Required  
Includes `matchPercentage` for the current user.

### Update Project
```
PUT /projects/:id
```
**Auth:** Required (owner only)

### Delete Project
```
DELETE /projects/:id
```
**Auth:** Required (owner only)

---

## Applications

### Apply to Project
```
POST /applications/:projectId
```
**Auth:** Required  
**Body:**
```json
{
  "message": "I'd love to contribute my React experience."
}
```

### Get My Applications
```
GET /applications/my
```
**Auth:** Required

### Get Dashboard Applications
```
GET /applications/dashboard
```
**Auth:** Required  
Returns `{ myApplications, incomingApplications }`.

### Get Project Applications
```
GET /applications/project/:projectId
```
**Auth:** Required (project owner only)

### Update Application Status
```
PUT /applications/:id/status
```
**Auth:** Required (project owner only)  
**Body:**
```json
{
  "status": "accepted"
}
```
Valid values: `"accepted"`, `"rejected"`

When accepted, user is added to project team (if team not full).

---

## Chat

### Get My Chat List
```
GET /chat
```
**Auth:** Required  
Returns projects the user is a member of with last message preview.

### Get Project Chat
```
GET /chat/:projectId
```
**Auth:** Required (team members only)

### Send Message (REST fallback)
```
POST /chat/:projectId
```
**Auth:** Required  
**Body:**
```json
{
  "content": "Hello team!"
}
```

### Real-time (Socket.io)

Connect to `http://localhost:5000` with auth:
```javascript
io(SOCKET_URL, { auth: { token: 'JWT_TOKEN' } });
```

**Events:**

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_project` | Client → Server | `projectId` |
| `leave_project` | Client → Server | `projectId` |
| `send_message` | Client → Server | `{ projectId, content }` |
| `new_message` | Server → Client | `{ projectId, message }` |

---

## GitHub Integration

### Get GitHub Data
```
GET /github
GET /github/:userId
```
**Auth:** Required  
Returns GitHub profile, recent repos, and language breakdown.  
Requires `githubUsername` or GitHub URL in user profile.

---

## Notifications

### Get Notifications
```
GET /notifications
```
**Auth:** Required

### Get Unread Count
```
GET /notifications/unread-count
```
**Auth:** Required  
**Response:** `{ count: 3 }`

### Mark as Read
```
PUT /notifications/:id/read
```
**Auth:** Required

### Mark All as Read
```
PUT /notifications/read-all
```
**Auth:** Required

---

## Health Check

```
GET /api/health
```
**Response:** `{ status: "ok", message: "Developer Collaboration Hub API" }`

---

## Error Responses

All errors return:
```json
{
  "message": "Error description"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized / invalid token |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Server error |
