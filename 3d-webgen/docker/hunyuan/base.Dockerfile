# ========================
# Base image for Hunyuan3D with diso + torch 2.5.1
# ========================

FROM nvidia/cuda:12.2.2-cudnn8-devel-ubuntu22.04

ENV CUDA_HOME=/usr/local/cuda
ENV PATH=$CUDA_HOME/bin:$PATH
ENV LD_LIBRARY_PATH=$CUDA_HOME/lib64:$LD_LIBRARY_PATH
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV DISPLAY=:99
ENV TORCH_CUDA_ARCH_LIST="8.6"

WORKDIR /workspace

# 🧰 Install system dependencies
RUN apt update && apt install -y \
    python3-pip python3-dev git build-essential cmake ninja-build \
    qtbase5-dev libqt5opengl5-dev libqt5svg5-dev qt5-qmake \
    libgl1-mesa-glx libglu1-mesa-dev libxext-dev libx11-dev \
    libeigen3-dev libboost-all-dev libtbb-dev libpng-dev libjpeg-dev \
    xvfb && \
    rm -rf /var/lib/apt/lists/*

# 🐍 Install Python essentials
RUN pip install --no-cache-dir --upgrade pip setuptools wheel pybind11 numpy==1.26.4

# 🔥 Install PyTorch (compatible with CUDA 12.4)
RUN pip install --no-cache-dir torch==2.5.1 torchvision torchaudio --index-url https://download.pytorch.org/whl/test/cu124

# 🧱 Build and install PyMeshLab from source
RUN git clone --recurse-submodules https://github.com/cnr-isti-vclab/PyMeshLab.git && \
    cd PyMeshLab && \
    python3 setup.py build_ext --inplace && \
    pip install . && \
    cd .. && rm -rf PyMeshLab

# 🧩 Fix diso: install CUDA toolkit headers
RUN apt update && apt install -y cuda-toolkit-12-2

# Set correct CUDA arch
ENV TORCH_CUDA_ARCH_LIST="8.6"

# Install diso
RUN pip install --no-cache-dir --no-deps diso==0.1.4

# 📦 Install other Python packages except torch/torchvision
COPY requirements.txt .
RUN pip install --no-deps --no-cache-dir -r requirements.txt || true

# 🖥️ Entry script for Xvfb headless
RUN echo '#!/bin/bash\nXvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &\nexec "$@"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["bash"]
