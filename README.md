# StudyBuddy+ app

A student task manager application with a Next.js frontend and Node.js/Express backend.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/jurrebrandseninfosupports-projects/v0-study-buddy-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/un0TbX7m7YV)

## Project Structure

```
studybuddy-workshop/
├── frontend/          # Next.js frontend application
├── backend/           # Express API backend
└── docker-compose.yml # Docker orchestration
```

## Quick Start (Recommended for Development)

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend API will run on http://localhost:3001

### 2. Start the Frontend

In a new terminal:

```bash
cd frontend
cp .env.example .env.local  # Copy environment variables
pnpm install
pnpm run dev
```

The frontend will run on http://localhost:3000

## Docker Setup (Alternative)

You can also run the application using Docker Compose:

```bash
docker compose up --build
```

This will start both services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

**Note:** Some environments may have SSL certificate issues with Docker builds. If you encounter these, use the development setup above instead.

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update task status
- `DELETE /api/tasks/:id` - Delete a task

## Features

- ✅ Create, read, update, and delete study tasks
- ✅ Track task status (todo, in-progress, done)
- ✅ Estimate time for each task
- ✅ Filter and sort tasks
- ✅ In-memory database with seeded example data
- ✅ Docker support for easy deployment