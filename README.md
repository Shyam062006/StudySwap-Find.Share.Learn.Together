# StudySwap

> **“Find. Share. Learn. Together.”**

[![Live Demo](https://img.shields.io/badge/Live_Website-Visit_StudySwap-EF233C?style=for-the-badge&logo=vercel&logoColor=white)](https://study-swap-find-share-learn-togethe.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend_API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://studyswap-api.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://cloud.mongodb.com)

---

### 🌐 Live Application Links
* 🚀 **Live Web Application**: **[https://study-swap-find-share-learn-togethe.vercel.app](https://study-swap-find-share-learn-togethe.vercel.app)**
* ⚙️ **Production REST API**: **[https://studyswap-api.onrender.com/api/health](https://studyswap-api.onrender.com/api/health)**

### 👨‍🎓 Instant Demo Accounts (CSE Semester 5)
| Student | Email | Password | Branch & Semester |
| :--- | :--- | :--- | :--- |
| **Praveen** | `praveen@studyswap.dev` | `Student123!` | CSE • Semester 5 • National Engineering College |
| **Neelish** | `neelish@studyswap.dev` | `Student123!` | CSE • Semester 5 • National Engineering College |

*(You can also click the **1-Click Sign In** buttons directly on the Login page to sign in with either student instantly.)*

---

A full-stack student academic resource sharing and discovery platform built as a Full Stack Development (FSD) Capstone Project.

StudySwap solves the problem of academic resources being scattered across chats, personal drives, and random websites by centralizing study materials into **ONE unified Material Hub**.

---

## Table of Contents

1. [Project Identity & Overview](#project-identity--overview)
2. [Technology Stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Installation & Setup](#installation--setup)
5. [MongoDB Configuration (Local & Atlas)](#mongodb-configuration)
6. [Environment Variables](#environment-variables)
7. [Running the Application](#running-the-application)
8. [Database Seeding & Sample Data](#database-seeding--sample-data)
9. [Administrator Account Provisioning](#administrator-account-provisioning)
10. [REST API Endpoints](#rest-api-endpoints)
11. [File Upload & Download Engine](#file-upload--download-engine)
12. [Contribution Points & Gamification](#contribution-points--gamification)
13. [Design System (Red Noir Aesthetic)](#design-system)
14. [Running Tests](#running-tests)
15. [Project Architecture & Directory Structure](#project-architecture--directory-structure)
16. [Troubleshooting](#troubleshooting)

---

## 1. Project Identity & Overview

- **Project Name:** StudySwap
- **Tagline:** “Find. Share. Learn. Together.”
- **Core Concept:** Exactly **ONE central Material Hub** where all study materials are discovered, filtered by organizational attributes:
  - Branch (CSE, ECE, EEE, MECH, CIVIL, IT, AIDS, AIML, etc.)
  - Semester (1 to 8)
  - Subject & Unit
  - Resource Type (Lecture Notes, Previous Question Papers, Lab Manuals, Lab Records, Question Banks, Presentations, Study Guides, References)
- **Moderation Engine:** Uploads default to `pending` and are reviewed by administrators before publication in the Material Hub.

---

## 2. Technology Stack

Follows the FSD laboratory requirements strictly:

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React 18 (Vite) | Single-page application using modern functional components & hooks |
| **Routing** | React Router v6 | Client-side routing with role-based protected routes |
| **Styling** | Pure CSS3 + CSS Custom Properties | Red Noir visual identity, dark mode default, light mode toggle |
| **Icons** | Lucide React | Clean, responsive vector icons |
| **Backend** | Node.js + Express.js | Modular RESTful API |
| **Database** | MongoDB | Official native MongoDB Node.js driver (v6.x, **no Mongoose**) |
| **Authentication** | JWT + bcryptjs | Secure, `httpOnly` cookie-based session handling |
| **File Uploads** | Multer | Multipart/form-data upload with magic-byte signature validation |
| **Security** | Helmet, CORS, Rate Limiters | Enterprise-grade HTTP security headers and rate limits |
| **Testing** | Jest + Supertest | Automated API test suite with `mongodb-memory-server` |

---

## 3. Prerequisites

Before running StudySwap, ensure you have:

- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **MongoDB**: Either a local MongoDB instance running on port 27017, OR a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster.

---

## 4. Installation & Setup

1. **Clone or open the workspace:**
   ```bash
   cd STUDYSWAP
   ```

2. **Install all dependencies** across root, frontend, and backend:
   ```bash
   npm run install:all
   ```
   *(Or individually: `npm install`, `cd studyswap-frontend-claude && npm install`, `cd server && npm install`)*

---

## 5. MongoDB Configuration

StudySwap connects using the standard connection string format in `server/.env`.

### Option A: Local MongoDB (Default)
If you have MongoDB Community Server installed locally on port 27017:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/studyswap
```

### Option B: MongoDB Atlas (Cloud)
If using MongoDB Atlas:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Under **Database**, click **Connect** → **Drivers** (Node.js).
3. Copy your connection string and replace `<username>` and `<password>`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/studyswap?retryWrites=true&w=majority
   ```
4. Save it into `server/.env`.

---

## 6. Environment Variables

### Backend Configuration (`server/.env`)
Create or edit `server/.env` (sample provided in `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/studyswap
JWT_SECRET=studyswap_super_secure_random_key_min_64_characters_for_jwt_tokens
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=20
COOKIE_SECURE=false
```

### Frontend Configuration (`studyswap-frontend-claude/.env`)
Create or edit `studyswap-frontend-claude/.env` (sample provided in `.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 7. Running the Application

### Start Both Frontend and Backend Concurrently:
From the workspace root:
```bash
npm run dev
```

This starts:
- **Express Backend:** `http://localhost:5000` (API: `http://localhost:5000/api`)
- **React Frontend (Vite):** `http://localhost:5173`

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 8. Database Seeding & Sample Data

To populate the database with realistic academic resources (DBMS Notes, Java OOP, OS Question Papers, Data Structures Lab Programs, Computer Networks, etc.):

```bash
npm run seed
```
*(or `cd server && npm run seed`)*

This creates:
- A seed student account: `student@studyswap.dev` / `Student123!`
- 8 pre-approved academic resources with realistic metadata and file placeholders.
- All database search and uniqueness indexes.

---

## 9. Administrator Account Provisioning

To create an administrator account, use the secure terminal script:

### Interactive Mode:
```bash
npm run create-admin
```
*(Prompts for Admin name, email, and password).*

### CLI Argument Mode:
```bash
cd server && node scripts/createAdmin.js --name="Administrator" --email="admin@studyswap.dev" --password="AdminPassword123!"
```

Once created, log in at `http://localhost:5173/login` to access the **Admin Console** at `/admin`.

---

## 10. REST API Endpoints

All responses adhere to the standard JSON structure: `{ success: true, message: "...", data: ..., pagination?: ... }`.

### Authentication
- `POST /api/auth/register` — Register student account (hashes password, sets JWT cookie)
- `POST /api/auth/login` — Authenticate user and set `httpOnly` cookie
- `POST /api/auth/logout` — Invalidate session and clear cookie
- `GET /api/auth/me` — Restore authenticated session from cookie

### Material Hub & Resources
- `GET /api/resources` — Public. Query approved materials (`q`, `college`, `branch`, `semester`, `subject`, `resourceType`, `rating`, `sort`, `page`, `limit`)
- `GET /api/resources/:id` — Public. Single resource details
- `POST /api/resources` — Authenticated. Upload resource (multipart/form-data with file)
- `PATCH /api/resources/:id` — Owner or Admin. Update resource metadata
- `DELETE /api/resources/:id` — Owner or Admin. Delete resource & uploaded file
- `GET /api/resources/:id/download` — Authenticated. Download actual file
- `GET /api/users/me/resources` — Authenticated. Current user's uploads (pending, approved, rejected)
- `PUT /api/resources/:id/rating` — Authenticated. Rate material (1 to 5 stars)

### Reviews & Reports
- `GET /api/resources/:id/reviews` — Get reviews for a resource
- `POST /api/resources/:id/reviews` — Add review (comment min 10 chars)
- `PATCH /api/reviews/:id` — Edit own review
- `DELETE /api/reviews/:id` — Delete own review
- `POST /api/resources/:id/reports` — Report resource (`reason`, `details`)

### Bookmarks & Notifications
- `GET /api/bookmarks` — List bookmarked resources
- `POST /api/bookmarks/:resourceId` — Save resource
- `DELETE /api/bookmarks/:resourceId` — Remove from saved
- `GET /api/notifications` — List notifications with unread count
- `PATCH /api/notifications/:id/read` — Mark notification read
- `PATCH /api/notifications/read-all` — Mark all read

### Leaderboard & User Profile
- `GET /api/leaderboard` — Public. Top contributors ranked by points with badges
- `GET /api/users/me` — Current student profile with statistics & badges
- `PATCH /api/users/me` — Update allowed profile fields

### Admin Console (Requires role: admin)
- `GET /api/admin/stats` — Platform counts (users, resources, pending, reports, downloads)
- `GET /api/admin/resources/pending` — List uploads awaiting review
- `PATCH /api/admin/resources/:id/moderation` — Approve or reject with reason
- `GET /api/admin/reports` — List student reports
- `PATCH /api/admin/reports/:id` — Resolve or dismiss report
- `GET /api/admin/users` — Paginated user directory
- `PATCH /api/admin/users/:id/status` — Restrict or restore student account

---

## 11. File Upload & Download Engine

- **Storage Location:** `server/uploads/`
- **Allowed File Types:** `.pdf`, `.ppt`, `.pptx`, `.doc`, `.docx`, `.jpg`, `.jpeg`, `.png`
- **File Size Limit:** 20 MB (configurable via `MAX_FILE_SIZE_MB`)
- **Security:**
  - Files are renamed with unique cryptographic timestamps and sanitized names: `timestamp_random_original.ext`.
  - Path traversal is prevented.
  - Actual downloads stream through `GET /api/resources/:id/download` with proper `Content-Disposition` headers and download count increments.

---

## 12. Contribution Points & Gamification

Points and badges are managed exclusively on the backend:
- **Resource Approved:** +10 points
- **Helpful Rating Received (≥ 4 stars):** +2 points
- **Review Received:** +2 points

### Badges:
- 🎓 **First Contribution:** First approved resource
- 📚 **Knowledge Sharer:** 5+ approved resources
- 🤝 **Helpful Student:** 10+ reviews received
- 🏆 **Top Contributor:** 100+ contribution points

---

## 13. Design System (Red Noir Aesthetic)

- **Primary Red:** `#EF233C`
- **Dark Red:** `#C8102E`
- **Dark Surface:** `#0B0B0D`
- **Elevated Surface:** `#18181B`
- **Deepest Background:** `#050505`
- **Light Theme Background:** `#F7F7F8`
- **Fonts:** Manrope (Headings), Inter (Body)
- **Theme Persistence:** Stored in `localStorage('studyswap-theme')`, defaults to dark mode.

---

## 14. Running Tests

StudySwap includes automated integration tests using Jest and Supertest. Tests run against an isolated in-memory MongoDB instance (`mongodb-memory-server`), requiring no external dependencies to be started.

```bash
npm test
```
*(or `cd server && npm test`)*

### Test Coverage:
- `tests/auth.test.js`: Registration, duplicate rejection, login, incorrect password, session cookie restoration, logout.
- `tests/resources.test.js`: Resource listing, search, filtering by semester/branch, multipart upload, pending status verification, public publication gate, ratings.
- `tests/bookmarks.test.js`: Saving resources, fetching bookmarks with enriched metadata, deleting bookmarks.
- `tests/admin.test.js`: Role access protection (401/403), platform statistics, resource rejection with reasons, notifications, student account restriction and restoration.

---

## 15. Project Architecture & Directory Structure

See detailed documentation files in `docs/`:
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — 6 Mermaid flowcharts explaining system architecture, upload, download, and moderation flows.
- [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) — All 11 MongoDB collections, field types, and indexes.
- [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) — Full REST API documentation.
- [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) — Complete file tree.
- [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) — Detailed manual and automated test guide.

---

## 16. Troubleshooting

### 1. MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`)
- **Cause:** Local MongoDB service is not started.
- **Fix:** Start MongoDB via your terminal:
  ```bash
  # macOS (Homebrew):
  brew services start mongodb-community
  # Or start mongod manually:
  mongod --dbpath /path/to/data/db
  ```
  Or paste your MongoDB Atlas URI into `server/.env`.

### 2. Port Already in Use (`EADDRINUSE: 5000` or `5173`)
- **Fix:** If another process is using port 5000, change `PORT=5001` in `server/.env` and update `VITE_API_URL=http://localhost:5001/api` in `studyswap-frontend-claude/.env`.

### 3. Cookies Not Storing in Browser
- Ensure `COOKIE_SECURE=false` in `server/.env` when testing locally over HTTP.
- Ensure browser allows third-party / localhost cookies.

---

## License

This project is developed for educational and academic capstone demonstration purposes.
