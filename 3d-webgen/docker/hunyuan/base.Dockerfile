# ============================
# Base image: Dependencies ONLY for Celery Worker
# ============================

FROM nvidia/cuda:12.4.1-devel-ubuntu22.04

# 🏷️ Metadata
LABEL maintainer="matteopostiferi"
LABEL description="Lightweight base for Hunyuan3D Celery Worker"
LABEL version="2.0"

# 🌍 Environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV CUDA_VISIBLE_DEVICES=0

# 📦 Essential system dependencies ONLY
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    wget \
    curl \
    python3 \
    python3-dev \
    python3-pip \
    libeigen3-dev \
    libopencv-dev \
    libgl1-mesa-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 🐍 Python setup
RUN python3 -m pip install --upgrade pip setuptools wheel

# 🔥 PyTorch installation (CUDA 12.4 compatible)
RUN pip install --no-cache-dir \
    torch==2.5.1+cu124 \
    torchvision==0.20.1+cu124 \
    --index-url https://download.pytorch.org/whl/test/cu124

# 🧰 Core dependencies for Celery + Hunyuan3D ONLY
RUN pip install --no-cache-dir \
    celery==5.5.3 \
    redis==6.2.0 \
    requests==2.32.4 \
    einops \
    diffusers \
    transformers==4.49.0 \
    accelerate \
    trimesh \
    huggingface_hub \
    omegaconf \
    opencv-python \
    rembg \
    numpy \
    scipy \
    pillow \
    tqdm

# 🔧 PyMeshLab fixed version
RUN pip install --no-cache-dir pymeshlab==2022.2.post4

# 🧪 Quick verification
RUN python3 -c "import torch; print(f'✅ PyTorch {torch.__version__}')"
RUN python3 -c "import celery; print(f'✅ Celery {celery.__version__}')"

# 📁 Workspace setup
WORKDIR /workspace

CMD ["/bin/bash"]