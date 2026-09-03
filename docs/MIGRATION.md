# Schema Migration Guide

Run after pulling these enhancements:

```bash
cd backend
node scripts/migrate.js
```

## Changes

### User Model
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `onboardingCompleted` | Boolean | `false` | Whether user finished profile setup |
| `showCompletedProjects` | Boolean | `true` | Public profile visibility for completed projects |

### Project Model
| Field | Type | Description |
|-------|------|-------------|
| `technologies` | `[String]` | Normalized technology tags (mirrors skills) |
| `memberRoles` | `[{ user, role }]` | Team roles: owner, co-leader, member |
| `status` | enum | New values: `recruiting`, `in-progress`, `completed`, `archived` |

**Status migration:**
- `open` → `recruiting`
- `closed` → `archived`

### Notification Model
| Field | Type | Description |
|-------|------|-------------|
| `projectId` | ObjectId | Related project reference |

**Type migration:**
- `application` → `application_received`
- `accepted` → `application_accepted`
- `rejected` → `application_rejected`
- `team` → `team_added`

New types: `team_removed`, `project_updated`, `ownership_transferred`

### Indexes
- Text index on Project: `title`, `description`, `requiredSkills`, `technologies`, `category`
- Index on Notification: `{ userId: 1, createdAt: -1 }`

## Manual MongoDB Commands (optional)

```javascript
// Migrate project statuses
db.projects.updateMany({ status: "open" }, { $set: { status: "recruiting" } });
db.projects.updateMany({ status: "closed" }, { $set: { status: "archived" } });

// Backfill technologies from requiredSkills
db.projects.find({ technologies: { $size: 0 } }).forEach(p => {
  db.projects.updateOne({ _id: p._id }, { $set: { technologies: p.requiredSkills || [] } });
});

// Set existing users as onboarded
db.users.updateMany({}, { $set: { onboardingCompleted: true, showCompletedProjects: true } });
```
