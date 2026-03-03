# HR Platform — Complete README

## Project Structure
- `backend/` API (server-side)
- `frontend/` React (CRA) client-side app
- `database.sql` database schema / seed (if applicable)
- `deployment-guide.md` deployment notes

## Requirements
- Node.js 18+ recommended
- npm (or yarn)

## Backend — Run
From project root:
```bash
cd backend
npm install
npm start
```

## Frontend — Run
From project root:
```bash
cd frontend
npm install
npm start
```

If the browser doesn't open automatically, visit:
- http://localhost:3000

## Environment Variables
See:
- `.env.example`

Create `.env` in the project root (and/or in `frontend/.env` / `backend/.env` if your code expects it).

## Notes
- Frontend uses `react-scripts` (CRA).
- If you don't have a `public/index.html` under `frontend/`, CRA won't start properly.
  In that case create `frontend/public/index.html` with a `<div id="root"></div>`.
