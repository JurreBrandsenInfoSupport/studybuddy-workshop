import { db } from "../database";
import { StudyTask } from "../types";

describe("Database", () => {
  beforeEach(() => {
    // Reset database to initial state before each test
    db.reset();
  });

  describe("getAllTasks", () => {
    it("should return all tasks", () => {
      const tasks = db.getAllTasks();
      expect(tasks).toHaveLength(4);
      expect(tasks[0]).toHaveProperty("id");
      expect(tasks[0]).toHaveProperty("title");
      expect(tasks[0]).toHaveProperty("subject");
      expect(tasks[0]).toHaveProperty("estimatedMinutes");
      expect(tasks[0]).toHaveProperty("status");
      expect(tasks[0]).toHaveProperty("createdAt");
    });

    it("should return a copy of tasks array", () => {
      const tasks1 = db.getAllTasks();
      const tasks2 = db.getAllTasks();
      expect(tasks1).not.toBe(tasks2);
      expect(tasks1).toEqual(tasks2);
    });
  });

  describe("getTaskById", () => {
    it("should return a task by id", () => {
      const task = db.getTaskById("1");
      expect(task).toBeDefined();
      expect(task?.id).toBe("1");
      expect(task?.title).toBe("Complete Calculus Problem Set");
    });

    it("should return undefined for non-existent task", () => {
      const task = db.getTaskById("999");
      expect(task).toBeUndefined();
    });
  });

  describe("createTask", () => {
    it("should create a new task with default status 'todo'", () => {
      const input = {
        title: "Test Task",
        subject: "Testing",
        estimatedMinutes: 30,
      };

      const newTask = db.createTask(input);

      expect(newTask).toBeDefined();
      expect(newTask.id).toBe("5"); // Next ID after initial 4 tasks
      expect(newTask.title).toBe(input.title);
      expect(newTask.subject).toBe(input.subject);
      expect(newTask.estimatedMinutes).toBe(input.estimatedMinutes);
      expect(newTask.status).toBe("todo");
      expect(newTask.createdAt).toBeDefined();
    });

    it("should increment task id for each new task", () => {
      const task1 = db.createTask({
        title: "Task 1",
        subject: "Subject 1",
        estimatedMinutes: 30,
      });
      const task2 = db.createTask({
        title: "Task 2",
        subject: "Subject 2",
        estimatedMinutes: 45,
      });

      expect(task1.id).toBe("5");
      expect(task2.id).toBe("6");
    });

    it("should add task to the tasks list", () => {
      const initialCount = db.getAllTasks().length;
      db.createTask({
        title: "New Task",
        subject: "Subject",
        estimatedMinutes: 60,
      });
      const newCount = db.getAllTasks().length;

      expect(newCount).toBe(initialCount + 1);
    });
  });

  describe("updateTask", () => {
    it("should update a task's status", () => {
      const updatedTask = db.updateTask("1", { status: "done" });

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.id).toBe("1");
      expect(updatedTask?.status).toBe("done");
    });

    it("should update a task's title", () => {
      const updatedTask = db.updateTask("1", { title: "Updated Title" });

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.title).toBe("Updated Title");
    });

    it("should update multiple fields at once", () => {
      const updatedTask = db.updateTask("1", {
        title: "New Title",
        status: "in-progress",
        estimatedMinutes: 90,
      });

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.title).toBe("New Title");
      expect(updatedTask?.status).toBe("in-progress");
      expect(updatedTask?.estimatedMinutes).toBe(90);
    });

    it("should return null for non-existent task", () => {
      const updatedTask = db.updateTask("999", { status: "done" });
      expect(updatedTask).toBeNull();
    });

    it("should preserve other fields when updating", () => {
      const originalTask = db.getTaskById("1");
      const updatedTask = db.updateTask("1", { status: "done" });

      expect(updatedTask?.title).toBe(originalTask?.title);
      expect(updatedTask?.subject).toBe(originalTask?.subject);
      expect(updatedTask?.estimatedMinutes).toBe(originalTask?.estimatedMinutes);
    });
  });

  describe("deleteTask", () => {
    it("should delete a task and return true", () => {
      const result = db.deleteTask("1");
      expect(result).toBe(true);

      const task = db.getTaskById("1");
      expect(task).toBeUndefined();
    });

    it("should return false for non-existent task", () => {
      const result = db.deleteTask("999");
      expect(result).toBe(false);
    });

    it("should reduce the tasks count", () => {
      const initialCount = db.getAllTasks().length;
      db.deleteTask("1");
      const newCount = db.getAllTasks().length;

      expect(newCount).toBe(initialCount - 1);
    });
  });

  describe("reset", () => {
    it("should reset database to initial state", () => {
      // Modify the database
      db.createTask({ title: "Test", subject: "Test", estimatedMinutes: 30 });
      db.deleteTask("1");
      db.updateTask("2", { status: "done" });

      // Reset
      db.reset();

      // Verify it's back to initial state
      const tasks = db.getAllTasks();
      expect(tasks).toHaveLength(4);
      expect(db.getTaskById("1")).toBeDefined();
      expect(db.getTaskById("2")?.status).toBe("in-progress");
    });

    it("should reset the next id counter", () => {
      db.createTask({ title: "Test", subject: "Test", estimatedMinutes: 30 });
      db.reset();
      
      const newTask = db.createTask({ title: "Test", subject: "Test", estimatedMinutes: 30 });
      expect(newTask.id).toBe("5");
    });
  });
});
