# StudySwap — Frontend

[![Live Website](https://img.shields.io/badge/Live_Website-Visit_StudySwap-EF233C?style=for-the-badge&logo=vercel&logoColor=white)](https://study-swap-find-share-learn-togethe.vercel.app)

* 🚀 **Live Demo**: **[https://study-swap-find-share-learn-togethe.vercel.app](https://study-swap-find-share-learn-togethe.vercel.app)**
* ⚙️ **Backend API**: **[https://studyswap-api.onrender.com/api/health](https://studyswap-api.onrender.com/api/health)**

React + React Router + plain CSS (Vite). Talks to the Express/MongoDB API deployed on Render.

## Setup
```bash
npm install
cp .env.example .env      # set VITE_API_URL
npm run dev               # http://localhost:5173
npm run build             # production build into dist/
```
`VITE_API_URL` defaults to `http://localhost:5000/api`. Only public values belong in `.env`; never put secrets in `VITE_*` variables.

## Architecture
- `src/services/` — the only place that calls the network. `api.js` is the central client (`fetch`, `credentials: 'include'`, `ApiError`, XHR upload with progress). One module per API area.
- `src/contexts/` — `ThemeContext` (dark default, saved in `localStorage`, pre-applied in `index.html` to avoid a flash), `AuthContext` (session from `GET /auth/me`), `NotificationContext` (toasts).
- `src/layouts/` — Public, Student (sidebar + header + mobile nav) and Admin shells.
- `src/pages/` — public, auth, student and admin pages. `src/components/` — common, layout and resource components.
- `src/hooks/` — `useFetch`, `useDebounce`, `useBookmarkToggle`.
- `src/styles/` — CSS variables (Red Noir tokens), global, components, layout, responsive.

## Routes
Public: `/`, `/about`, `/login`, `/register`, `/forgot-password`.
Student (login required): `/app/dashboard`, `/app/materials` (the single Material Hub), `/app/materials/:id`, `/app/upload`, `/app/my-uploads`, `/app/saved`, `/app/leaderboard`, `/app/notifications`, `/app/profile`, `/app/settings`.
Admin (role `admin`): `/admin`, `/admin/resources`, `/admin/reports`, `/admin/users`.

Material Hub filters live in the URL (`?q=&college=&degree=&branch=&semester=&subject=&unit=&resourceType=&rating=&sort=&page=`). Search is debounced (400 ms); pagination is server-side.

## Authentication assumptions
Cookie-based (httpOnly) session. The frontend never stores tokens. The API must enable CORS with `credentials: true` for the frontend origin. `ProtectedRoute` is a UX guard only; the backend must enforce auth and roles on every endpoint. Registration never sends a role.

## Uploads and downloads
Uploads use `FormData` (field `file` plus text fields; `tags` is a JSON array string) via XHR for progress. Allowed: PDF, PPT, PPTX, DOC, DOCX, JPG, JPEG, PNG, max 20 MB (checked client-side; the backend must enforce it too). Downloads call `GET /resources/:id/download` with cookies and save the returned blob.

See `docs/API_CONTRACT.md` for endpoints and response shapes.

## Verification status
The project was written without network access, so `npm install` and `npm run build` have not been run here. Run them first and fix anything they report. Nothing backend-dependent has been tested against a real API.
