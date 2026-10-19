# Frontend ⇄ Backend API contract

Base URL: `VITE_API_URL` (default `http://localhost:5000/api`). JSON unless noted. Auth is an httpOnly cookie; CORS must allow the frontend origin with credentials.

## Conventions
- Success: `{ "data": <payload>, "pagination"?: { "page", "totalPages", "total" }, "message"? }`
- Error: HTTP 4xx/5xx with `{ "message": "...", "errors"?: { "field": "message" } }`. A `401` clears the client session.
- Lists accept `page` and `limit`.
- User: `{ _id, name, email, role: "student"|"admin", college, degree, branch, semester, contributionPoints, badges[], status: "active"|"restricted", stats?: { uploads, approved, downloads } }`
- Resource: `{ _id, title, description, college, degree, branch, semester, subject, unit, resourceType, tags[], fileType, fileSize, uploader: { _id, name }, createdAt, averageRating, downloadCount, status: "pending"|"approved"|"rejected", rejectionReason?, isBookmarked, myRating? }`
- `resourceType` values: Lecture Notes, Previous Papers, Lab Manual, Lab Record, Question Bank, Presentation, Study Guide, Reference.

## Endpoints
| Method & path | Request | Response `data` |
|---|---|---|
| POST /auth/register | `{name,email,password,college,degree,branch,semester}` (no role) | user |
| POST /auth/login | `{email,password}`; sets cookie | user |
| POST /auth/logout | — | — |
| GET /auth/me | — | user |
| POST /auth/forgot-password *(optional extension)* | `{email}` | — |
| GET /resources | query: `q,college,degree,branch,semester,subject,unit,resourceType,rating(min),sort(relevant\|downloads\|rating\|recent),page,limit` | resource[] + pagination (approved only) |
| GET /resources/:id | — | resource (404 if missing/not visible) |
| POST /resources | multipart: `file` + title, description, college, degree, branch, semester, subject, unit, resourceType, `tags` (JSON array string). Status becomes `pending` | resource incl. `status` |
| PATCH /resources/:id | `{title?,description?,tags?}` (owner) | resource |
| DELETE /resources/:id | — (owner/admin) | — |
| GET /resources/:id/download | streams file; `Content-Disposition` filename; increments count | binary |
| GET /users/me/resources | `page,limit` | resource[] (all statuses) + pagination |
| GET /bookmarks | — | resource[] |
| POST/DELETE /bookmarks/:resourceId | — | — |
| PUT /resources/:id/rating | `{rating:1..5}` | `{averageRating}` |
| GET /resources/:id/reviews | — | `[{_id,user:{_id,name},comment,createdAt}]` |
| POST /resources/:id/reviews | `{comment}` | review |
| PATCH /reviews/:id · DELETE /reviews/:id | `{comment}` / — (author) | review / — |
| POST /resources/:id/reports | `{reason,details}` | — |
| GET /admin/stats | — | `{totalUsers,totalResources,pendingResources,publishedResources,openReports,totalDownloads}` |
| GET /admin/resources/pending | — | resource[] |
| PATCH /admin/resources/:id/moderation | `{status:"approved"\|"rejected", reason?}` | resource |
| GET /admin/reports | — | `[{_id,resource:{_id,title},reporter:{name},reason,details,status:"open"\|"resolved",createdAt}]` |
| PATCH /admin/reports/:id | `{status:"resolved"}` | report |
| GET /admin/users | `page,limit` | user[] + pagination |
| PATCH /admin/users/:id/status | `{status:"active"\|"restricted"}` | user |
| GET /leaderboard | — | `[{_id,rank,name,contributionPoints,badges[]}]` |
| GET /notifications | — | `[{_id,message,read,createdAt,resource?}]` plus top-level `unreadCount` |
| PATCH /notifications/:id/read · /notifications/read-all | — | — |
| GET /users/me · PATCH /users/me | `{name,college,degree,branch,semester}` | user (with `stats`) |
| GET /health | — | `{status:"ok"}` |

The backend must enforce authentication, roles, ownership, the 20 MB / file-type limits, and moderation visibility on its own.
