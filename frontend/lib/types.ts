export type TaskStatus = "todo" | "in-progress" | "done"

export type StudyTask = {
  id: string
  title: string
  subject: string
  estimatedMinutes: number
  status: TaskStatus
  createdAt: string
}

export type CreateTaskInput = Omit<StudyTask, "id" | "status" | "createdAt">

export type FilterType = "all" | TaskStatus
export type SortDirection = "asc" | "desc"
