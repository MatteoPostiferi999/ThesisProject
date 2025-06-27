# ============================
# Base image: Dependencies and environment setup
# ============================

FROM nvidia/cuda:12.4.1-devel-ubuntu22.04

# 🏷️ Metadata
LABEL maintainer="matteopostiferi"
LABEL description="Base image for Hunyuan3D-2GP with all dependencies"
LABEL version="1.0"

# 🌍 Environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV CUDA_VISIBLE_DEVICES=0

# 📦 System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    curl \
    unzip \
    python3 \
    python3-dev \
    python3-pip \
    python3-venv \
    libeigen3-dev \
    libboost-all-dev \
    qtbase5-dev \
    libqt5opengl5-dev \
    libopencv-dev \
    libglu1-mesa-dev \
    libgl1-mesa-dev \
    libxrender1 \
    libxext6 \
    libxmu6 \
    libxi6 \
    htop \
    nano \
    && rm -rf /var/lib/apt/lists/*

# 🐍 Python setup
RUN python3 -m pip install --upgrade pip setuptools wheel

# 🔥 PyTorch installation (CUDA 12.4 compatible)
RUN pip install --no-cache-dir \
    torch==2.5.1+cu124 \
    torchvision==0.20.1+cu124 \
    torchaudio==2.5.1+cu124 \
    --index-url https://download.pytorch.org/whl/test/cu124

# 🧰 Core dependencies
RUN pip install --no-cache-dir \
    django \
    celery \
    djangorestframework \
    django-cors-headers \
    djangorestframework-simplejwt \
    redis \
    psycopg2-binary \
    "django-storages[boto3]" \
    boto3 \
    einops \
    diffusers \
    transformers==4.49.0 \
    accelerate \
    trimesh \
    huggingface_hub \
    onnxruntime \
    open3d \
    omegaconf \
    opencv-python \
    rembg \
    requests \
    numpy \
    scipy \
    matplotlib \
    pillow \
    tqdm

# 🔧 Create PyMeshLab mock script
RUN echo 'import warnings\nimport numpy as np\n\nclass MeshSet:\n    def __init__(self): warnings.warn("Using pymeshlab mock", UserWarning)\n    def load_new_mesh(self, f): return True\n    def save_current_mesh(self, f): return True\n    def apply_filter(self, *a, **k): return True\n    def current_mesh(self): return Mesh()\n    def number_of_meshes(self): return 1\n\nclass Mesh:\n    def __init__(self): self.vertex_matrix,self.face_matrix = np.array([]),np.array([])\n    def vertex_number(self): return 0\n    def face_number(self): return 0\n\ndef print_pymeshlab_version(): return "Mock 1.0.0"\nprint("⚠️ Using pymeshlab mock")' > /tmp/pymeshlab_mock.py

# 🔧 PyMeshLab installation from GitHub with fallback
#RUN pip install --no-cache-dir git+https://github.com/cnr-isti-vclab/PyMeshLab || \
 #   (echo "⚠️ PyMeshLab install failed, using mock..." && \
   #  cp /tmp/pymeshlab_mock.py $(python3 -c "import site; print(site.getsitepackages()[0])")/pymeshlab.py && \
  #   echo "✅ PyMeshLab mock installed")

RUN set -eux; \
    # 1) Disinstallo qualunque pymeshlab già presente
    pip uninstall -y pymeshlab || true; \
    \
    # 2) Provo subito a installare la versione fissa
    echo "🔧 Installo PyMeshLab==2022.2.post4"; \
    if pip install --no-cache-dir pymeshlab==2022.2.post4; then \
        echo "✅ PyMeshLab 2022.2.post4 installato"; \
    else \
        echo "⚠️ Installazione diretta fallita, installo dipendenze di sistema…"; \
        apt-get update -qq && \
        apt-get install -y --no-install-recommends \
            libgl1-mesa-glx libglib2.0-0 \
            libqt5gui5 libqt5core5a libqt5widgets5 \
            libegl1-mesa libxkbcommon-x11-0; \
        echo "🔧 Riprovo installazione PyMeshLab"; \
        pip install --no-cache-dir pymeshlab==2022.2.post4; \
    fi


# 🧪 Create dependency verification script
RUN echo 'import sys\ntest_modules = ["torch", "torchvision", "torchaudio", "pymeshlab", "django", "celery", "requests", "transformers", "diffusers", "trimesh", "cv2", "numpy"]\nprint("🧪 Dependency verification:")\nfailed = []\nfor module in test_modules:\n    try:\n        __import__(module)\n        print(f"✅ {module}")\n    except ImportError as e:\n        print(f"❌ {module}: {str(e)[:50]}")\n        failed.append(module)\nif failed:\n    print(f"⚠️ Failed modules: {failed}")\nelse:\n    print("🎉 All core dependencies verified!")' > /tmp/verify_deps.py

# 🧪 Run dependency verification
RUN python3 /tmp/verify_deps.py

# 🔍 Create CUDA verification script
RUN echo 'import torch\nprint(f"🔥 PyTorch version: {torch.__version__}")\nprint(f"🚀 CUDA available: {torch.cuda.is_available()}")\nif torch.cuda.is_available():\n    try:\n        print(f"💻 GPU: {torch.cuda.get_device_name(0)}")\n        print(f"🎯 CUDA version: {torch.version.cuda}")\n    except:\n        print("ℹ️ GPU info not available during build")\nelse:\n    print("ℹ️ CUDA not available during build (normal)")' > /tmp/verify_cuda.py

# 🔍 Run CUDA verification
RUN python3 /tmp/verify_cuda.py

# 🧹 Cleanup
RUN rm -f /tmp/pymeshlab_mock.py /tmp/verify_deps.py /tmp/verify_cuda.py

# 📁 Workspace setup
WORKDIR /workspace

# 🏃 Default command
CMD ["/bin/bash"]