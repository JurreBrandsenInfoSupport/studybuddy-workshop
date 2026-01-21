export type TaskStatus = "todo" | "in-progress" | "done"

export type StudyTask = {
  id: string
  title: string
  subject: string
  estimatedMinutes: number
  status: TaskStatus
  createdAt: string
  totalPomodoros: number
  totalFocusMinutes: number
}

export type CreateTaskInput = Omit<StudyTask, "id" | "status" | "createdAt">

export type FilterType = "all" | TaskStatus
export type SortDirection = "asc" | "desc"

// Timer types
export type SessionType = "work" | "short-break" | "long-break"

export type TimerState = {
  sessionType: SessionType
  timeRemaining: number // seconds
  pomodoroCount: number // 0-4 (position in cycle)
  isActive: boolean
  isPaused: boolean
  lastTick: number // timestamp
  sessionStartedAt: string
}

export type PomodoroStats = {
  totalPomodoros: number
  totalFocusMinutes: number
  recentSessions: SessionDto[]
}

export type SessionDto = {
  id: string
  sessionType: string
  startedAt: string
  completedAt: string
  durationMinutes: number
}
