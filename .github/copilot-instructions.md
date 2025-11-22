# GitHub Copilot Instructions

Follow these instructions when writing code or documentation for this project.

## Project Overview

StudyBuddy+ is a task management application for students, helping them organize
study tasks with time estimates, status tracking, and filtering capabilities.

## Project Structure

This is a monorepo containing:
- `frontend/` - Next.js application (React, TypeScript, Tailwind CSS)
- `backend/` - Express.js REST API (Node.js, TypeScript)
- In-memory database with seeded example data

## Technology Stack

### Frontend
- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React hooks and Server Components where possible

### Backend
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** In-memory (array-based for development)
- **API Style:** RESTful

## Coding Standards

- Use TypeScript for all new code
- Follow functional programming principles where applicable
- Prefer Server Components in Next.js unless client interactivity is needed
- Use async/await over promises
- API responses should follow the format: `{ success: boolean, data?: any, error?: string }`
- All API endpoints should be prefixed with `/api/`

## Feature Development Guidelines

- New features should include both frontend and backend changes
- Always update types/interfaces when adding new data fields
- Consider existing task properties: title, description, status, estimatedTime
- Test with existing seeded data first