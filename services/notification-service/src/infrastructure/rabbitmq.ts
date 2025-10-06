import * as amqp from "amqplib";
import { NotificationService } from "../application/notification-service.js";

// Define our own interfaces to avoid amqplib type issues
interface AssertExchange {
  exchange: string;
}

interface AssertQueue {
  queue: string;
  messageCount: number;
  consumerCount: number;
}

interface RabbitConnection {
  createChannel(): Promise<RabbitChannel>;
  close(): Promise<void>;
  on(event: string, callback: (arg?: any) => void): void;
}

interface RabbitChannel {
  assertExchange(
    exchange: string,
    type: string,
    options: any
  ): Promise<AssertExchange>;
  assertQueue(queue: string, options: any): Promise<AssertQueue>;
  bindQueue(queue: string, exchange: string, routingKey: string): Promise<any>;
  consume(queue: string, callback: (msg: any) => void): Promise<any>;
  ack(msg: any): void;
  nack(msg: any, allUpTo: boolean, requeue: boolean): void;
  close(): Promise<void>;
}

class RabbitMQConsumer {
  private connection: RabbitConnection | null = null;
  private channel: RabbitChannel | null = null;
  private readonly exchangeName = "task.events";
  private readonly queueName = "notification.task.events";

  async connect(): Promise<void> {
    try {
      const rabbitmqUrl =
        process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

      // Step 1: Establish connection to RabbitMQ server
      this.connection = (await amqp.connect(rabbitmqUrl)) as RabbitConnection;
      console.log("🔗 RabbitMQ connection established");

      // Step 2: Create channel within the connection
      this.channel = await this.connection.createChannel();
      console.log("📡 RabbitMQ channel created");

      // Step 3: Set up exchange (ensure it exists)
      const exchangeResult = await this.channel.assertExchange(
        this.exchangeName,
        "topic",
        {
          durable: true,
        }
      );
      console.log(`🏪 Exchange '${exchangeResult.exchange}' ready`);

      // Step 4: Create queue for this service
      const queueResult = await this.channel.assertQueue(this.queueName, {
        durable: true,
      });
      console.log(`📦 Queue '${queueResult.queue}' ready`);

      // Step 5: Bind queue to exchange with routing key
      await this.channel.bindQueue(
        queueResult.queue,
        this.exchangeName,
        "task.created"
      );
      console.log("🔗 Queue bound to exchange for 'task.created' events");

      // Handle connection errors
      this.connection.on("error", (err: Error) => {
        console.error("RabbitMQ connection error:", err);
      });

      this.connection.on("close", () => {
        console.log("RabbitMQ connection closed");
      });

      console.log("🐰 Connected to RabbitMQ");

      // Start consuming messages
      await this.startConsuming();
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  private async startConsuming(): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    const notificationService = new NotificationService();

    await this.channel.consume(this.queueName, async (msg) => {
      if (!msg) return;

      try {
        // Parse the event from JSON
        const event = JSON.parse(msg.content.toString());
        console.log(
          `📥 Received event: ${event.type} for task ${event.taskId}`
        );

        // Handle different event types
        if (event.type === "task.created") {
          await notificationService.handleTaskCreated(event);
        }
        // Could add more event types here:
        // else if (event.type === "task.completed") {
        //   await notificationService.handleTaskCompleted(event);
        // }

        // Acknowledge successful processing
        this.channel!.ack(msg);
        console.log(`✅ Successfully processed ${event.type} event`);
      } catch (error) {
        console.error("Error processing message:", error);

        // Negative acknowledgment - don't requeue (dead letter it)
        this.channel!.nack(msg, false, false);
        console.log("❌ Message sent to dead letter queue");
      }
    });

    console.log("📥 Started consuming task events");
  }

  async close(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.close(); // This automatically closes all channels
      }
      this.connection = null;
      this.channel = null;
      console.log("🐰 RabbitMQ connection closed");
    } catch (error) {
      console.error("Error closing RabbitMQ connection:", error);
    }
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

// Singleton instance
export const rabbitMQConsumer = new RabbitMQConsumer();

// Convenience functions for backward compatibility
export async function connectRabbitMQ(): Promise<void> {
  return rabbitMQConsumer.connect();
}

export async function closeRabbitMQ(): Promise<void> {
  return rabbitMQConsumer.close();
}
