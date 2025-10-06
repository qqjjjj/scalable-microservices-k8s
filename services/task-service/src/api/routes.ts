import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { TaskService } from "../application/task-service.js";

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  userId: z.string().uuid(),
});

export async function taskRoutes(fastify: FastifyInstance) {
  const taskService = new TaskService();

  // Create task
  fastify.post("/tasks", async (request, reply) => {
    const body = createTaskSchema.parse(request.body);

    const task = await taskService.createTask(body);

    reply.code(201).send({
      success: true,
      data: task,
    });
  });

  // Get task by ID
  fastify.get("/tasks/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const task = await taskService.getTask(id);

    if (!task) {
      reply.code(404).send({
        success: false,
        error: "Task not found",
      });
      return;
    }

    reply.send({
      success: true,
      data: task,
    });
  });

  // Get user tasks
  fastify.get("/users/:userId/tasks", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { limit } = request.query as { limit?: string };

    const tasks = await taskService.getUserTasks(
      userId,
      limit ? parseInt(limit) : 20
    );

    reply.send({
      success: true,
      data: tasks,
    });
  });

  // Health check
  fastify.get("/tasks/health", async () => {
    return { status: "ok", service: "task-service" };
  });

  // Stats endpoint
  fastify.get("/tasks/stats", async () => {
    return {
      service: "task-service",
      ...taskService.getStats(),
    };
  });
}
