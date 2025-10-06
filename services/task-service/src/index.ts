import Fastify from "fastify";
import cors from "@fastify/cors";
import { connectRabbitMQ, closeRabbitMQ } from "./infrastructure/rabbitmq.js";
import { taskRoutes } from "./api/routes.js";

const fastify = Fastify({
  logger: true,
});

// Register CORS
await fastify.register(cors, {
  origin: true,
});

// Register routes
await fastify.register(taskRoutes);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 Shutting down Task Service...");
  await closeRabbitMQ();
  await fastify.close();
});

async function start() {
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Start server
    const port = parseInt(process.env.PORT || "3001");
    await fastify.listen({ port, host: "0.0.0.0" });

    console.log(`🚀 Task Service running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
