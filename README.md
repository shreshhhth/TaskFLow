# TaskFlow — MERN To-Do App



## Stack
- Frontend: React + Vite + JavaScript + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- HTTP: Axios
- Icons: lucide-react

## Features
- Create, edit, delete tasks
- Required title and scheduled date/time for the task
- Optional description and Low / Medium / High priorities
- In Progress / Completed status for your task
- Search across title and description in the search task
- Monday–Sunday weekly grouping for tasks
- Weekly open and completed task counts
- Expand/collapse week cards
- Responsive mobile and desktop layouts
- REST API with validation, centralized errors, and MongoDB indexes

## Project structure

taskflow-mern-assignment/
  client/
    src/
      components/
      lib/
      App.jsx
      main.jsx
      index.css
    .env.example
    package.json
    vite.config.js
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
      app.js
      server.js
    .env.example
    package.json
```

## Run locally

### 1. Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas database

### 2. Backend
```bash
cd server
cp .env.example .env
# Set MONGODB_URI in .env
npm install
npm run dev
```
API runs at `http://localhost:5000`; health check: `GET /api/health`.

### 3. Frontend
In another terminal:
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Open the Vite URL (normally `http://localhost:5173`).

## API

Base URL: `/api/tasks`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tasks` | List tasks; supports `search`, `status`, `priority`, `from`, `to` |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task fields/status |
| DELETE | `/api/tasks/:id` | Delete task |

Example create body:
```json
{
  "title": "Prepare assignment",
  "description": "Finish the weekly task manager",
  "scheduledAt": "2026-11-05T10:30:00.000Z",
  "priority": "High"
}
```

Task status values: `In Progress`, `Completed`.
Priority values: `Low`, `Medium`, `High`.

## Deployment

### Backend (Render)
1. Create a MongoDB Atlas cluster and allow the Render service IPs (or use the provider's documented network access setup).
2. Create a Render Web Service using the `server` directory as root.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add `MONGODB_URI` (currently addded in .env), `CLIENT_ORIGIN` (deployed frontend URL), and `NODE_ENV=production`.


### Frontend (Netlify)
1. Create a Netlify site from the repository.
2. Base directory: `client`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set `VITE_API_URL` to the deployed backend origin plus `/api` (for example `https://your-api.onrender.com/api`).

## Engineering notes
- Week boundaries are calculated in the browser's local timezone, Monday 00:00 through the next Monday 00:00 (exclusive).
- Dates are stored as UTC instants in MongoDB and displayed in the user's local timezone.
- The API validates input and normalizes scheduled dates.
- For a production multi-user product, add authentication and an owner/user reference to every task. Authentication is not specified in the supplied assignment, so it is intentionally not added here.