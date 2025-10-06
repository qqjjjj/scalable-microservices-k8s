import { randomUUID } from "crypto";
import type {
  Notification,
  CreateNotificationData,
} from "../domain/notification.js";
import { notificationStore } from "../infrastructure/memory-store.js";

export class NotificationService {
  async createNotification(
    data: CreateNotificationData
  ): Promise<Notification> {
    const notification: Notification = {
      id: randomUUID(),
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      read: false,
      createdAt: new Date(),
    };

    notificationStore.saveNotification(notification);

    console.log(
      `📬 Created notification for user ${data.userId}: ${data.title}`
    );
    return notification;
  }

  async handleTaskCreated(event: any) {
    await this.createNotification({
      userId: event.userId,
      type: "task_created",
      title: "New Task Created",
      message: `Your task "${event.title}" has been created successfully.`,
    });
  }

  async getUserNotifications(
    userId: string,
    limit = 50
  ): Promise<Notification[]> {
    return notificationStore.getUserNotifications(userId, limit);
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    return notificationStore.markAsRead(notificationId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return notificationStore.getUnreadCount(userId);
  }

  getStats() {
    return notificationStore.getStats();
  }
}
