import type { StudyTask, CreateTaskInput, TaskStatus } from "./types"

// --- MOCK DATA & STORE ---
// This mimics a database. In a real app, this data would live on a server.
const MOCK_TASKS: StudyTask[] = [
  {
    id: "1",
    title: "Complete Calculus Problem Set",
    subject: "Math",
    estimatedMinutes: 60,
    status: "todo",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "2",
    title: "Read Chapter 4: Cell Structure",
    subject: "Biology",
    estimatedMinutes: 45,
    status: "in-progress",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "3",
    title: "Write History Essay Draft",
    subject: "History",
    estimatedMinutes: 120,
    status: "todo",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: "4",
    title: "Review French Vocabulary",
    subject: "French",
    estimatedMinutes: 30,
    status: "done",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
]

// We use a simple in-memory variable to store data for the session.
// This will reset when you refresh the page.
let tasksStore = [...MOCK_TASKS]

// Simulates network latency (e.g. 500ms) to make the UI feel realistic
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// --- API METHODS ---

export async function fetchTasks(): Promise<StudyTask[]> {
  await delay(600)

  // TODO: Replace with real API call
  // const res = await fetch('/api/tasks');
  // return res.json();

  return [...tasksStore]
}

export async function createTask(input: CreateTaskInput): Promise<StudyTask> {
  await delay(600)

  const newTask: StudyTask = {
    ...input,
    id: crypto.randomUUID(),
    status: "todo",
    createdAt: new Date().toISOString(),
  }

  // TODO: Replace with real API call
  // const res = await fetch('/api/tasks', { method: 'POST', body: JSON.stringify(input) });
  // return res.json();

  tasksStore = [newTask, ...tasksStore]
  return newTask
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<StudyTask> {
  await delay(400)

  // TODO: Replace with real API call
  // const res = await fetch(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  // return res.json();

  const taskIndex = tasksStore.findIndex((t) => t.id === id)
  if (taskIndex === -1) throw new Error("Task not found")

  const updatedTask = { ...tasksStore[taskIndex], status }
  tasksStore = [...tasksStore.slice(0, taskIndex), updatedTask, ...tasksStore.slice(taskIndex + 1)]

  return updatedTask
}

export async function deleteTask(id: string): Promise<void> {
  await delay(400)

  // TODO: Replace with real API call
  // await fetch(`/api/tasks/${id}`, { method: 'DELETE' });

  tasksStore = tasksStore.filter((t) => t.id !== id)
}
