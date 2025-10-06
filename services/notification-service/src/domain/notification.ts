export interface Notification {
  id: string;
  userId: string;
  type: "task_created" | "task_completed" | "task_cancelled";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface CreateNotificationData {
  userId: string;
  type: Notification["type"];
  title: string;
  message: string;
}
