import express, { Request, Response } from "express";
import cors from "cors";
import { db } from "./database";
import { CreateTaskInput, TaskStatus } from "./types";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Get all tasks
app.get("/api/tasks", (req: Request, res: Response) => {
  const tasks = db.getAllTasks();
  res.json(tasks);
});

// Get a single task
app.get("/api/tasks/:id", (req: Request, res: Response) => {
  const task = db.getTaskById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json(task);
});

// Create a new task
app.post("/api/tasks", (req: Request, res: Response) => {
  const input: CreateTaskInput = req.body;
  
  if (!input.title || !input.subject || typeof input.estimatedMinutes !== "number") {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newTask = db.createTask(input);
  res.status(201).json(newTask);
});

// Update task status
app.patch("/api/tasks/:id", (req: Request, res: Response) => {
  const { status } = req.body;
  
  if (!status || !["todo", "in-progress", "done"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const updatedTask = db.updateTask(req.params.id, { status: status as TaskStatus });
  
  if (!updatedTask) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(updatedTask);
});

// Delete a task
app.delete("/api/tasks/:id", (req: Request, res: Response) => {
  const deleted = db.deleteTask(req.params.id);
  
  if (!deleted) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.status(204).send();
});

export default app;
