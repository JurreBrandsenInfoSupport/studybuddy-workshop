export type TaskStatus = "todo" | "in-progress" | "done";

export type TaskDifficulty = "easy" | "medium" | "hard";

export type FunRating = 1 | 2 | 3 | 4 | 5;

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  status: TaskStatus;
  difficulty: TaskDifficulty;
  createdAt: string;
  funRating?: FunRating;
}

export interface CreateTaskInput {
  title: string;
  subject: string;
  estimatedMinutes: number;
  difficulty: TaskDifficulty;
}
