export interface Task {
  id: string;
  title: string;
  description?: string;
  userId: string;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  userId: string;
}

export interface TaskCreatedEvent {
  type: "task.created";
  taskId: string;
  userId: string;
  title: string;
  timestamp: Date;
}
