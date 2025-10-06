import Fastify from "fastify";
import { connectRabbitMQ, closeRabbitMQ } from "./infrastructure/rabbitmq.js";
import { notificationRoutes } from "./api/routes.js";

const fastify = Fastify({
  logger: true,
});

// Register routes
await fastify.register(notificationRoutes);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 Shutting down Notification Service...");
  await closeRabbitMQ();
  await fastify.close();
});

async function start() {
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Start server
    const port = parseInt(process.env.PORT || "3002");
    await fastify.listen({ port, host: "0.0.0.0" });

    console.log(`🔔 Notification Service running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
