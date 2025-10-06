import type { FastifyInstance } from "fastify";
import { NotificationService } from "../application/notification-service.js";

export async function notificationRoutes(fastify: FastifyInstance) {
  const notificationService = new NotificationService();

  // Get user notifications
  fastify.get("/users/:userId/notifications", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { limit } = request.query as { limit?: string };

    const notifications = await notificationService.getUserNotifications(
      userId,
      limit ? parseInt(limit) : 50
    );

    reply.send({
      success: true,
      data: notifications,
    });
  });

  // Get unread count
  fastify.get(
    "/users/:userId/notifications/unread-count",
    async (request, reply) => {
      const { userId } = request.params as { userId: string };

      const count = await notificationService.getUnreadCount(userId);

      reply.send({
        success: true,
        data: { count },
      });
    }
  );

  // Mark notification as read
  fastify.patch("/notifications/:id/read", async (request, reply) => {
    const { id } = request.params as { id: string };

    const updated = await notificationService.markAsRead(id);

    if (!updated) {
      reply.code(404).send({
        success: false,
        error: "Notification not found",
      });
      return;
    }

    reply.send({
      success: true,
      message: "Notification marked as read",
    });
  });

  // Health check
  fastify.get("/notifications/health", async () => {
    return { status: "ok", service: "notification-service" };
  });

  // Stats endpoint
  fastify.get("/notifications/stats", async () => {
    return {
      service: "notification-service",
      ...notificationService.getStats(),
    };
  });
}
