# VM Specifications for 1M User Benchmark

## Recommended Setup (Balanced Performance/Cost)

| VM  | Role              | CPU     | RAM | Storage  | IP           |
| --- | ----------------- | ------- | --- | -------- | ------------ |
| VM0 | External LB       | 2 cores | 4GB | 20GB SSD | 192.168.1.9  |
| VM1 | K8s Master+Worker | 4 cores | 8GB | 50GB SSD | 192.168.1.10 |
| VM2 | K8s Worker        | 4 cores | 8GB | 50GB SSD | 192.168.1.11 |
| VM3 | K8s Worker        | 4 cores | 8GB | 50GB SSD | 192.168.1.12 |

**Total: 14 cores, 28GB RAM, 170GB storage**

## Expected Performance

- **Target RPS:** 2000-5000
- **Concurrent Users:** 50K-100K
- **Response Time:** <100ms average
- **Pod Capacity:** 35-40 total pods

## Network Requirements

- **Subnet:** 192.168.1.0/24
- **Bandwidth:** 1Gbps between VMs
- **Ports:** 22, 80, 443, 6443, 2379-2380, 10250-10252, 30000-32767

## OS Requirements

- **Ubuntu 20.04 LTS** (recommended)
- **Static IP addresses**
- **SSH key access**
- **Sudo privileges**
- **NTP synchronized**
