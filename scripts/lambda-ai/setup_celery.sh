#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

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

# Debug: mostra variabili ambiente e directory corrente
log "🔍 Debug info:"
log "  - Current user: $(whoami)"
log "  - Current directory: $(pwd)"
log "  - HOME directory: $HOME"
log "  - Available disk space: $(df -h / | tail -1 | awk '{print $4}')"
log "  - GPU info: $(nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null || echo 'GPU not detected')"

# 1) Pulizia vecchie chiavi Docker/NVIDIA
log "🧹 Cleaning old Docker/NVIDIA keys..."
sudo rm -f /etc/apt/sources.list.d/docker.list \
             /etc/apt/keyrings/docker.gpg \
             /etc/apt/sources.list.d/nvidia-container-toolkit.list \
             /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
             /etc/apt/sources.list.d/nvidia-docker.list || true

# 2) Installa Docker se manca
log "🐳 Checking Docker installation..."
if ! command -v docker &>/dev/null; then
  log "📦 Installing Docker..."
  sudo apt update || error_exit "Failed to update apt"
  sudo apt install -y ca-certificates curl gnupg lsb-release || error_exit "Failed to install dependencies"
  sudo install -m0755 -d /etc/apt/keyrings || error_exit "Failed to create keyrings directory"
  
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg || error_exit "Failed to add Docker GPG key"
  
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null || error_exit "Failed to add Docker repository"
  
  sudo apt update || error_exit "Failed to update apt after adding Docker repo"
  sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin || error_exit "Failed to install Docker"
  
  # Aggiungi l'utente al gruppo docker
  sudo usermod -aG docker $USER || error_exit "Failed to add user to docker group"
  log "⚠️  You may need to log out and back in for Docker group changes to take effect"
else
  log "✅ Docker already installed"
fi

# 3) Installa NVIDIA Container Toolkit (metodo aggiornato + compatibilità)
log "🎮 Installing NVIDIA Container Toolkit..."

# Metodo nuovo (preferito)
if ! dpkg -l | grep -q nvidia-container-toolkit; then
  log "📦 Installing NVIDIA Container Toolkit (new method)..."
  curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey \
    | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg 2>/dev/null || {
    
    # Fallback al metodo vecchio per compatibilità
    log "⚠️  New method failed, trying legacy method..."
    distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
    curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add - || error_exit "Failed to add NVIDIA GPG key (legacy)"
    curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list || error_exit "Failed to add NVIDIA repository (legacy)"
    
    sudo apt-get update || error_exit "Failed to update apt (legacy)"
    sudo apt-get install -y nvidia-container-toolkit || error_exit "Failed to install NVIDIA Container Toolkit (legacy)"
  }
  
  # Se il metodo nuovo è riuscito, continua con quello
  if [ -f /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg ]; then
    echo \
      "deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] \
        https://nvidia.github.io/libnvidia-container/stable/deb/amd64 /" \
      | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list || error_exit "Failed to add NVIDIA repository"
    
    sudo apt update || error_exit "Failed to update apt after adding NVIDIA repo"
    sudo apt install -y nvidia-container-toolkit || error_exit "Failed to install NVIDIA Container Toolkit"
  fi
  
  # Configura runtime per entrambi i metodi
  sudo nvidia-ctk runtime configure --runtime=docker || error_exit "Failed to configure NVIDIA runtime"
  sudo systemctl restart docker || error_exit "Failed to restart Docker"
else
  log "✅ NVIDIA Container Toolkit already installed"
fi

# Test GPU access
log "🧪 Testing GPU access in Docker..."
sudo docker run --rm --gpus all nvidia/cuda:11.8-base-ubuntu20.04 nvidia-smi || {
  log "⚠️  GPU test failed, but continuing..."
}

# 4) Configurazione variabili environment per Celery
log "📝 Setting up environment variables..."
cat > .env.celery << EOF
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

log "✅ Environment variables configured"

# 5) Gestione repository
REPO="$HOME/ThesisProject"
log "📁 Managing repository: $REPO"

# Ferma eventuali processi Docker
log "🛑 Stopping any existing Docker processes..."
sudo docker stop $(sudo docker ps -q) 2>/dev/null || true

# Rimuovi directory esistente se presente
if [ -d "$REPO" ]; then
  log "🗑️  Removing existing repository..."
  sudo fuser -k "$REPO" 2>/dev/null || true
  sudo chmod -R 777 "$REPO" 2>/dev/null || true
  sudo rm -rf "$REPO"
fi

# Clone repository
log "📥 Cloning repository..."
git clone --depth 1 https://github.com/MatteoPostiferi999/ThesisProject.git "$REPO" || error_exit "Failed to clone repository"

# 6) Setup Celery Worker Docker
log "📂 Setting up Celery Worker..."
cd "$REPO/3d-webgen" || error_exit "Failed to enter 3d-webgen directory"

# Crea docker-compose specifico per solo Celery Worker
cat > docker-compose.celery.yml << EOF
version: '3.8'

services:
  celery-worker:
    image: matteopostiferi/hunyuan3d-2gp-app:latest
    container_name: celery-worker
    command: celery -A backend worker --loglevel=info --pool=solo
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

# Copia il file .env.celery nella directory giusta
cp ../.env.celery .

# 7) Pull immagine Docker
log "🐳 Pulling Docker image..."
sudo docker pull matteopostiferi/hunyuan3d-2gp-app:latest || error_exit "Failed to pull image"

# 8) Avvia solo Celery Worker
log "🚀 Starting Celery Worker..."
sudo docker compose -f docker-compose.celery.yml down --remove-orphans || true
sudo docker compose -f docker-compose.celery.yml up -d || error_exit "Failed to start Celery Worker"

# Aspetta avvio
log "⏳ Waiting for Celery Worker to start..."
sleep 15

# 9) Stato del container
log ""
log "📊 Celery Worker status:"
sudo docker compose -f docker-compose.celery.yml ps

log ""
log "🔍 Recent logs from Celery Worker:"
sudo docker compose -f docker-compose.celery.yml logs celery-worker --tail=30

log ""
log "🎉 Celery Worker setup completed!"
log "🔗 Connected to Redis: Railway"
log "🎮 GPU access: $(nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null || echo 'Check manually')"

# Test Redis connection
log ""
log "🧪 Testing Redis connection..."
sudo docker compose -f docker-compose.celery.yml exec celery-worker python -c "
import redis
r = redis.from_url('redis://default:CItpjCfWaaRXFjLClIEkXeKrfVdAPWKM@trolley.proxy.rlwy.net:31412')
print('Redis connection:', 'OK' if r.ping() else 'FAILED')
" 2>/dev/null || log "⚠️  Redis test failed - check connection manually"

log ""
log "✅ Setup completed! Celery Worker is ready to process 3D generation tasks."
