# ============================
# Base image: Complete dependencies for Celery Worker
# ============================

FROM nvidia/cuda:12.4.1-devel-ubuntu22.04

# 🏷️ Metadata
LABEL maintainer="matteopostiferi"
LABEL description="Complete base for Hunyuan3D Celery Worker with Django"
LABEL version="3.0"

# 🌍 Environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV CUDA_VISIBLE_DEVICES=0

# 📦 Essential system dependencies
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

# 🧰 Complete dependencies for Celery Worker
RUN pip install --no-cache-dir \
    django \
    celery==5.5.3 \
    redis==6.2.0 \
    requests==2.32.4 \
    djangorestframework \
    django-cors-headers \
    djangorestframework-simplejwt \
    psycopg2-binary \
    python-decouple \
    "django-storages[boto3]" \
    boto3 \
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

# 🧪 Verify core dependencies
COPY <<EOF /tmp/verify_base.py
import torch
import django
import celery
import psycopg2
import boto3
print(f'✅ PyTorch {torch.__version__}')
print(f'✅ Django {django.__version__}')
print(f'✅ Celery {celery.__version__}')
print('✅ PostgreSQL connector ready')
print('✅ S3/Storage connector ready')
print('🎉 Base image ready!')
EOF

RUN python3 /tmp/verify_base.py && rm /tmp/verify_base.py

# 📁 Workspace setup
WORKDIR /workspace

CMD ["/bin/bash"]