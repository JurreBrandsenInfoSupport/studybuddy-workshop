import request from "supertest";
import app from "../app";
import { db } from "../database";

describe("API Endpoints", () => {
  beforeEach(() => {
    // Reset database to initial state before each test
    db.reset();
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    });
  });

  describe("GET /api/tasks", () => {
    it("should return all tasks", async () => {
      const response = await request(app).get("/api/tasks");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(4);
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("title");
      expect(response.body[0]).toHaveProperty("subject");
      expect(response.body[0]).toHaveProperty("estimatedMinutes");
      expect(response.body[0]).toHaveProperty("status");
      expect(response.body[0]).toHaveProperty("difficulty");
      expect(response.body[0]).toHaveProperty("createdAt");
    });

    it("should return empty array when no tasks exist", async () => {
      // Delete all tasks
      db.deleteTask("1");
      db.deleteTask("2");
      db.deleteTask("3");
      db.deleteTask("4");

      const response = await request(app).get("/api/tasks");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("should return a single task by id", async () => {
      const response = await request(app).get("/api/tasks/1");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("1");
      expect(response.body.title).toBe("Complete Calculus Problem Set");
    });

    it("should return 404 for non-existent task", async () => {
      const response = await request(app).get("/api/tasks/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Task not found" });
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a new task with valid data", async () => {
      const newTask = {
        title: "Test Task",
        subject: "Testing",
        estimatedMinutes: 45,
        difficulty: "medium",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(newTask)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
      expect(response.body.id).toBe("5");
      expect(response.body.title).toBe(newTask.title);
      expect(response.body.subject).toBe(newTask.subject);
      expect(response.body.estimatedMinutes).toBe(newTask.estimatedMinutes);
      expect(response.body.difficulty).toBe(newTask.difficulty);
      expect(response.body.status).toBe("todo");
      expect(response.body.createdAt).toBeDefined();
    });

    it("should create task with difficulty level", async () => {
      const newTask = {
        title: "Test Task",
        subject: "Testing",
        estimatedMinutes: 45,
        difficulty: "hard",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(newTask)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
      expect(response.body.difficulty).toBe("hard");
    });

    it("should return 400 for invalid difficulty level", async () => {
      const newTask = {
        title: "Test Task",
        subject: "Testing",
        estimatedMinutes: 45,
        difficulty: "super-hard",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(newTask)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid difficulty level" });
    });

    it("should return 400 when difficulty is missing", async () => {
      const newTask = {
        title: "Test Task",
        subject: "Testing",
        estimatedMinutes: 45,
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(newTask)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Missing required fields" });
    });

    it("should return 400 when title is missing", async () => {
      const invalidTask = {
        subject: "Testing",
        estimatedMinutes: 45,
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(invalidTask)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Missing required fields" });
    });

    it("should return 400 when subject is missing", async () => {
      const invalidTask = {
        title: "Test Task",
        estimatedMinutes: 45,
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(invalidTask)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Missing required fields" });
    });

    it("should return 400 when estimatedMinutes is missing", async () => {
      const invalidTask = {
        title: "Test Task",
        subject: "Testing",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(invalidTask)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Missing required fields" });
    });

    it("should return 400 when estimatedMinutes is not a number", async () => {
      const invalidTask = {
        title: "Test Task",
        subject: "Testing",
        estimatedMinutes: "not a number",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(invalidTask)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Missing required fields" });
    });

    it("should handle edge case with zero minutes", async () => {
      const newTask = {
        title: "Quick Task",
        subject: "Testing",
        estimatedMinutes: 0,
        difficulty: "easy",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(newTask)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
      expect(response.body.estimatedMinutes).toBe(0);
    });

    it("should handle edge case with large minutes value", async () => {
      const newTask = {
        title: "Long Task",
        subject: "Testing",
        estimatedMinutes: 999999,
        difficulty: "hard",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(newTask)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
      expect(response.body.estimatedMinutes).toBe(999999);
    });
  });

  describe("PATCH /api/tasks/:id", () => {
    it("should update task status to 'done'", async () => {
      const response = await request(app)
        .patch("/api/tasks/1")
        .send({ status: "done" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("1");
      expect(response.body.status).toBe("done");
    });

    it("should update task status to 'in-progress'", async () => {
      const response = await request(app)
        .patch("/api/tasks/1")
        .send({ status: "in-progress" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("in-progress");
    });

    it("should update task status to 'todo'", async () => {
      const response = await request(app)
        .patch("/api/tasks/2")
        .send({ status: "todo" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("todo");
    });

    it("should return 400 when status is missing", async () => {
      const response = await request(app)
        .patch("/api/tasks/1")
        .send({})
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid status" });
    });

    it("should return 400 when status is invalid", async () => {
      const response = await request(app)
        .patch("/api/tasks/1")
        .send({ status: "invalid-status" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid status" });
    });

    it("should return 404 for non-existent task", async () => {
      const response = await request(app)
        .patch("/api/tasks/999")
        .send({ status: "done" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Task not found" });
    });

    it("should preserve other task properties when updating status", async () => {
      const originalTask = db.getTaskById("1");

      const response = await request(app)
        .patch("/api/tasks/1")
        .send({ status: "done" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(originalTask?.title);
      expect(response.body.subject).toBe(originalTask?.subject);
      expect(response.body.estimatedMinutes).toBe(originalTask?.estimatedMinutes);
    });

    it("should update task with funRating when provided", async () => {
      const response = await request(app)
        .patch("/api/tasks/1")
        .send({ status: "done", funRating: 5 })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("1");
      expect(response.body.status).toBe("done");
      expect(response.body.funRating).toBe(5);
    });

    it("should accept valid funRating values (1-5)", async () => {
      const validRatings = [1, 2, 3, 4, 5];

      for (const rating of validRatings) {
        const response = await request(app)
          .patch("/api/tasks/1")
          .send({ status: "done", funRating: rating })
          .set("Content-Type", "application/json");

        expect(response.status).toBe(200);
        expect(response.body.funRating).toBe(rating);
      }
    });

    it("should return 400 for invalid funRating (out of range)", async () => {
      const response = await request(app)
        .patch("/api/tasks/1")
        .send({ status: "done", funRating: 6 })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid funRating. Must be a number between 1 and 5" });
    });

    it("should return 400 for invalid funRating (zero)", async () => {
      const response = await request(app)
        .patch("/api/tasks/1")
        .send({ status: "done", funRating: 0 })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid funRating. Must be a number between 1 and 5" });
    });

    it("should return 400 for invalid funRating (non-number)", async () => {
      const response = await request(app)
        .patch("/api/tasks/1")
        .send({ status: "done", funRating: "very fun" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid funRating. Must be a number between 1 and 5" });
    });

    it("should allow updating status without funRating", async () => {
      const response = await request(app)
        .patch("/api/tasks/1")
        .send({ status: "in-progress" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("in-progress");
      expect(response.body.funRating).toBeUndefined();
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete an existing task", async () => {
      const response = await request(app).delete("/api/tasks/1");

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      // Verify task is deleted
      const getResponse = await request(app).get("/api/tasks/1");
      expect(getResponse.status).toBe(404);
    });

    it("should return 404 for non-existent task", async () => {
      const response = await request(app).delete("/api/tasks/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Task not found" });
    });

    it("should reduce the total task count", async () => {
      const beforeResponse = await request(app).get("/api/tasks");
      const beforeCount = beforeResponse.body.length;

      await request(app).delete("/api/tasks/1");

      const afterResponse = await request(app).get("/api/tasks");
      const afterCount = afterResponse.body.length;

      expect(afterCount).toBe(beforeCount - 1);
    });

    it("should not affect other tasks when deleting one", async () => {
      await request(app).delete("/api/tasks/1");

      const task2 = await request(app).get("/api/tasks/2");
      const task3 = await request(app).get("/api/tasks/3");

      expect(task2.status).toBe(200);
      expect(task3.status).toBe(200);
    });
  });

  describe("Error handling and edge cases", () => {
    it("should handle malformed JSON in POST request", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send("not valid json")
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should handle empty POST body", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({})
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Missing required fields" });
    });

    it("should handle multiple rapid task creations", async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post("/api/tasks")
          .send({
            title: `Task ${i}`,
            subject: "Testing",
            estimatedMinutes: 30,
            difficulty: "medium",
          })
          .set("Content-Type", "application/json")
      );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(201);
      });

      const tasksResponse = await request(app).get("/api/tasks");
      expect(tasksResponse.body).toHaveLength(9); // 4 initial + 5 new
    });

    it("should handle special characters in task title", async () => {
      const newTask = {
        title: "Task with special chars: @#$%^&*()",
        subject: "Testing",
        estimatedMinutes: 30,
        difficulty: "easy",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(newTask)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(newTask.title);
    });

    it("should handle very long task title", async () => {
      const newTask = {
        title: "A".repeat(1000),
        subject: "Testing",
        estimatedMinutes: 30,
        difficulty: "hard",
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(newTask)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(newTask.title);
    });
  });
});
