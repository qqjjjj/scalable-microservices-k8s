# Office Kubernetes Setup with NGINX

## Architecture

```
Load Test → External NGINX LB → Kubernetes Nodes → Internal NGINX Ingress → Pods
```

## Required VMs

- VM 0 (LB): 192.168.1.9 - External NGINX Load Balancer
- VM 1 (Master): 192.168.1.10 - Kubernetes Master + Worker
- VM 2 (Worker): 192.168.1.11 - Kubernetes Worker
- VM 3 (Worker): 192.168.1.12 - Kubernetes Worker

## Setup Steps

### Step 1: Setup Load Balancer VM

```bash
# SSH to load balancer VM
ssh user@192.168.1.9

# Copy and run NGINX LB setup
scp infrastructure/nginx-lb.sh user@192.168.1.9:/home/user/
chmod +x nginx-lb.sh
./nginx-lb.sh all
```

### Step 2: Setup Kubernetes Cluster

```bash
# Copy project to all K8s VMs
scp -r . user@192.168.1.10:/home/user/1m-user-project
scp -r . user@192.168.1.11:/home/user/1m-user-project
scp -r . user@192.168.1.12:/home/user/1m-user-project

# Setup master (VM1)
ssh user@192.168.1.10
cd 1m-user-project
chmod +x infrastructure/office-vm-setup.sh
./infrastructure/office-vm-setup.sh master

# Setup workers (VM2, VM3)
ssh user@192.168.1.11
cd 1m-user-project
./infrastructure/office-vm-setup.sh worker
# Run join command from master output

ssh user@192.168.1.12
cd 1m-user-project
./infrastructure/office-vm-setup.sh worker
# Run join command from master output

# Deploy application (on master)
ssh user@192.168.1.10
cd 1m-user-project
./infrastructure/office-vm-setup.sh deploy
```

### Step 3: Load Test

```bash
# From your local machine
export VM_IP="192.168.1.9"  # Load balancer IP
node load-test-vm.js
```

## Files You Need

- `infrastructure/office-vm-setup.sh` - Kubernetes setup
- `infrastructure/nginx-lb.sh` - External load balancer
- `load-test-vm.js` - Load testing

## Files You DON'T Need

- `infrastructure/haproxy-lb.sh` - Using NGINX instead
- `infrastructure/multi-vm-setup.sh` - Generic version
- `infrastructure/deploy-office-cluster.sh` - Optional automation
