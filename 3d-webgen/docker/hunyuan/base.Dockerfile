# Forza architettura AMD64 per PyMeshLab e PyTorch con CUDA
FROM nvidia/cuda:12.2.2-cudnn8-devel-ubuntu22.04


ENV CUDA_HOME=/usr/local/cuda
ENV PATH=$CUDA_HOME/bin:$PATH
ENV LD_LIBRARY_PATH=$CUDA_HOME/lib64:$LD_LIBRARY_PATH

WORKDIR /workspace

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV DISPLAY=:99

# 🛠️ Sistema base + Qt/OpenGL + dipendenze MeshLab
RUN apt update && apt install -y \
    python3-pip python3-dev git build-essential cmake ninja-build \
    qtbase5-dev libqt5opengl5-dev libqt5svg5-dev qt5-qmake \
    libgl1-mesa-glx libglu1-mesa-dev libxext-dev libx11-dev \
    libeigen3-dev libboost-all-dev libtbb-dev libpng-dev libjpeg-dev \
    xvfb && \
    rm -rf /var/lib/apt/lists/*

    # 🔍 Verifica che cuda_runtime.h esista
RUN ls -l /usr/local/cuda/include/cuda_runtime.h


# 🐍 Librerie Python base
RUN pip install --upgrade pip setuptools wheel pybind11 numpy==1.26.4

# 🔥 PyTorch con supporto CUDA 12.2
RUN pip install torch==2.5.1 torchvision torchaudio --index-url https://download.pytorch.org/whl/test/cu124

# 🧱 Installa PyMeshLab da sorgente
RUN git clone --recurse-submodules https://github.com/cnr-isti-vclab/PyMeshLab.git && \
    cd PyMeshLab && \
    python3 setup.py build_ext --inplace || (echo "❌ Errore in build_ext" && exit 1) && \
    echo "🔍 Listing .so files..." && find src/pymeshlab/ -name "*.so" && \
    pip install . && \
    cd .. && rm -rf PyMeshLab

# ✅ (DISATTIVATA) Verifica installazione PyMeshLab
# RUN python3 -c "import pymeshlab; print('✅ PyMeshLab OK')"

# 🔽 Clona e patcha Hunyuan3D
RUN git clone https://github.com/deepbeepmeep/Hunyuan3D-2GP.git && \
    cd Hunyuan3D-2GP && \
    sed -i 's/mmgp/hy3dgen/g' gradio_app.py && \
    sed -i 's/mmgp/hy3dgen/g' hy3dgen/shapegen/models/autoencoders/surface_extractors.py && \
    sed -i '/from hy3dgen import offload/d' hy3dgen/shapegen/models/autoencoders/surface_extractors.py


# Installa prima tutto il resto
RUN grep -v diso Hunyuan3D-2GP/requirements.txt > requirements_no_diso.txt && \
    pip install -r requirements_no_diso.txt

# 🧱 Installa diso separatamente alla fine (così puoi fare debug se fallisce)
# Poi installa diso in fondo in modo isolato
# RUN pip install git+https://github.com/deepbeepmeep/diso.git

# 🧠 Setup PYTHONPATH
ENV PYTHONPATH="/workspace/Hunyuan3D-2GP"

# 🖥️ Script per Xvfb (headless)
RUN echo '#!/bin/bash\nXvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &\nexec "$@"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# ✅ (DISATTIVATO) Test finale
# RUN python3 -c "\
# import torch; \
# import pymeshlab; \
# print('🔥 PyTorch:', torch.__version__); \
# print('🧱 PyMeshLab: OK'); \
# print('🚀 CUDA:', torch.cuda.is_available()); \
# print('🎯 Container pronto per Lambda AI!'); \
# "

# ✅ (DISATTIVATO) Verifica installazione PyMeshLab alla fine
# RUN python3 -c "\
# try: \
#     from pymeshlab import pmeshlab; \
#     print('✅ PyMeshLab importato correttamente'); \
# except Exception as e: \
#     print('❌ Errore PyMeshLab:', str(e)); \
#     raise SystemExit(1)"

ENTRYPOINT ["/entrypoint.sh"]
CMD ["bash"]
