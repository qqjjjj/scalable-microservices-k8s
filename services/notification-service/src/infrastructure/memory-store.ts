// Mock data store that simulates database latency without actually storing data
// Perfect for load testing - focuses on request handling, not data persistence

import type { Notification } from "../domain/notification.js";

class NotificationMemoryStore {
  async saveNotification(notification: Notification): Promise<void> {
    // Simulate database write latency (2-5ms)
    await this.simulateDbLatency(2, 5);
    // Don't actually store anything - just simulate the time
  }

  async getUserNotifications(
    userId: string,
    limit = 50
  ): Promise<Notification[]> {
    // Simulate database query latency (3-8ms)
    await this.simulateDbLatency(3, 8);

    // Return mock notifications for demo purposes
    return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      id: `mock-notification-${i}`,
      userId: userId,
      type: "task_created" as const,
      title: `Mock Notification ${i + 1}`,
      message: `This is a simulated notification ${i + 1} for user ${userId}`,
      read: i === 0, // First one is read, others unread
      createdAt: new Date(Date.now() - i * 60000), // Staggered times
    }));
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    // Simulate database update latency (1-3ms)
    await this.simulateDbLatency(1, 3);

    // Always return success for demo
    return true;
  }

  async getUnreadCount(userId: string): Promise<number> {
    // Simulate database count query latency (2-4ms)
    await this.simulateDbLatency(2, 4);

    // Return mock unread count
    return Math.floor(Math.random() * 5); // 0-4 unread notifications
  }

  private async simulateDbLatency(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Get stats for monitoring (mock data)
  getStats() {
    return {
      totalNotifications: Math.floor(Math.random() * 50000), // Random for demo
      totalUsers: Math.floor(Math.random() * 5000), // Random for demo
    };
  }
}

export const notificationStore = new NotificationMemoryStore();
