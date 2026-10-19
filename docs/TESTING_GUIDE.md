# StudySwap Testing Guide

---

## Testing Stack

| Tool | Purpose |
|---|---|
| Jest | Test runner and assertions |
| Supertest | HTTP request testing for Express |
| Isolated DB | In-memory MongoDB (`mongodb-memory-server`) |

---

## Running Tests

```bash
# From project root
npm test

# Or from server directory
cd server && npm test
```

Tests automatically run on an isolated in-memory MongoDB instance (`mongodb-memory-server`), ensuring 100% reproducible tests without needing a separate database service to be running.

---

## Test Files

| File | Tests |
|---|---|
| `server/tests/auth.test.js` | Registration, login, session, authorization |
| `server/tests/resources.test.js` | Upload, filters, pagination, download, moderation, rating |
| `server/tests/bookmarks.test.js` | Add, remove, duplicate prevention, privacy |
| `server/tests/admin.test.js` | Role protection, platform stats, moderation rejection, account restrict/restore |

---

## Authentication Tests

```
✓ POST /api/auth/register — creates new student
✓ POST /api/auth/register — rejects duplicate email
✓ POST /api/auth/register — rejects missing fields
✓ POST /api/auth/login — succeeds with correct credentials
✓ POST /api/auth/login — rejects wrong password
✓ GET /api/auth/me — returns user when authenticated
✓ GET /api/auth/me — returns 401 when not authenticated
✓ Admin endpoint — returns 403 for student role
```

---

## Resource Tests

```
✓ GET /api/resources — returns paginated published resources
✓ GET /api/resources?q=dbms — full-text search works
✓ GET /api/resources?branch=CSE — filter by branch
✓ GET /api/resources?semester=5 — filter by semester
✓ GET /api/resources?sort=downloads — sort by downloads
✓ GET /api/resources/:id — returns resource details
✓ POST /api/resources — authenticated upload succeeds
✓ POST /api/resources — unauthenticated upload returns 401
✓ POST /api/resources — invalid file type rejected
✓ POST /api/resources — sets status to pending
✓ GET /api/users/me/resources — returns own uploads
✓ PATCH /api/admin/resources/:id/moderation — admin can approve
✓ GET /api/resources/:id/download — returns actual file
```

---

## Bookmark Tests

```
✓ POST /api/bookmarks/:id — adds bookmark
✓ POST /api/bookmarks/:id — prevents duplicate bookmark
✓ DELETE /api/bookmarks/:id — removes bookmark
✓ GET /api/bookmarks — returns only own bookmarks
✓ GET /api/bookmarks — returns 401 without auth
```

---

## Manual Testing Checklist

Use this checklist to manually verify all critical flows:

### Authentication
- [ ] Register a new student account
- [ ] Try registering with the same email (expect error)
- [ ] Log in with correct credentials
- [ ] Log in with wrong password (expect error)
- [ ] Refresh page — session is restored
- [ ] Log out — session is cleared

### Upload Flow
- [ ] Upload a PDF file with all required fields
- [ ] Upload fails without a file selected
- [ ] Upload fails with unsupported file type (e.g., .exe)
- [ ] Upload fails with file > 20 MB
- [ ] Uploaded resource appears in My Uploads with "Pending" status
- [ ] Log in as admin — resource appears in Resource Moderation
- [ ] Approve the resource — it appears in Material Hub
- [ ] Reject the resource — uploader receives a notification

### Material Hub
- [ ] Browse all published resources
- [ ] Search for a resource by title
- [ ] Filter by branch/semester/type
- [ ] Sort by most downloaded / highest rated
- [ ] Navigate pages (pagination)
- [ ] Click resource card — opens details page
- [ ] Download resource — file is actually downloaded
- [ ] Bookmark a resource — appears in Saved Materials
- [ ] Remove bookmark

### Ratings & Reviews
- [ ] Rate a resource (1-5 stars)
- [ ] Update own rating
- [ ] Cannot rate own resource (expect error)
- [ ] Write a review
- [ ] Edit own review
- [ ] Cannot edit another user's review

### Admin Functions
- [ ] Admin dashboard shows real stats
- [ ] Approve pending resources
- [ ] Reject resources with reason
- [ ] View reports list
- [ ] Resolve a report
- [ ] Toggle user active/inactive status

### Themes
- [ ] Dark mode is default
- [ ] Click theme toggle — switches to light mode
- [ ] Refresh page — light mode is retained
- [ ] All pages look correct in both themes

### Responsive
- [ ] Resize browser to mobile width
- [ ] Sidebar collapses on mobile
- [ ] Navigation drawer works on mobile
- [ ] Upload form is usable on mobile
- [ ] Resource cards stack to single column

---

## API Testing with curl

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"name":"Test User","email":"test@test.com","password":"Password123!","college":"Test College","degree":"B.E","branch":"CSE","semester":3}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{"email":"test@test.com","password":"Password123!"}'

# Get current user
curl http://localhost:5000/api/auth/me \
  -b cookies.txt

# Get resources
curl "http://localhost:5000/api/resources?limit=5&sort=newest"

# Upload a file (replace cookie and file path)
curl -X POST http://localhost:5000/api/resources \
  -b cookies.txt \
  -F "title=Test Notes" \
  -F "description=These are comprehensive test notes for the subject" \
  -F "college=Test College" \
  -F "degree=B.E" \
  -F "branch=CSE" \
  -F "semester=3" \
  -F "subject=Test Subject" \
  -F "resourceType=notes" \
  -F "file=@/path/to/your/file.pdf"
```

---

## Test Database

Tests automatically use a separate database. The test setup:

1. Connects to `mongodb://127.0.0.1:27017/studyswap_test`
2. Clears collections before each test suite
3. Creates test users and resources as needed
4. Disconnects after all tests complete

> **Never point the test suite at your development or production database.**
