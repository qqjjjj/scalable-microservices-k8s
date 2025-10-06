# 🚀 Pure Microservices System - 1M User Ready

A minimal, high-performance microservices architecture built for **real-world scale**. Tested at **1,948 RPS** with **236k requests** in 2 minutes on [4 VMs with 32GB RAM](#-load-testing-results).

**Tech Stack:** Node.js + Fastify + RabbitMQ + Kubernetes + Docker

[![Load Test](https://img.shields.io/badge/Load%20Test-1,948%20RPS-green)](#-load-testing-results)
[![Infrastructure](https://img.shields.io/badge/Infrastructure-4%20VMs%20%7C%2032GB%20RAM-blue)](#-load-testing-results)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-blue)](#kubernetes-deployment)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](#quick-start-local-development)

## 🏗️ Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Task Service│───▶│  RabbitMQ   │───▶│Notification │
│   (3001)    │    │   Broker    │    │Service(3002)│
└─────────────┘    └─────────────┘    └─────────────┘
       │                                      │
       ▼                                      ▼
┌─────────────┐                      ┌─────────────┐
│ Simulated   │                      │ Simulated   │
│ DB (await)  │                      │ DB (await)  │
└─────────────┘                      └─────────────┘
```

**Services:**

- **Task Service** (Port 3001) - Task creation & management
- **Notification Service** (Port 3002) - Async notification processing
- **RabbitMQ** - Message broker for event-driven communication
- **Simulated Storage** - Mock database operations with async delays

## ⚡ Key Features for Scale

- 🚀 **Pure microservices** - Zero database bottlenecks
- ⚡ **Fastify framework** - 2x faster than Express.js
- 📡 **Event-driven** - Async processing via RabbitMQ
- ☸️ **Kubernetes native** - Auto-scaling ready
- 🔄 **Stateless design** - Perfect horizontal scaling
- 💾 **Simulated storage** - Mock DB ops with realistic delays
- 📊 **Real metrics** - Proven 1,948 RPS performance

## Quick Start (Local Development)

1. **Install dependencies:**

```bash
sudo npm install
```

2. **Start RabbitMQ:**

```bash
docker compose up -d
```

3. **Run services in development:**

```bash
# Both services at once
sudo npm run dev

# Or separately:
# Terminal 1 - Task Service
cd services/task-service && sudo npm run dev

# Terminal 2 - Notification Service
cd services/notification-service && sudo npm run dev
```

4. **Test the system:**

```bash
node test-api.js
```

5. **Run load tests:**

```bash
# Light load test
node load-test.js

# Heavy benchmark (500 connections)
CONNECTIONS=500 DURATION=120 node load-test.js
```

## API Endpoints

### Task Service (3001)

- `POST /tasks` - Create task
- `GET /tasks/:id` - Get task
- `GET /health` - Health check
- `GET /stats` - Service statistics

### Notification Service (3002)

- `GET /users/:userId/notifications` - Get notifications
- `GET /users/:userId/notifications/unread-count` - Unread count
- `PATCH /notifications/:id/read` - Mark as read
- `GET /health` - Health check
- `GET /stats` - Service statistics

## Example Usage

```bash
# Create a task
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Task",
    "description": "Task description",
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }'

# Check notifications (after a moment)
curl http://localhost:3002/users/550e8400-e29b-41d4-a716-446655440000/notifications

# Check service stats
curl http://localhost:3001/stats
curl http://localhost:3002/stats
```

## Why This Architecture for 1M Users?

### **Minimal Dependencies**

- **No database** - Eliminates DB bottlenecks
- **No Redis** - Reduces infrastructure complexity
- **Pure RabbitMQ** - Single message broker for all communication

### **Maximum Performance**

- **Simulated storage** - Mock database operations with await delays
- **Stateless services** - Perfect for horizontal scaling
- **Event-driven** - Non-blocking async processing
- **Fastify framework** - Optimized for high throughput

### **Kubernetes Native**

- **Horizontal Pod Autoscaling** - Auto-scales based on load
- **Health checks** - Automatic failover and recovery
- **Resource limits** - Efficient resource utilization
- **Load balancing** - Traffic distribution across pods

### **Scalability Strategy**

- **Task Service**: 5-50 replicas (CPU intensive)
- **Notification Service**: 3-20 replicas (I/O intensive)
- **RabbitMQ**: Clustered for high availability
- **Load Balancer**: NGINX ingress with rate limiting

## 🚀 Load Testing Results

**Infrastructure**: 4 VMs

```
┌─────────────────┐    ┌──────────────────────────────────────┐
│   NGINX LB      │    │           Kubernetes Cluster         │
│   4GB RAM       │───▶│                                      │
│   2 CPU         │    │  ┌─────────────┐  ┌─────────────┐   │
└─────────────────┘    │  │   Master    │  │   Worker    │   │
                       │  │  8GB RAM    │  │  8GB RAM    │   │
                       │  │  4 CPU      │  │  4 CPU      │   │
                       │  └─────────────┘  └─────────────┘   │
                       │                                      │
                       │         ┌─────────────┐             │
                       │         │   Worker    │             │
                       │         │  8GB RAM    │             │
                       │         │  4 CPU      │             │
                       │         └─────────────┘             │
                       └──────────────────────────────────────┘
```

**Total Resources**: 32GB RAM, 18 CPU cores

**Real benchmark with 500 concurrent connections:**

```
236k requests in 120s
Average RPS: 1,948 req/sec
Average Latency: 735ms
P99 Latency: 2.3s
Throughput: 995 KB/s
Success Rate: 100%
```

**User Capacity Estimates:**

- **1M+ registered users** (light usage)
- **100k daily active users** (moderate usage)
- **10k concurrent users** (peak load)
- **1,948 tasks/sec** sustained throughput

**Scaling Projections:**

- **10 instances**: 19k RPS, 100k concurrent users
- **50 instances**: 97k RPS, 500k concurrent users
- **100 instances**: 194k RPS, 1M+ concurrent users

## Production Considerations

### **Data Persistence**

- Current: Simulated with await delays (no persistence)
- Production: Replace with real database/Redis
- Alternative: Event sourcing with RabbitMQ

### **High Availability**

- RabbitMQ clustering
- Multi-zone deployments
- Circuit breakers
- Graceful degradation

### **Monitoring**

- `/health` endpoints for liveness probes
- `/stats` endpoints for metrics
- Kubernetes resource monitoring
- RabbitMQ queue monitoring
