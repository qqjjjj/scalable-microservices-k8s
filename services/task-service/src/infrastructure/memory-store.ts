// Mock data store that simulates database latency without actually storing data
// Perfect for load testing - focuses on request handling, not data persistence

import type { Task } from "../domain/task.js";

class MemoryStore {
  async saveTask(task: Task): Promise<void> {
    // Simulate database write latency (2-5ms)
    await this.simulateDbLatency(2, 5);
    // Don't actually store anything - just simulate the time
  }

  async getTask(taskId: string): Promise<Task | null> {
    // Simulate database read latency (1-3ms)
    await this.simulateDbLatency(1, 3);

    // Return mock task for demo purposes
    return {
      id: taskId,
      title: "Mock Task",
      description: "This is a simulated task for load testing",
      userId: "mock-user-id",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getUserTasks(userId: string, limit = 20): Promise<Task[]> {
    // Simulate database query latency (3-8ms)
    await this.simulateDbLatency(3, 8);

    // Return mock tasks for demo purposes
    return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      id: `mock-task-${i}`,
      title: `Mock Task ${i + 1}`,
      description: `Simulated task ${i + 1} for user ${userId}`,
      userId: userId,
      status: "pending" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  private async simulateDbLatency(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Get stats for monitoring (mock data)
  getStats() {
    return {
      totalTasks: Math.floor(Math.random() * 10000), // Random number for demo
      totalUsers: Math.floor(Math.random() * 1000), // Random number for demo
    };
  }
}

export const memoryStore = new MemoryStore();
