export type TaskStatus = "todo" | "in-progress" | "done"

export type TimerMode = "normal" | "pomodoro"

export type TimerSession = {
  id: string
  taskId: string
  startedAt: string
  endedAt: string | null
  durationSeconds: number
  mode: TimerMode
  pomodoroIntervals: number
}

export type StudyTask = {
  id: string
  title: string
  subject: string
  estimatedMinutes: number
  status: TaskStatus
  createdAt: string
  actualMinutes: number
  timerSessions: TimerSession[]
}

export type CreateTaskInput = Omit<StudyTask, "id" | "status" | "createdAt" | "actualMinutes" | "timerSessions">

export type FilterType = "all" | TaskStatus
export type SortDirection = "asc" | "desc"

export type TimerState = "idle" | "running" | "paused"

export type PomodoroPhase = "focus" | "break"
