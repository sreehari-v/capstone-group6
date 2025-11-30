
<!-- Short, precise instructions to help an AI coding agent be immediately productive in this repo -->
# Copilot / AI Agent Guidance — CareOn (capstone-group6)

This file contains focused, actionable information for an AI coding agent working on this repository. Keep suggestions small, concrete, and tied to existing files.

## 1. Project type & how to run
- **Monorepo:** `frontend/` (React 19 + Vite) and `backend/` (Node.js + Express + MongoDB)
- **Frontend:**
  - Start dev server: `npm run dev` (or `yarn dev`) in `frontend/`
  - Build: `npm run build`
  - Lint: `npm run lint` (see `eslint.config.js`)
  - Preview: `npm run preview`
- **Backend:**
  - Start dev server: `npm run dev` (nodemon) in `backend/`
  - Start production: `npm start`
  - Main entry: `src/server.js`

## 2. High-level architecture
- **Frontend:**
  - SPA using React Router v7 (`src/routes/router.jsx`)
  - Layouts: `AppLayout.jsx` (main), `DashboardLayout.jsx` (dashboard)
  - Pages: `src/pages/*`, Components: `src/components/*`, Contexts: `src/contexts/*`
  - Routing is bootstrapped in `src/main.jsx` via `RouterProvider`
  - UI classes resemble Tailwind, but Tailwind is only loaded via CDN in `index.html` (not in `package.json`)
- **Backend:**
  - Express server (`src/server.js`)
  - MongoDB models in `src/models/`
  - Controllers in `src/controllers/`, routes in `src/routes/`
  - Auth, donation, medicine, step tracking features
  - Socket.io for real-time features (see `src/server.js`)
  - Email via nodemailer (`src/utils/mailer.js`)

## 3. Key patterns & examples
- **Frontend:**
  - Routing: `createBrowserRouter([...])` + `RouterProvider` (`src/main.jsx`)
  - Layouts use `<Outlet />` for nested content
  - Component CSS is colocated (e.g., `Component/Component.css`)
  - Auth context: `src/contexts/AuthContext.jsx`, protected routes: `src/components/ProtectedRoute.jsx`
- **Backend:**
  - Route files map to controllers (e.g., `auth.routes.js` → `auth.controller.js`)
  - Models use Mongoose (see `user.model.js`, `Medicine.js`, etc.)
  - Middleware for auth and CSRF in `src/middleware/`

## 4. Project-specific caveats
- **Frontend:**
  - UI classes look like Tailwind but are not guaranteed to work everywhere; check `index.css` and CDN config in `index.html`
  - `src/App.jsx` returns `null`; routing is handled in `main.jsx`
- **Backend:**
  - No test suite present; manual validation required
  - Environment variables in `backend/.env` (not committed)

## 5. Integration points & dependencies
- **Frontend:**
  - Uses Axios for API calls (see `package.json`)
  - No direct API client folder; add under `src/api/` if needed
- **Backend:**
  - MongoDB connection in `src/config/db.js`
  - Socket.io for real-time (see `src/server.js`)
  - Nodemailer for email

## 6. Developer workflows
- **Frontend:**
  - Start: `npm run dev` in `frontend/`
  - Build: `npm run build`
  - Lint: `npm run lint`
- **Backend:**
  - Start: `npm run dev` in `backend/`
  - Production: `npm start`

## 7. When making edits
- Prefer small, focused PRs per feature/page
- Update routes in `src/routes/router.jsx` (frontend) or `src/routes/*.js` (backend)
- Place new pages/components in correct folders
- For global styles, edit `src/index.css` (frontend)
- Backend: add new models/controllers/routes in respective folders

## 8. Files to inspect for context
- `frontend/package.json`, `backend/package.json` — scripts & deps
- `frontend/src/main.jsx` — app bootstrap
- `frontend/src/routes/router.jsx` — routing
- `frontend/src/layouts/AppLayout.jsx`, `DashboardLayout.jsx` — layouts
- `frontend/src/components/MainNavBar/MainNavBar.jsx` — nav example
- `backend/src/server.js` — Express server entry
- `backend/src/routes/`, `backend/src/controllers/`, `backend/src/models/` — API structure

## 9. What to avoid or double-check
- Don't assume Tailwind is available everywhere; check CDN config
- Don't change routing approach without updating bootstrap files
- No tests exist — include manual validation steps for logic changes

If anything in this file is unclear or you want me to expand a section (examples, more file references, or a short onboarding checklist for new contributors), tell me which part to expand.
