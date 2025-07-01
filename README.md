# AI Assisted Design: 2D to 3D Reconstruction for Rapid Prototyping

A web platform that transforms 2D images into 3D models using AI-powered reconstruction techniques. Users upload images and receive high-quality 3D models through an asynchronous processing queue. The system supports multiple AI models and provides real-time generation status updates.

## 🏗️ Architecture Overview

![System Architecture](docs/ComponentDiagram.png)

The system follows a microservices architecture with asynchronous task processing:
- **Frontend (React)** communicates with **Django API Backend** 
- **Backend** sends tasks to **Redis Message Broker**
- **Celery Worker** processes AI tasks in **Docker Container** on **GPU Host**
- Generated 3D models are stored in **Supabase** for persistence

## 🌐 Deployment

- **Frontend**: [Netlify](https://tesi2025.netlify.app) - React + TypeScript + Three.js
- **Backend + Redis**: [Railway](https://railway.app) - Django REST API + Redis queue
- **Celery Worker**: GPU cloud instance (Lambda Labs/AWS/GCP) - Containerized processing

## ⚡ GPU Worker Setup

The Celery worker requires a **GPU instance** for AI model inference due to computational demands. The worker runs in a Docker container to avoid dependency conflicts.

### 🚀 Quick Start (Manual GPU Instance)

1. **SSH into your GPU instance**
2. **(Optional) Navigate to persistent storage** (e.g., `cd /workspace` on Lambda Labs)
3. **Copy and paste this bootstrap script**:

```bash
#!/bin/bash
# Complete ThesisProject setup from scratch
log() { echo "[$(date '+%H:%M:%S')] $1"; }

log "🚀 Starting ThesisProject setup..."
log "📍 Current: $(pwd)"

# Cleanup
log "🧹 Cleanup..."
rm -rf ThesisProject Hunyuan3D-2GP venv_lambda
sudo docker stop $(sudo docker ps -aq) 2>/dev/null || true
sudo docker rm $(sudo docker ps -aq) 2>/dev/null || true

# Clone and setup
log "📥 Cloning repository..."
git clone https://github.com/MatteoPostiferi999/ThesisProject.git
cd ThesisProject/scripts/lambda-ai
chmod +x setup_celery_worker.sh
./setup_celery_worker.sh

# Quick test
log "🧪 Testing system..."
sleep 5
sudo docker exec celery-worker python3 -c "import onnxruntime; print('✅ Ready!')" && log "✅ System working!" || log "❌ Test failed"

log "🎉 Setup complete! Project at: $(pwd | sed 's|/scripts/lambda-ai||')"
log "📊 Monitor: sudo docker compose -f docker-compose.celery.yml logs -f celery-worker"
log "🎯 Test at: https://tesi2025.netlify.app"

# Auto-start log monitoring
sudo docker compose -f docker-compose.celery.yml logs --tail=20 -f celery-worker
```

### 🔧 Why This Approach?

**Two-script architecture**:
- **Bootstrap script**: Lightweight, always copy-pastable, handles environment cleanup
- **Setup script**: Versioned in Git (`setup_celery_worker.sh`), contains complex Docker + AI model logic

This ensures the heavy setup logic is always up-to-date and version-controlled while keeping manual intervention minimal.

## 🎯 Usage

1. Visit [https://tesi2025.netlify.app](https://tesi2025.netlify.app)
2. Create account and select AI model
3. Upload 2D image (PNG/JPG)
4. Monitor real-time generation progress
5. View/download 3D model (OBJ format)

## 🔍 Monitoring

```bash
# View worker logs
sudo docker compose -f docker-compose.celery.yml logs celery-worker -f

# Check worker status
sudo docker ps

# Restart worker
sudo docker compose -f docker-compose.celery.yml restart
```

## 🛠️ Technical Stack

- **Frontend**: React, TypeScript, Three.js, Tailwind CSS
- **Backend**: Django REST Framework, Celery, Redis
- **AI Models**: Hunyuan3D DiT v2, PyTorch, Diffusers
- **Infrastructure**: Netlify, Railway, Docker, GPU Cloud

## 📋 Requirements

- **GPU Instance**: 8GB+ VRAM (Tesla T4/V100/A10G)
- **RAM**: 16GB+ system memory
- **Storage**: 20GB+ for models and dependencies
- **Network**: Stable connection to Railway backend

---

**Note**: GPU instance must be manually started for cost optimization. The worker setup is automated via the bootstrap script above.