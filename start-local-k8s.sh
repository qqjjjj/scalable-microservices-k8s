#!/bin/bash

echo "🚀 Starting Local Kubernetes Demo..."

# Check if Docker Desktop Kubernetes is running
echo "📦 Checking Docker Desktop Kubernetes..."
kubectl cluster-info || {
  echo "❌ Docker Desktop Kubernetes not running!"
  echo "Please enable Kubernetes in Docker Desktop settings"
  exit 1
}

# Install NGINX Ingress Controller for Docker Desktop
echo "🌐 Installing NGINX Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# Wait for ingress controller to be ready
echo "⏳ Waiting for ingress controller..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

# Build Docker images
echo "🔨 Building Docker images..."
docker build -t task-service:latest -f services/task-service/Dockerfile .
docker build -t notification-service:latest -f services/notification-service/Dockerfile .

# Deploy application
echo "🚢 Deploying application..."
# Create namespace first
kubectl apply -f k8s/namespace.yaml
# Then deploy everything else
kubectl apply -f k8s/

# Wait for deployment
echo "⏳ Waiting for services to be ready..."
kubectl wait --for=condition=ready pod -l app=task-service -n task-system --timeout=300s
kubectl wait --for=condition=ready pod -l app=notification-service -n task-system --timeout=300s
kubectl wait --for=condition=ready pod -l app=rabbitmq -n task-system --timeout=300s

# Set up port forwarding
echo "🌐 Setting up port forwarding..."
kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8080:80 &
PORT_FORWARD_PID=$!

# Wait a moment for port forward to establish
sleep 5

# Test endpoints
echo "🧪 Testing endpoints..."
echo "Health check:"
curl -s http://localhost:8080/health || echo "Service starting up..."

echo ""
echo "✅ Local demo ready!"
echo ""
echo "📋 Try these commands:"
echo "  curl http://localhost:8080/tasks"
echo "  curl http://localhost:8080/users/123/notifications"
echo "  kubectl get pods -n task-system"
echo "  kubectl get hpa -n task-system"
echo ""
echo "🧪 Run load test:"
echo "  export TASK_SERVICE_URL=http://localhost:8080"
echo "  export NOTIFICATION_SERVICE_URL=http://localhost:8080"
echo "  node load-test.js"
echo ""
echo "🛑 To stop: kill $PORT_FORWARD_PID"
echo "💡 Tip: Docker Desktop Kubernetes stays running in background"