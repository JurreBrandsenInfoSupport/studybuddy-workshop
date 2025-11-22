export type TaskStatus = "todo" | "in-progress" | "done";

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  status: TaskStatus;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  subject: string;
  estimatedMinutes: number;
}
