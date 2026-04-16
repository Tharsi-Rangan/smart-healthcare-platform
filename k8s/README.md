# Smart Healthcare Platform - Kubernetes Deployment Guide

## Overview
This directory contains Kubernetes manifests for deploying the smart healthcare platform microservices.

## Services Included

### 1. Consultation Service
- **File**: consultation-service.yaml
- **Port**: 5004
- **Replicas**: 2
- **Database**: MongoDB
- **Features**:
  - Consultation lifecycle management
  - Video session generation (Jitsi)
  - Notes and prescription management

### 2. Payment-Notification Service
- **File**: payment-notification-service.yaml
- **Port**: 5005
- **Replicas**: 2
- **Database**: MongoDB
- **Features**:
  - Payment initiation and verification
  - Email notifications
  - Event-based triggers

### 3. MongoDB
- **File**: mongodb.yaml
- **Port**: 27017
- **Storage**: EmptyDir (for demo purposes)
- **Note**: For production, use PersistentVolume/PersistentVolumeClaim

## Prerequisites

- Kubernetes cluster (v1.19+)
- kubectl configured
- Docker images built and available

## Building Docker Images

```bash
# Navigation to consultation-service
cd services/consultation-service
docker build -t smart-healthcare/consultation-service:1.0.0 .

# Navigate to payment-notification-service
cd services/payment-notification-service
docker build -t smart-healthcare/payment-notification-service:1.0.0 .
```

## Deployment Steps

### 1. Create MongoDB
```bash
kubectl apply -f k8s/mongodb.yaml
```

### 2. Deploy Consultation Service
```bash
kubectl apply -f k8s/consultation-service.yaml
```

### 3. Deploy Payment-Notification Service
```bash
kubectl apply -f k8s/payment-notification-service.yaml
```

### 4. Deploy All Services at Once
```bash
kubectl apply -f k8s/
```

## Verification

### Check Deployment Status
```bash
kubectl get deployments
kubectl get pods
kubectl get services
```

### Check Service Health
```bash
kubectl logs -f deployment/consultation-service
kubectl logs -f deployment/payment-notification-service
```

### Port Forward for Local Testing
```bash
# Consultation Service
kubectl port-forward svc/consultation-service 5004:5004

# Payment-Notification Service
kubectl port-forward svc/payment-notification-service 5005:5005

# MongoDB
kubectl port-forward svc/mongodb 27017:27017
```

## Configuration

### Secrets
Secrets are defined in each service YAML. Update before production deployment:
- `JWT_SECRET`: Change to a strong random value
- `SMTP_USER` and `SMTP_PASS`: Configure actual email credentials

### ConfigMaps
Database URIs and service URLs are set via ConfigMaps. Modify if needed.

## Scaling

Scale a deployment:
```bash
kubectl scale deployment consultation-service --replicas=3
kubectl scale deployment payment-notification-service --replicas=3
```

## Cleanup

Remove all deployments:
```bash
kubectl delete -f k8s/
```

## Production Considerations

1. **Database Persistence**: Replace emptyDir with PersistentVolume
2. **Image Registry**: Push images to a container registry
3. **Secrets Management**: Use a proper secrets management solution
4. **Ingress**: Add Ingress resource for external access
5. **Resource Limits**: Adjust CPU/memory limits based on load
6. **Monitoring**: Add Prometheus, Grafana, or similar
7. **Logging**: Implement centralized logging
8. **Network Policies**: Implement network policies for security

## Troubleshooting

### Pod not starting
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Service connectivity issues
```bash
kubectl exec -it <pod-name> -- /bin/sh
# Test DNS resolution
nslookup consultation-service
```

### Database connection issues
Ensure MongoDB is running and accessible from within the cluster
