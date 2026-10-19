# StudySwap API Documentation

Base URL: `http://localhost:5000/api`

All authenticated endpoints require the JWT cookie (set automatically by login/register).

All responses follow this shape:
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... },
  "pagination": { "page": 1, "limit": 12, "total": 50, "pages": 5 }
}
```

---

## Health

### GET /health
Returns server status.

**Response:**
```json
{ "success": true, "message": "StudySwap API is running", "data": { "status": "ok" } }
```

---

## Authentication

### POST /auth/register
Register a new student account.

**Body:**
```json
{
  "name": "Shyam Kumar",
  "email": "shyam@example.com",
  "password": "Password123!",
  "college": "REC Chennai",
  "degree": "B.E",
  "branch": "CSE",
  "semester": 5
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": { "user": { "_id": "...", "name": "Shyam Kumar", "role": "student", ... } }
}
```
Sets a JWT httpOnly cookie.

**Errors:** 409 (duplicate email), 422 (validation errors)

---

### POST /auth/login
Log in to an existing account.

**Body:**
```json
{ "email": "shyam@example.com", "password": "Password123!" }
```

**Response (200):** Sets JWT cookie, returns user object.

**Errors:** 401 (invalid credentials), 403 (account disabled)

---

### POST /auth/logout
Clear the JWT cookie.

**Response (200):** `{ "success": true, "message": "Logged out successfully" }`

---

### GET /auth/me
Get the currently authenticated user.

**Auth:** Required

**Response (200):** Current user object (no passwordHash).

---

## Resources

### GET /resources
Get all published resources with optional filtering, sorting, and pagination.

**Auth:** Optional (public endpoint)

**Query params:**
| Param | Type | Description |
|---|---|---|
| q | string | Full-text search (title, subject, description, tags) |
| college | string | Filter by college |
| degree | string | Filter by degree |
| branch | string | Filter by branch |
| semester | number | Filter by semester (1-8) |
| subject | string | Filter by subject |
| resourceType | string | Filter by type |
| minRating | number | Minimum average rating |
| sort | string | `downloads`, `rating`, `newest` (default: newest) |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 12, max: 50) |

**Response (200):**
```json
{
  "success": true,
  "data": { "resources": [...] },
  "pagination": { "page": 1, "limit": 12, "total": 45, "pages": 4 }
}
```

---

### GET /resources/:id
Get a single resource by ID.

**Auth:** Required (can view own pending resources; others see only published)

---

### POST /resources
Upload a new resource.

**Auth:** Required (student or admin)

**Content-Type:** `multipart/form-data`

**Fields:**
| Field | Required | Description |
|---|---|---|
| title | Yes | Resource title |
| description | Yes | Description (min 20 chars) |
| college | Yes | College name |
| degree | Yes | Degree program |
| branch | Yes | Branch/Department |
| semester | Yes | Semester (1-8) |
| subject | Yes | Subject name |
| unit | No | Unit number/name |
| resourceType | Yes | One of: notes, previousPaper, labRecord, labManual, questionBank, presentation, studyGuide, reference, other |
| tags | No | Comma-separated tags |
| file | Yes | PDF/PPT/PPTX/DOC/DOCX/JPG/JPEG/PNG, max 20 MB |

**Response (201):** Created resource with status `pending`.

---

### PATCH /resources/:id
Update resource metadata.

**Auth:** Owner or admin only

**Body:** Partial resource fields (title, description, subject, unit, tags, etc.)

---

### DELETE /resources/:id
Delete a resource and its associated file.

**Auth:** Owner or admin only

---

### GET /resources/:id/download
Download the actual file.

**Auth:** Required

**Response:** File stream with appropriate Content-Disposition header. Records download in DB.

---

### GET /users/me/resources
Get all resources uploaded by the current user (all statuses).

**Auth:** Required

---

## Bookmarks

### GET /bookmarks
Get all bookmarked resources for the current user.

**Auth:** Required

---

### POST /bookmarks/:resourceId
Add a resource to bookmarks.

**Auth:** Required

**Response (201):** `{ "success": true, "message": "Bookmark added" }`

**Error:** 409 (already bookmarked), 404 (resource not found)

---

### DELETE /bookmarks/:resourceId
Remove a bookmark.

**Auth:** Required

---

## Ratings

### PUT /resources/:id/rating
Create or update a rating for a resource.

**Auth:** Required

**Body:**
```json
{ "rating": 4 }
```

**Rules:** 1-5 integer. Cannot rate own resource.

**Response (200):** Updated average rating and count.

---

## Reviews

### GET /resources/:id/reviews
Get all reviews for a resource.

**Auth:** Optional

**Query params:** `page`, `limit`

---

### POST /resources/:id/reviews
Submit a review.

**Auth:** Required

**Body:**
```json
{ "comment": "Very helpful notes, well organized." }
```

**Rules:** Cannot review own resource. One review per user per resource (update instead).

---

### PATCH /reviews/:id
Edit own review.

**Auth:** Required (own review only)

**Body:** `{ "comment": "Updated text" }`

---

### DELETE /reviews/:id
Delete a review.

**Auth:** Owner or admin only

---

## Reports

### POST /resources/:id/reports
Submit a report about a resource.

**Auth:** Required

**Body:**
```json
{
  "reason": "incorrectMaterial",
  "description": "The notes are for a different subject."
}
```

**Reasons:** `incorrectMaterial`, `duplicate`, `inappropriateContent`, `copyright`, `brokenFile`, `other`

---

## Leaderboard

### GET /leaderboard
Get top contributors by contribution points.

**Auth:** Not required (public)

**Query params:** `limit` (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      { "rank": 1, "name": "Shyam K.", "college": "REC", "points": 145, "badges": [...] }
    ]
  }
}
```

---

## Notifications

### GET /notifications
Get notifications for the current user.

**Auth:** Required

**Query params:** `page`, `limit`, `unread` (boolean)

---

### PATCH /notifications/:id/read
Mark a notification as read.

**Auth:** Required (own notifications only)

---

### PATCH /notifications/read-all
Mark all notifications as read.

**Auth:** Required

---

## User Profile

### GET /users/me
Get full profile of the authenticated user including points and badges.

**Auth:** Required

---

### PATCH /users/me
Update own profile.

**Auth:** Required

**Body (all optional):**
```json
{
  "name": "New Name",
  "college": "New College",
  "degree": "M.E",
  "branch": "Data Science",
  "semester": 2
}
```

**Note:** `role`, `email`, `passwordHash` cannot be changed through this endpoint.

---

## Admin Endpoints

All admin endpoints require **admin** role. Non-admins receive 403.

### GET /admin/stats
Get real-time platform statistics.

**Response:**
```json
{
  "data": {
    "stats": {
      "totalUsers": 42,
      "totalResources": 128,
      "pendingResources": 7,
      "publishedResources": 115,
      "openReports": 3,
      "totalDownloads": 890
    }
  }
}
```

---

### GET /admin/resources/pending
Get all resources with status `pending`.

---

### PATCH /admin/resources/:id/moderation
Approve or reject a resource.

**Body:**
```json
{
  "action": "approve",
  "reason": ""
}
```
or
```json
{
  "action": "reject",
  "reason": "Content does not match the stated subject."
}
```

Automatically creates a notification for the uploader and awards 10 contribution points on approval.

---

### GET /admin/reports
Get all reports.

**Query params:** `status` (open/underReview/resolved/dismissed), `page`, `limit`

---

### PATCH /admin/reports/:id
Update report status.

**Body:**
```json
{
  "status": "resolved",
  "resolution": "Resource was removed as it was incorrectly labeled."
}
```

---

### GET /admin/users
Get paginated user list.

**Query params:** `page`, `limit`, `search` (by name/email)

---

### PATCH /admin/users/:id/status
Toggle user active/inactive status.

**Response:** Updated user status.

---

## Error Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Forbidden (not authorized) |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 413 | File too large |
| 422 | Validation failed |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
