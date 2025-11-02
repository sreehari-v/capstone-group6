<!-- Short, precise instructions to help an AI coding agent be immediately productive in this repo -->
# Copilot / AI Agent Guidance — CareOn (capstone-group6)

This file contains focused, actionable information for an AI coding agent working on this repository. Keep suggestions small, concrete, and tied to existing files.

1. Project type & how to run
- Framework: React (React 19) + Vite.
- Start dev server: run the `dev` script from the repo root (uses Vite):
  - package: `package.json` -> scripts: `dev`, `build`, `preview`, `lint`.
  - Typical command: `npm run dev` (or `yarn dev`).

2. High-level architecture (big picture)
- Single-page React app using React Router v7 (see `src/routes/router.jsx`).
- Layouts are used for grouping pages:
  - `src/layouts/AppLayout.jsx` — main layout; mounts `MainNavBar` and `MainFooter` and renders route children via `<Outlet />`.
  - `src/layouts/DashboardLayout.jsx` — dashboard layout; renders `DashNav` (left side) and an `<Outlet />` container for dashboard pages.
- Pages live in `src/pages/*`. Components in `src/components/*`. Assets under `src/assets/images`.

3. Key patterns & examples
- Routing: `createBrowserRouter([...])` + `RouterProvider` in `src/main.jsx`. Use nested routes and `Outlet` for content placement (see `src/routes/router.jsx`).
- Layouts: prefer adding small presentational logic to layout files (nav/footer) and keep pages focused on content. Example: `AppLayout.jsx` adds padding/top to account for fixed navbar.
- Component conventions: default exports for components (e.g., `MainNavBar.jsx`), CSS colocated as `ComponentName/ComponentName.css`.

4. Project-specific caveats agents must know
- UI classes look like Tailwind utility classes (e.g. `flex`, `md:flex`, `text-xl`) but Tailwind is not declared in `package.json`. Do not assume Tailwind is installed/configured — inspect `index.css` and component CSS files first before adding Tailwind-specific code.
- `src/App.jsx` currently returns `null` — routing is driven by `src/main.jsx` and `RouterProvider`, so edits to `App.jsx` may have no effect unless routing is changed.

5. External dependencies & integration points
- Frontend-only at present: dependencies are `react`, `react-dom`, `react-router`, and Vite plugin for React. No API client or backend directory present — check for added `api/` or `services/` folders before assuming remote integrations.

6. Developer workflows
- Start dev server: `npm run dev` (Vite).
- Build for production: `npm run build`.
- Lint: `npm run lint` (ESLint). ESLint configuration file is `eslint.config.js` at repo root.
- Preview built site: `npm run preview`.

7. When making edits
- Prefer small, focused PRs that change a single feature or page. Tests are not present; include simple smoke checks or a short README note if you add major behavior.
- When adding routes, update `src/routes/router.jsx` and place pages under `src/pages/` following existing naming.
- When adding global styles, modify `src/index.css` or create a new CSS file imported by `main.jsx`.

8. Files to inspect for context (quick references)
- `package.json` — scripts & deps.
- `src/main.jsx` — app bootstrap, `RouterProvider` usage.
- `src/routes/router.jsx` — canonical routing definitions and paths (dashboard children: `steps`, `medication`, `breath`).
- `src/layouts/AppLayout.jsx`, `src/layouts/DashboardLayout.jsx` — layout patterns and where to mount nav/footer.
- `src/components/MainNavBar/MainNavBar.jsx` — top nav example (uses `NavLink`).

9. What to avoid or double-check
- Don't assume Tailwind is available (see caveat 4).
- Don't change routing approach without updating `main.jsx` bootstrap.
- No tests exist — if you add logic-sensitive code, include a minimal test or a reproducible manual step in the PR description.

If anything in this file is unclear or you want me to expand a section (examples, more file references, or a short onboarding checklist for new contributors), tell me which part to expand.
