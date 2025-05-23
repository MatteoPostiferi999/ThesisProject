FROM nvidia/cuda:12.2.2-devel-ubuntu22.04

WORKDIR /workspace

# Sistema base e strumenti di sviluppo
RUN apt update && apt install -y \
    python3-pip \
    git \
    build-essential \
    python3-dev \
    cmake \
    ninja-build

# Qt e OpenGL per PyMeshLab
RUN apt install -y \
    qtbase5-dev \
    libqt5opengl5-dev \
    libqt5svg5-dev \
    libgl1-mesa-glx \
    libglu1-mesa-dev \
    libxext-dev \
    libx11-dev

# Dipendenze mesh e numeriche
RUN apt install -y \
    libeigen3-dev \
    libboost-all-dev \
    libtbb-dev \
    libpng-dev \
    libjpeg-dev

# Fix numpy per compatibilità moduli compilati
RUN pip install numpy==1.26.4

# PyTorch + torchvision
RUN pip install torch==2.5.1 torchvision torchaudio

# Clone e patcha Hunyuan3D
RUN git clone https://github.com/deepbeepmeep/Hunyuan3D-2GP.git && \
    cd Hunyuan3D-2GP && \
    sed -i 's/mmgp/hy3dgen/g' gradio_app.py && \
    sed -i 's/mmgp/hy3dgen/g' hy3dgen/shapegen/models/autoencoders/surface_extractors.py && \
    sed -i '/from hy3dgen import offload/d' hy3dgen/shapegen/models/autoencoders/surface_extractors.py

# Clone e builda PyMeshLab
RUN git clone https://github.com/cnr-isti-vclab/PyMeshLab.git && \
    cd PyMeshLab && \
    git submodule update --init --recursive && \
    pip install .

# Default shell entry (non esegue nulla)
CMD ["bash"]
