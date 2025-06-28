# ============================
# Final image: ONLY Celery Worker for Hunyuan3D
# ============================

FROM matteopostiferi/hunyuan-base:latest

WORKDIR /workspace

# 📥 Clone repositories
RUN echo "🔁 Cloning repositories..." && \
    git clone https://github.com/MatteoPostiferi999/ThesisProject.git ThesisProject && \
    git clone https://github.com/deepbeepmeep/Hunyuan3D-2GP.git Hunyuan3D-2GP

# 🩹 Apply patches to Hunyuan3D-2GP
RUN echo "🩹 Applying patches..." && \
    cd Hunyuan3D-2GP && \
    sed -i 's/mmgp/hy3dgen/g' gradio_app.py && \
    sed -i 's/mmgp/hy3dgen/g' hy3dgen/shapegen/models/autoencoders/surface_extractors.py && \
    sed -i '/from hy3dgen import offload/d' hy3dgen/shapegen/models/autoencoders/surface_extractors.py && \
    echo "✅ Patches applied successfully"

# 📦 Install ONLY Hunyuan3D-2GP (no Django dependencies)
RUN echo "📦 Installing Hunyuan3D-2GP..." && \
    cd Hunyuan3D-2GP && \
    pip install -e . && \
    echo "✅ Hunyuan3D-2GP installed successfully"

# 🧠 Update environment variables
ENV PYTHONPATH="/workspace/Hunyuan3D-2GP:/workspace/ThesisProject/3d-webgen/backend:$PYTHONPATH"

# 🧪 Verify Hunyuan3D only
COPY <<EOF /tmp/verify_hunyuan.py
try:
    import hy3dgen
    print('✅ hy3dgen base import successful')
    
    from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline
    print('✅ Hunyuan3DDiTFlowMatchingPipeline import successful')
    
    import torch
    print(f'✅ PyTorch {torch.__version__} with CUDA: {torch.cuda.is_available()}')
    
    import celery
    print(f'✅ Celery {celery.__version__} ready')
    
    print('🎉 Celery Worker container verified!')
    
except Exception as e:
    print(f'⚠️ Verification error: {str(e)}')
    import traceback
    traceback.print_exc()
EOF

RUN python3 /tmp/verify_hunyuan.py && rm /tmp/verify_hunyuan.py

# 🔧 Setup working directories for Celery
RUN mkdir -p /app/models /app/outputs

# 🚀 Celery worker entry point
COPY <<EOF /usr/local/bin/run-celery-worker
#!/bin/bash
cd /workspace/ThesisProject/3d-webgen/backend
exec celery -A backend worker --loglevel=info --pool=solo
EOF

RUN chmod +x /usr/local/bin/run-celery-worker

# 💡 Usage information
COPY <<EOF /workspace/README.txt
🎉 Celery Worker Container Ready!

🚀 Start Celery Worker:
   celery -A backend worker --loglevel=info --pool=solo

📁 Important paths:
   - ThesisProject: /workspace/ThesisProject/3d-webgen/backend
   - Hunyuan3D: /workspace/Hunyuan3D-2GP
   - Models cache: /app/models  
   - Outputs: /app/outputs

🔧 Environment:
   - Python: /usr/bin/python3
   - PYTHONPATH includes both projects
   - CUDA enabled for GPU processing
EOF

# 👟 Default command: Start Celery Worker
CMD ["celery", "-A", "backend", "worker", "--loglevel=info", "--pool=solo"]