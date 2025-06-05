# ============================
# Final image: adds Hunyuan3D
# ============================

FROM matteopostiferi/hunyuan-base:latest

WORKDIR /workspace

# ⬇️ Clone Hunyuan3D and apply fixes
RUN git clone https://github.com/deepbeepmeep/Hunyuan3D-2GP.git && \
    cd Hunyuan3D-2GP && \
    sed -i 's/mmgp/hy3dgen/g' gradio_app.py && \
    sed -i 's/mmgp/hy3dgen/g' hy3dgen/shapegen/models/autoencoders/surface_extractors.py && \
    sed -i '/from hy3dgen import offload/d' hy3dgen/shapegen/models/autoencoders/surface_extractors.py

# 🐍 Install project-specific dependencies first
COPY docker/hunyuan/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 🔧 Install the Hunyuan3D-2GP package in development mode
RUN cd Hunyuan3D-2GP && \
    pip install -e .

# 🧠 Update PYTHONPATH to include the installed package
ENV PYTHONPATH="/workspace/Hunyuan3D-2GP:$PYTHONPATH"

# 📦 Copy your local code (e.g., meshGen.py)
COPY ai ./ai

# 👟 Default command
CMD ["python3", "-u", "ai/meshGen.py"]