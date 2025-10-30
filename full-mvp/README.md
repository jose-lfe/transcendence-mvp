# Full MVP — Frontend (TypeScript + Tailwind) + Backend (Fastify) + Docker Compose

Structure:
- frontend/ : Vanilla TypeScript + Tailwind project. Builds to `dist/` and served by nginx. `nginx` proxies `/api/` to backend.
- backend/ : Fastify (Node.js) API on port 3000.
- docker-compose.yml: builds and runs both services.

## Quick start

Build and run both services:
```bash
docker compose up --build
```

Open the app in your browser:
- Frontend (served by nginx) : http://localhost
- Backend API (direct) : http://localhost:3000/api/health

To stop:
```bash
docker compose down
```
