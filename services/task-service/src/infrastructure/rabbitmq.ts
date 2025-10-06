import * as amqp from "amqplib";
import type { TaskCreatedEvent } from "../domain/task.js";

// Define our own interfaces to match amqplib actual return types
interface AssertExchange {
  exchange: string;
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
  publish(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options?: any
  ): boolean;
  close(): Promise<void>;
}

class RabbitMQClient {
  private connection: RabbitConnection | null = null;
  private channel: RabbitChannel | null = null;
  private readonly exchangeName = "task.events";

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

      // Step 3: Create exchange for task events
      const exchangeResult = await this.channel.assertExchange(
        this.exchangeName,
        "topic",
        {
          durable: true,
        }
      );
      console.log(`🏪 Exchange '${exchangeResult.exchange}' ready`);

      // Handle connection errors
      this.connection.on("error", (err: Error) => {
        console.error("RabbitMQ connection error:", err);
      });

      this.connection.on("close", () => {
        console.log("RabbitMQ connection closed");
      });

      console.log("🐰 Connected to RabbitMQ");
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  async publishTaskCreated(event: TaskCreatedEvent): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    try {
      const message = Buffer.from(JSON.stringify(event));

      const published = this.channel.publish(
        this.exchangeName,
        "task.created",
        message,
        { persistent: true }
      );

      if (!published) {
        throw new Error("Failed to publish message - channel buffer full");
      }

      console.log(`📤 Published task.created event for task ${event.taskId}`);
    } catch (error) {
      console.error("Failed to publish task created event:", error);
      throw error;
    }
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
export const rabbitMQClient = new RabbitMQClient();

// Convenience functions for backward compatibility
export async function connectRabbitMQ(): Promise<void> {
  return rabbitMQClient.connect();
}

export async function publishTaskCreated(
  event: TaskCreatedEvent
): Promise<void> {
  return rabbitMQClient.publishTaskCreated(event);
}

export async function closeRabbitMQ(): Promise<void> {
  return rabbitMQClient.close();
}
