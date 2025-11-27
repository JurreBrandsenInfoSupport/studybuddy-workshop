import type { StudyTask, CreateTaskInput, TaskStatus, FunRating } from "./types"

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

export async function updateTaskStatus(id: string, status: TaskStatus, funRating?: FunRating): Promise<StudyTask> {
  const body: { status: TaskStatus; funRating?: FunRating } = { status }
  if (funRating !== undefined) {
    body.funRating = funRating
  }

  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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
