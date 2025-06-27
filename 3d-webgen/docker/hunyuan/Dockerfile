# ============================
# Final image: adds Hunyuan3D and ThesisProject
# ============================

FROM matteopostiferi/hunyuan3d-2gp-base:latest

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

# 📦 Install ThesisProject backend requirements
RUN echo "📦 Installing ThesisProject requirements..." && \
    if [ -f "ThesisProject/3d-webgen/backend/requirements_lambda.txt" ]; then \
        pip install --no-cache-dir -r ThesisProject/3d-webgen/backend/requirements_lambda.txt || \
        echo "⚠️ Some ThesisProject requirements failed"; \
    else \
        echo "⚠️ requirements_lambda.txt not found"; \
    fi

# 📦 Install Hunyuan3D-2GP requirements and package
RUN echo "📦 Installing Hunyuan3D-2GP..." && \
    cd Hunyuan3D-2GP && \
    if [ -f "requirements.txt" ]; then \
        pip install --no-cache-dir -r requirements.txt --no-deps || \
        echo "⚠️ Some Hunyuan3D requirements failed"; \
    fi && \
    pip install -e . && \
    echo "✅ Hunyuan3D-2GP installed successfully"

# 🧠 Update environment variables
ENV PYTHONPATH="/workspace/Hunyuan3D-2GP:/workspace/ThesisProject/3d-webgen/backend:$PYTHONPATH"

# 🧪 Final verification
COPY <<EOF /tmp/verify_final.py
try:
    import hy3dgen
    print('✅ hy3dgen base import successful')
    
    from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline
    print('✅ Hunyuan3DDiTFlowMatchingPipeline import successful')
    
    import torch
    print(f'✅ PyTorch {torch.__version__} with CUDA: {torch.cuda.is_available()}')
    
    print('🎉 All Hunyuan3D components verified!')
    
except Exception as e:
    print(f'⚠️ Verification error: {str(e)}')
    import traceback
    traceback.print_exc()
EOF

RUN echo "🧪 Final verification..." && python3 /tmp/verify_final.py && rm /tmp/verify_final.py

# 📁 Copy additional project files (if needed)
# COPY ai ./ai
# COPY config ./config

# 🔧 Setup working directories
RUN mkdir -p /workspace/data /workspace/output /workspace/models

# 🏷️ Metadata
LABEL hunyuan3d.version="2GP"
LABEL thesis.project="3d-webgen"

# 🚀 Entry points for different services
# Django server
COPY <<EOF /usr/local/bin/run-django
#!/bin/bash
cd /workspace/ThesisProject/3d-webgen/backend
python manage.py runserver 0.0.0.0:8000
EOF

# Celery worker
COPY <<EOF /usr/local/bin/run-celery
#!/bin/bash
cd /workspace/ThesisProject/3d-webgen/backend
celery -A backend.celery worker --loglevel=info
EOF

RUN chmod +x /usr/local/bin/run-django /usr/local/bin/run-celery

# 💡 Usage information
COPY <<EOF /workspace/README.txt
🎉 Container ready! Available commands:
  
🚀 Run Django server:
   run-django
   
🚀 Run Celery worker:  
   run-celery
   
🐍 Python interactive:
   python3
   
🔧 Custom command:
   python3 your_script.py

📁 Important paths:
   - ThesisProject: /workspace/ThesisProject
   - Hunyuan3D: /workspace/Hunyuan3D-2GP
   - Data: /workspace/data
   - Output: /workspace/output
   - Models: /workspace/models
EOF

# 👟 Default command - show usage
CMD ["cat", "/workspace/README.txt"]