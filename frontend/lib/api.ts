import type { StudyTask, CreateTaskInput, TaskStatus, TimerMode, TimerSession } from "./types"

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

export async function fetchTaskById(id: string): Promise<StudyTask> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`)
  if (!res.ok) {
    throw new Error("Failed to fetch task")
  }
  return res.json()
}

export async function startTimer(taskId: string, mode: TimerMode): Promise<TimerSession> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/timer/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  })
  
  if (!res.ok) throw new Error("Failed to start timer")
  return res.json()
}

export async function stopTimer(taskId: string): Promise<TimerSession> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/timer/stop`, {
    method: "POST",
  })
  
  if (!res.ok) throw new Error("Failed to stop timer")
  return res.json()
}

export async function getActiveTimer(taskId: string): Promise<TimerSession | null> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/timer/active`)
  
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Failed to get active timer")
  return res.json()
}

export async function getTimerSessions(taskId: string): Promise<TimerSession[]> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/timer/sessions`)
  
  if (!res.ok) throw new Error("Failed to get timer sessions")
  return res.json()
}
