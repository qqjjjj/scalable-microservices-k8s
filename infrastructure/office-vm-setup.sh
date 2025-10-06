#!/bin/bash

# Office Server Multi-VM Kubernetes Setup

echo "🏢 Setting up Office Server Kubernetes Cluster..."

# Office VM Configuration
MASTER_IP="192.168.0.105"    # Master + Worker 1
WORKER2_IP="192.168.0.166"   # Worker 2
WORKER3_IP="192.168.0.153"   # Worker 3

# Common setup for all VMs
setup_common() {
    echo "📦 Installing Docker and Kubernetes on office VM..."
    
    # Update system
    sudo apt-get update
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Install Docker (Official Docker Documentation Method)
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Add Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER
    
    # Disable swap (required for Kubernetes)
    sudo swapoff -a
    sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
    
    # Install Kubernetes (Official Kubernetes Documentation Method)
    # Add Kubernetes GPG key and repository
    curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
    echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
    
    # Install kubelet, kubeadm and kubectl
    sudo apt-get update
    sudo apt-get install -y kubelet kubeadm kubectl
    sudo apt-mark hold kubelet kubeadm kubectl
    
    # Enable kubelet service
    sudo systemctl enable --now kubelet
    
    # Configure firewall for office network
    sudo ufw allow 6443/tcp      # Kubernetes API
    sudo ufw allow 2379:2380/tcp # etcd
    sudo ufw allow 10250/tcp     # kubelet
    sudo ufw allow 10251/tcp     # kube-scheduler
    sudo ufw allow 10252/tcp     # kube-controller-manager
    sudo ufw allow 30000:32767/tcp # NodePort services
}

# Master node setup for office
setup_office_master() {
    echo "🎯 Setting up Office Master Node..."
    
    setup_common
    
    # Initialize cluster with office network
    sudo kubeadm init \
        --pod-network-cidr=10.244.0.0/16 \
        --apiserver-advertise-address=$MASTER_IP \
        --service-cidr=10.96.0.0/12
    
    # Setup kubectl
    mkdir -p $HOME/.kube
    sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
    sudo chown $(id -u):$(id -g) $HOME/.kube/config
    
    # Install CNI (Flannel for office network)
    kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
    
    # Install NGINX Ingress for office (NodePort mode)
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/baremetal/deploy.yaml
    
    # Patch ingress to use NodePort
    kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{"spec":{"type":"NodePort","ports":[{"port":80,"nodePort":30080}]}}'
    
    echo "✅ Office master node setup complete!"
    echo "🔑 Join command for office workers:"
    kubeadm token create --print-join-command
    echo ""
    echo "📡 Access cluster via any node IP:"
    echo "   http://$MASTER_IP:30080"
    echo "   http://$WORKER2_IP:30080"
    echo "   http://$WORKER3_IP:30080"
}

# Worker setup for office
setup_office_worker() {
    echo "👷 Setting up Office Worker Node..."
    
    setup_common
    
    echo "💡 Run the join command from master node:"
    echo "sudo kubeadm join $MASTER_IP:6443 --token <token> --discovery-token-ca-cert-hash <hash>"
}

# Deploy application to office cluster
deploy_to_office() {
    echo "🚢 Deploying 1M User System to Office Cluster..."
    
    # Build images on each node (or use registry)
    docker build -t task-service:latest -f services/task-service/Dockerfile .
    docker build -t notification-service:latest -f services/notification-service/Dockerfile .
    
    # Deploy application
    kubectl apply -f k8s/
    
    # Wait for deployment
    kubectl wait --for=condition=ready pod -l app=task-service -n task-system --timeout=300s
    kubectl wait --for=condition=ready pod -l app=notification-service -n task-system --timeout=300s
    
    # Get access information (use master node IP)
    NODE_IP=$MASTER_IP
    
    echo "✅ Deployment complete!"
    echo "📋 Office cluster access:"
    echo "   API: http://$NODE_IP:30080"
    echo "   Health: http://$NODE_IP:30080/tasks/health"
    echo "   Stats: http://$NODE_IP:30080/tasks/stats"
    echo ""
    echo "🧪 Load test from your machine:"
    echo "   export VM_IP=$NODE_IP:30080"
    echo "   node load-test-vm.js"
}

# Usage
case "$1" in
    "master")
        setup_office_master
        ;;
    "worker")
        setup_office_worker
        ;;
    "deploy")
        deploy_to_office
        ;;
    *)
        echo "Usage: $0 {master|worker|deploy}"
        echo "  master: Setup office master node"
        echo "  worker: Setup office worker node"
        echo "  deploy: Deploy application to office cluster"
        ;;
esac