FROM nvidia/cuda:12.2.2-devel-ubuntu22.04

WORKDIR /workspace

RUN apt update && apt install -y \
    ninja-build \
    python3-pip \
    git \
    build-essential \
    python3-dev \
    cmake \
    qtbase5-dev \
    libglu1-mesa-dev \
    libeigen3-dev \
    libgl1-mesa-glx \
    libxext-dev \
    libx11-dev \
    libqt5opengl5-dev \
    libqt5svg5-dev \
    libboost-all-dev \
    libtbb-dev \
    libpng-dev \
    libjpeg-dev


# 🧠 Clone Hunyuan repo
RUN git clone https://github.com/deepbeepmeep/Hunyuan3D-2GP.git

# 🧠 Clone and build PyMeshLab from source
RUN git clone https://github.com/cnr-isti-vclab/PyMeshLab.git && \
    cd PyMeshLab && \
    git submodule update --init --recursive && \
    pip install .

# 📥 Copy your code and requirements
COPY ai ./ai
COPY docker/hunyuan/requirements.txt ./requirements.txt

# 🧠 Fix numpy for compiled modules
RUN pip install numpy==1.26.4

# 🔥 Install core dependencies
RUN pip install torch==2.5.1 torchvision torchaudio
RUN pip install -r requirements.txt && \
    pip install \
        open3d \
        accelerate \
        omegaconf \
        Pillow \
        einops \
        rembg \
        onnxruntime \
        trimesh \
        diffusers

# 🔧 Patch Hunyuan3D import paths
WORKDIR /workspace/Hunyuan3D-2GP
RUN sed -i 's/mmgp/hy3dgen/g' gradio_app.py && \
    sed -i 's/mmgp/hy3dgen/g' hy3dgen/shapegen/models/autoencoders/surface_extractors.py && \
    sed -i '/from hy3dgen import offload/d' hy3dgen/shapegen/models/autoencoders/surface_extractors.py

# ✅ Default execution: run mesh generation
WORKDIR /workspace
CMD ["python3", "ai/meshGen.py"]
