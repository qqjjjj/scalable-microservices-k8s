import { randomUUID } from "crypto";
import type { Task, CreateTaskData, TaskCreatedEvent } from "../domain/task.js";
import { memoryStore } from "../infrastructure/memory-store.js";
import { publishTaskCreated } from "../infrastructure/rabbitmq.js";

export class TaskService {
  async createTask(data: CreateTaskData): Promise<Task> {
    const task: Task = {
      id: randomUUID(),
      title: data.title,
      description: data.description,
      userId: data.userId,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to memory store (with simulated DB latency)
    await memoryStore.saveTask(task);

    // Publish event for notification service (with graceful degradation)
    const event: TaskCreatedEvent = {
      type: "task.created",
      taskId: task.id,
      userId: task.userId,
      title: task.title,
      timestamp: new Date(),
    };

    try {
      await publishTaskCreated(event);
      console.log(`📤 Event published for task ${task.id}`);
    } catch (error) {
      console.error(
        `⚠️ Failed to publish event for task ${task.id}, but task was created:`,
        error
      );
      // Task creation still succeeds - notifications just won't be sent
      // In production, would store event for retry when RabbitMQ recovers
    }

    console.log(`✅ Task created: ${task.id} for user ${task.userId}`);
    return task;
  }

  async getTask(taskId: string): Promise<Task | null> {
    return await memoryStore.getTask(taskId);
  }

  async getUserTasks(userId: string, limit = 20): Promise<Task[]> {
    return await memoryStore.getUserTasks(userId, limit);
  }

  getStats() {
    return memoryStore.getStats();
  }
}
