import type { StudyTask, CreateTaskInput, TaskStatus, PomodoroStats } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// --- API METHODS ---

export async function fetchTasks(): Promise<StudyTask[]> {
  const res = await fetch(`${API_BASE_URL}/api/tasks`)
  if (!res.ok) {
    throw new Error("Failed to fetch tasks")
  }
  return res.json()
}

export async function createTask(input: CreateTaskInput): Promise<StudyTask> {
  const res = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    throw new Error("Failed to create task")
  }

  return res.json()
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<StudyTask> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    throw new Error("Failed to update task")
  }

  return res.json()
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new Error("Failed to delete task")
  }
}

// Timer API functions
export async function startTimerSession(taskId: string, sessionType: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/timer/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionType }),
  })

  if (!res.ok) {
    throw new Error("Failed to start timer session")
  }
}

export async function completeTimerSession(
  taskId: string,
  sessionType: string,
  durationMinutes: number
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/timer/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionType, durationMinutes }),
  })

  if (!res.ok) {
    throw new Error("Failed to complete timer session")
  }
}

export async function getTimerStats(taskId: string): Promise<PomodoroStats> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/timer/stats`)

  if (!res.ok) {
    throw new Error("Failed to fetch timer stats")
  }

  return res.json()
}
