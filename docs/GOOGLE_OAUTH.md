# Google OAuth Setup

DevCollab supports **Continue with Google** alongside existing email/password authentication.

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Application type: **Web application**
6. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` (development)
   - Your production frontend URL
7. Copy the **Client ID**

No client secret is required for this flow (Google Identity Services ID token verification).

## Environment Variables

**Backend** (`backend/.env`):

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

**Frontend** (`frontend/.env`):

```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

Use the **same Client ID** in both files.

## API Endpoint

```
POST /api/auth/google
Content-Type: application/json

{
  "credential": "<Google ID token from frontend>"
}
```

**Response** (same shape as login):

```json
{
  "_id": "...",
  "name": "Jane Developer",
  "email": "jane@gmail.com",
  "token": "jwt...",
  "onboardingCompleted": false
}
```

## Behavior

| Scenario | Action |
|----------|--------|
| New Google user | Creates account, `emailVerified: true`, redirects to onboarding |
| Existing email (password account) | Links `googleId`, logs in, keeps password login |
| Returning Google user | Logs in with JWT |
| Google-only user tries email login | Error: use Google sign-in |

## Testing

1. Set env vars in both `backend/.env` and `frontend/.env`
2. Run `node scripts/migrate.js` for existing users (optional)
3. Start backend and frontend
4. Open `/login` or `/register`
5. Click **Continue with Google**
6. Complete Google popup
7. Verify redirect to `/onboarding` (new user) or `/feed` (completed profile)
8. Verify email/password login still works for existing accounts

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Google OAuth is not configured" | Set `GOOGLE_CLIENT_ID` in backend `.env` |
| Button shows config message | Set `VITE_GOOGLE_CLIENT_ID` in frontend `.env` |
| `redirect_uri_mismatch` | Add `http://localhost:5173` to authorized origins |
| Token verification fails | Ensure frontend and backend use the same Client ID |
