import { StudyTask } from "./types";

// In-memory database with seeded data
const INITIAL_TASKS: StudyTask[] = [
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
];

class Database {
  private tasks: StudyTask[] = [...INITIAL_TASKS];
  private nextId = 5;

  getAllTasks(): StudyTask[] {
    return [...this.tasks];
  }

  getTaskById(id: string): StudyTask | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  createTask(input: Omit<StudyTask, "id" | "status" | "createdAt">): StudyTask {
    const newTask: StudyTask = {
      ...input,
      id: String(this.nextId++),
      status: "todo",
      createdAt: new Date().toISOString(),
    };
    this.tasks.push(newTask);
    return newTask;
  }

  updateTask(id: string, updates: Partial<StudyTask>): StudyTask | null {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) return null;

    this.tasks[index] = { ...this.tasks[index], ...updates };
    return this.tasks[index];
  }

  deleteTask(id: string): boolean {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) return false;

    this.tasks.splice(index, 1);
    return true;
  }
}

export const db = new Database();
