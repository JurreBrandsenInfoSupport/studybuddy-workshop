export type TaskStatus = "todo" | "in-progress" | "done";

export type TaskDifficulty = "easy" | "medium" | "hard";

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  status: TaskStatus;
  difficulty: TaskDifficulty;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  subject: string;
  estimatedMinutes: number;
  difficulty: TaskDifficulty;
}
