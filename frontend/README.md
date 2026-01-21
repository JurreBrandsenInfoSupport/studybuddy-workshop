# StudyBuddy+ Frontend

A modern, responsive task management dashboard built with Next.js 14, React 19, and Tailwind CSS. This frontend application provides students with an intuitive interface to manage their study tasks, track progress, and organize their workload.

## Features

- 📝 **Task Management**: Create, update, and delete study tasks
- 🎯 **Status Tracking**: Track tasks through todo, in-progress, and done states
- ⏱️ **Time Estimation**: Set and monitor estimated time for each task
- 🔍 **Filtering & Sorting**: Filter by status and sort by time
- 📊 **Dashboard Stats**: Real-time statistics and progress overview
- 🎨 **Modern UI**: Built with Radix UI components and Tailwind CSS
- 🌙 **Theme Support**: Light/dark mode with next-themes
- ✅ **Fully Tested**: Comprehensive test suite with Jest and React Testing Library

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **React**: Version 19.2.0
- **TypeScript**: Full type safety
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Native Fetch API
- **Testing**: Jest + React Testing Library
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and configure:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Start the development server:**
   ```bash
   pnpm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `pnpm run dev` - Start development server on port 3000
- `pnpm run build` - Build production-ready application
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm test` - Run test suite
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Generate test coverage report

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Home page (dashboard)
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── study-dashboard.tsx    # Main dashboard component
│   ├── task-card.tsx         # Individual task card
│   ├── add-task-form.tsx     # Task creation form
│   ├── task-filters.tsx      # Filter/sort controls
│   ├── theme-provider.tsx    # Theme context provider
│   └── __tests__/            # Component tests
├── lib/                   # Utilities and helpers
│   ├── api.ts            # API client functions
│   ├── types.ts          # TypeScript type definitions
│   ├── utils.ts          # Utility functions
│   └── __tests__/        # Library tests
├── public/               # Static assets
└── styles/               # Additional stylesheets
```

## Component Overview

### StudyDashboard
Main container component that orchestrates the entire dashboard experience:
- Manages task state and loading states
- Handles filtering and sorting logic
- Calculates statistics and metrics
- Coordinates API calls

### TaskCard
Displays individual task information with:
- Task title and description
- Status badge and controls
- Time estimation
- Delete functionality
- Optimistic UI updates

### AddTaskForm
Form component for creating new tasks:
- React Hook Form integration
- Zod schema validation
- Time estimation input
- Error handling

### TaskFilters
Control panel for:
- Status filtering (all, todo, in-progress, done)
- Time-based sorting (ascending/descending)

## API Integration

The frontend communicates with the backend API through the `lib/api.ts` module:

```typescript
// Fetch all tasks
fetchTasks(): Promise<StudyTask[]>

// Create a new task
createTask(input: CreateTaskInput): Promise<StudyTask>

// Update task status
updateTaskStatus(id: string, status: TaskStatus): Promise<StudyTask>

// Delete a task
deleteTask(id: string): Promise<void>
```

Configure the API URL via the `NEXT_PUBLIC_API_URL` environment variable.

## Testing

The frontend has comprehensive test coverage (53 passing tests):

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

**Test Coverage:**
- Component rendering and interactions
- Form validation and submission
- API client functions
- Filtering and sorting logic
- Error handling scenarios

## Styling

The application uses Tailwind CSS with:
- Custom color scheme
- Responsive design patterns
- Dark mode support
- Radix UI component styling
- CSS variables for theming

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000` |

## Docker Support

Build and run with Docker:

```bash
# Build image
docker build -t studybuddy-frontend .

# Run container
docker run -p 3000:3000 studybuddy-frontend
```

Or use docker-compose from the root directory:

```bash
docker compose up frontend
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Ensure all tests pass before submitting
4. Update documentation as needed

## Troubleshooting

**API Connection Issues:**
- Verify the backend is running on the configured port
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure no CORS issues (backend should allow localhost:3000)

**Build Errors:**
- Clear `.next` directory: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && pnpm install`
- Check Node.js version compatibility

## License

Part of the StudyBuddy+ workshop project.
