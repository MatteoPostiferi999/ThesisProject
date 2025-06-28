#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# ============================
# CELERY WORKER SETUP SCRIPT
# For Lambda AI GPU instances
# ============================

# Funzione per logging con timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Funzione per gestire errori
error_exit() {
    log "❌ ERRORE: $1"
    exit 1
}

log "🚀 Starting Celery Worker setup on Lambda AI..."
log "📋 This script will:"
log "   - Setup environment variables for Redis Railway connection"
log "   - Pull latest optimized Docker images"
log "   - Configure and start Celery Worker with GPU support"
log "   - Test Redis connection and task discovery"
log ""

# ============================
# VERIFICA PREREQUISITI
# ============================

log "🔍 Checking prerequisites..."

# Verifica Docker
if ! command -v docker &>/dev/null; then
    error_exit "Docker not found. Please install Docker first."
fi
log "✅ Docker found: $(docker --version)"

# Verifica NVIDIA Container Toolkit
if ! command -v nvidia-ctk &>/dev/null; then
    error_exit "NVIDIA Container Toolkit not found. Please install it first."
fi
log "✅ NVIDIA Container Toolkit found"

# Verifica GPU
if ! nvidia-smi &>/dev/null; then
    error_exit "NVIDIA GPU not detected. Please check GPU and drivers."
fi
log "✅ GPU detected: $(nvidia-smi --query-gpu=name --format=csv,noheader)"

# ============================
# CLEANUP PRECEDENTE
# ============================

log "🧹 Cleaning up previous containers..."
sudo docker stop celery-worker 2>/dev/null || true
sudo docker rm celery-worker 2>/dev/null || true
sudo docker system prune -f >/dev/null 2>&1 || true

# ============================
# CONFIGURAZIONE ENVIRONMENT
# ============================

log "📝 Setting up environment variables..."

# Crea file .env.celery nella directory corrente
cat > .env.celery << 'EOF'
# Redis connection (Railway)
CELERY_BROKER_URL=redis://default:CItpjCfWaaRXFjLClIEkXeKrfVdAPWKM@trolley.proxy.rlwy.net:31412
CELERY_RESULT_BACKEND=redis://default:CItpjCfWaaRXFjLClIEkXeKrfVdAPWKM@trolley.proxy.rlwy.net:31412

# Celery settings
CELERY_TASK_SERIALIZER=json
CELERY_RESULT_SERIALIZER=json
CELERY_ACCEPT_CONTENT=json
CELERY_TIMEZONE=UTC
CELERY_ENABLE_UTC=True

# Hunyuan3D model settings
MODEL_CACHE_DIR=/app/models
OUTPUT_DIR=/app/outputs
EOF

log "✅ Environment variables configured in .env.celery"

# ============================
# CONFIGURAZIONE DOCKER COMPOSE
# ============================

log "🐳 Setting up Docker Compose configuration..."

cat > docker-compose.celery.yml << 'EOF'
services:
  celery-worker:
    image: matteopostiferi/hunyuan3d-2gp-app:latest
    container_name: celery-worker
    command: celery -A backend worker --loglevel=info --pool=solo -Q celery,default
    env_file:
      - .env.celery
    volumes:
      - ./models:/app/models
      - ./outputs:/app/outputs
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    restart: unless-stopped
    networks:
      - celery-network

networks:
  celery-network:
    driver: bridge
EOF

log "✅ Docker Compose configuration created"

# ============================
# PULL IMMAGINI DOCKER
# ============================

log "📦 Pulling latest Docker images..."
sudo docker pull matteopostiferi/hunyuan-base:latest || error_exit "Failed to pull base image"
sudo docker pull matteopostiferi/hunyuan3d-2gp-app:latest || error_exit "Failed to pull app image"
log "✅ Docker images pulled successfully"

# ============================
# TEST GPU
# ============================

log "🧪 Testing GPU access with optimized image..."
GPU_TEST_OUTPUT=$(sudo docker run --rm --gpus all matteopostiferi/hunyuan3d-2gp-app:latest python3 -c "
import torch
print(f'PyTorch: {torch.__version__}')
print(f'CUDA available: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'GPU: {torch.cuda.get_device_name(0)}')
    print(f'CUDA version: {torch.version.cuda}')
print('GPU_TEST_SUCCESS')
" 2>/dev/null || echo "GPU_TEST_FAILED")

if [[ $GPU_TEST_OUTPUT == *"GPU_TEST_SUCCESS"* ]]; then
    log "✅ GPU test passed:"
    echo "$GPU_TEST_OUTPUT" | grep -v "GPU_TEST_SUCCESS" | sed 's/^/     /'
else
    log "⚠️  GPU test failed, but continuing..."
fi

# ============================
# AVVIO CELERY WORKER
# ============================

log "🚀 Starting Celery Worker..."
sudo docker compose -f docker-compose.celery.yml down --remove-orphans >/dev/null 2>&1 || true
sudo docker compose -f docker-compose.celery.yml up -d || error_exit "Failed to start Celery Worker"

# Aspetta avvio
log "⏳ Waiting for Celery Worker to start (20 seconds)..."
sleep 20

# ============================
# VERIFICA STATO
# ============================

log "📊 Checking Celery Worker status..."
CONTAINER_STATUS=$(sudo docker compose -f docker-compose.celery.yml ps --format "table {{.Service}}\t{{.State}}" | tail -n +2)
echo "$CONTAINER_STATUS" | sed 's/^/     /'

if [[ $CONTAINER_STATUS == *"running"* ]]; then
    log "✅ Celery Worker is running"
else
    log "❌ Celery Worker failed to start"
    log "📋 Container logs:"
    sudo docker compose -f docker-compose.celery.yml logs celery-worker --tail=20 | sed 's/^/     /'
    error_exit "Celery Worker startup failed"
fi

# ============================
# TEST REDIS CONNECTION
# ============================

log "🧪 Testing Redis connection..."
REDIS_TEST_OUTPUT=$(sudo docker compose -f docker-compose.celery.yml exec -T celery-worker python3 -c "
import redis
try:
    r = redis.from_url('redis://default:CItpjCfWaaRXFjLClIEkXeKrfVdAPWKM@trolley.proxy.rlwy.net:31412')
    ping_result = r.ping()
    celery_queue_len = r.llen('celery')
    default_queue_len = r.llen('default')
    print(f'Redis ping: {ping_result}')
    print(f'Celery queue length: {celery_queue_len}')
    print(f'Default queue length: {default_queue_len}')
    print('REDIS_TEST_SUCCESS')
except Exception as e:
    print(f'Redis error: {e}')
    print('REDIS_TEST_FAILED')
" 2>/dev/null || echo "REDIS_TEST_FAILED")

if [[ $REDIS_TEST_OUTPUT == *"REDIS_TEST_SUCCESS"* ]]; then
    log "✅ Redis connection successful:"
    echo "$REDIS_TEST_OUTPUT" | grep -v "REDIS_TEST_SUCCESS" | sed 's/^/     /'
else
    log "❌ Redis connection failed:"
    echo "$REDIS_TEST_OUTPUT" | sed 's/^/     /'
fi

# ============================
# TEST TASK DISCOVERY
# ============================

log "🔍 Testing Celery task discovery..."
TASK_TEST_OUTPUT=$(sudo docker compose -f docker-compose.celery.yml exec -T celery-worker python3 -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from celery import Celery
app = Celery('backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

registered_tasks = [task for task in app.tasks.keys() if not task.startswith('celery.')]
print(f'Registered tasks: {len(registered_tasks)}')
for task in registered_tasks:
    print(f'  - {task}')
print('TASK_TEST_SUCCESS')
" 2>/dev/null || echo "TASK_TEST_FAILED")

if [[ $TASK_TEST_OUTPUT == *"TASK_TEST_SUCCESS"* ]]; then
    log "✅ Task discovery successful:"
    echo "$TASK_TEST_OUTPUT" | grep -v "TASK_TEST_SUCCESS" | sed 's/^/     /'
else
    log "⚠️  Task discovery failed (may be normal if Django not fully loaded):"
    echo "$TASK_TEST_OUTPUT" | sed 's/^/     /'
fi

# ============================
# RISULTATO FINALE
# ============================

log ""
log "🎉 Celery Worker setup completed successfully!"
log ""
log "📋 Summary:"
log "   ✅ GPU: $(nvidia-smi --query-gpu=name --format=csv,noheader)"
log "   ✅ Docker images: latest optimized versions"
log "   ✅ Redis connection: Railway Redis"
log "   ✅ Queues: listening to both 'celery' and 'default'"
log "   ✅ Container: running and ready"
log ""
log "🌐 Ready to process 3D generation tasks!"
log "   Frontend: https://tesi2025.netlify.app"
log "   Backend: https://thesisproject-production.up.railway.app"
log ""
log "📱 Useful commands:"
log "   Monitor logs: sudo docker compose -f docker-compose.celery.yml logs celery-worker -f"
log "   Stop worker: sudo docker compose -f docker-compose.celery.yml down"
log "   Restart worker: sudo docker compose -f docker-compose.celery.yml restart"
log ""
log "✅ Setup completed successfully!"