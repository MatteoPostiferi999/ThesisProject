# ✅ Base image with CUDA 12.2 and Ubuntu 22.04
FROM nvidia/cuda:12.2.2-devel-ubuntu22.04

# ✅ Set working directory
WORKDIR /workspace

# ✅ Install system dependencies
RUN apt update && apt install -y \
    python3-pip \
    git \
    build-essential \
    python3-dev

# ✅ Clone Hunyuan3D repository
RUN git clone https://github.com/deepbeepmeep/Hunyuan3D-2GP.git

# ✅ Copy your own AI scripts into the container
COPY ../../ai ./ai

# ✅ Set working directory to the cloned repo
WORKDIR /workspace/Hunyuan3D-2GP

# ✅ Fix numpy version for compiled module compatibility
RUN pip install numpy==1.26.4

# ✅ Install PyTorch (with CUDA) and TorchVision
RUN pip install torch==2.5.1 torchvision torchaudio

# ✅ Install project dependencies and additional libraries
RUN pip install -r requirements.txt && \
    pip install \
        open3d \
        accelerate \
        omegaconf \
        Pillow \
        einops \
        pymeshlab \
        rembg \
        onnxruntime \
        trimesh \
        diffusers

# ✅ Apply source code patch (fix import names)
RUN sed -i 's/mmgp/hy3dgen/g' gradio_app.py && \
    sed -i 's/mmgp/hy3dgen/g' hy3dgen/shapegen/models/autoencoders/surface_extractors.py && \
    sed -i '/from hy3dgen import offload/d' hy3dgen/shapegen/models/autoencoders/surface_extractors.py

# ✅ Return to workspace root and define the default entry point
WORKDIR /workspace
CMD ["python3", "ai/meshGen.py"]
