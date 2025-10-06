#!/bin/bash

# NGINX Load Balancer Setup for Office Kubernetes Cluster

echo "🌐 Setting up NGINX Load Balancer..."

# Configuration
LB_IP="192.168.0.119"
MASTER_IP="192.168.0.105"
WORKER2_IP="192.168.0.166"
WORKER3_IP="192.168.0.153"
NODEPORT="30080"

# Install NGINX
install_nginx() {
    echo "📦 Installing NGINX..."
    sudo apt-get update
    sudo apt-get install -y nginx
}

# Configure NGINX
configure_nginx() {
    echo "⚙️ Configuring NGINX Load Balancer..."
    
    sudo tee /etc/nginx/sites-available/k8s-lb > /dev/null <<EOF
upstream kubernetes_backend {
    least_conn;
    server $MASTER_IP:$NODEPORT max_fails=3 fail_timeout=30s;
    server $WORKER2_IP:$NODEPORT max_fails=3 fail_timeout=30s;
    server $WORKER3_IP:$NODEPORT max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name _;
    
    # Health check endpoint
    location /nginx-health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Proxy to Kubernetes cluster
    location / {
        proxy_pass http://kubernetes_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Health check
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Status page
server {
    listen 8080;
    server_name _;
    
    location /nginx_status {
        stub_status on;
        access_log off;
        allow all;
    }
}
EOF

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/k8s-lb /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    sudo nginx -t
    
    echo "✅ NGINX configuration created"
}

# Start NGINX
start_nginx() {
    echo "🚀 Starting NGINX..."
    sudo systemctl enable nginx
    sudo systemctl restart nginx
    sudo systemctl status nginx
    
    echo "✅ NGINX started successfully!"
    echo "📊 Status available at: http://$LB_IP:8080/nginx_status"
    echo "🌐 Load balancer endpoint: http://$LB_IP"
}

# Test load balancer
test_nginx_lb() {
    echo "🧪 Testing NGINX load balancer..."
    
    echo "Health check:"
    curl -s http://$LB_IP/tasks/health
    
    echo -e "\nNGINX status:"
    curl -s http://$LB_IP:8080/nginx_status
    
    echo -e "\nLoad distribution test:"
    for i in {1..6}; do
        echo "Request $i:"
        curl -s http://$LB_IP/tasks/health
        sleep 1
    done
}

# Usage
case "$1" in
    "install")
        install_nginx
        ;;
    "configure")
        configure_nginx
        ;;
    "start")
        start_nginx
        ;;
    "test")
        test_nginx_lb
        ;;
    "all")
        install_nginx
        configure_nginx
        start_nginx
        test_nginx_lb
        ;;
    *)
        echo "Usage: $0 {install|configure|start|test|all}"
        ;;
esac