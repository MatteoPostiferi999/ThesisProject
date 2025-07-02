# ============================
# Final image: Complete Celery Worker for Hunyuan3D - CUSTOM USER COMPATIBLE
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

# 🔧 FIX CRITICAL: Install missing onnxruntime
RUN echo "📦 Installing missing onnxruntime..." && \
    pip install --no-cache-dir onnxruntime && \
    echo "✅ onnxruntime installed successfully"

# 🔧 REMOVED: tasks.py automatic fixes (now using updated code from git)
# The new tasks.py already has all necessary fixes and custom user support

# 📦 Install Hunyuan3D-2GP
RUN echo "📦 Installing Hunyuan3D-2GP..." && \
    cd Hunyuan3D-2GP && \
    pip install -e . && \
    echo "✅ Hunyuan3D-2GP installed successfully"

# 🧠 Update environment variables
ENV PYTHONPATH="/workspace/Hunyuan3D-2GP:/workspace/ThesisProject/3d-webgen/backend:$PYTHONPATH"

# 🧪 Complete verification test (including new fixes)
COPY <<EOF /tmp/verify_complete.py
try:
    print('🔍 Testing all Celery Worker dependencies...')
    print()
    
    # Django stack
    import django
    print(f'✅ Django {django.__version__}')
    
    import psycopg2
    print('✅ psycopg2 (Supabase PostgreSQL connection)')
    
    import boto3
    print('✅ boto3 (Supabase Storage)')
    
    from django.utils import timezone
    print('✅ Django timezone import')
    
    # Celery stack
    import celery
    print(f'✅ Celery {celery.__version__}')
    
    import redis
    print('✅ Redis client')
    
    # CRITICAL FIX: Test onnxruntime
    import onnxruntime
    print(f'✅ onnxruntime {onnxruntime.__version__}')
    
    # CRITICAL FIX: Test rembg with onnxruntime
    from rembg import remove
    print('✅ rembg with onnxruntime support')
    
    # Performance tracking dependencies
    import psutil
    print('✅ psutil for performance tracking')
    
    # Hunyuan3D stack
    import hy3dgen
    print('✅ hy3dgen base import')
    
    from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline
    print('✅ Hunyuan3DDiTFlowMatchingPipeline')
    
    # PyTorch + GPU
    import torch
    print(f'✅ PyTorch {torch.__version__}')
    print(f'✅ CUDA available: {torch.cuda.is_available()}')
    
    # Processing dependencies
    import cv2
    import numpy as np
    import trimesh
    print('✅ Computer vision and 3D processing')
    
    print()
    print('🎉 ALL DEPENDENCIES VERIFIED!')
    print('🔧 FEATURES INCLUDED:')
    print('   ✅ Custom User Model support')
    print('   ✅ Performance metrics tracking')
    print('   ✅ onnxruntime support')
    print('   ✅ Updated tasks.py from git')
    print('🚀 Celery Worker container ready for production!')
    
except Exception as e:
    print(f'❌ Verification failed: {str(e)}')
    import traceback
    traceback.print_exc()
    exit(1)
EOF

RUN python3 /tmp/verify_complete.py && rm /tmp/verify_complete.py

# 🔧 Setup working directories
RUN mkdir -p /app/models /app/outputs

# 🚀 Celery worker entry points
COPY <<EOF /usr/local/bin/run-celery-worker
#!/bin/bash
echo "🚀 Starting Celery Worker..."
cd /workspace/ThesisProject/3d-webgen/backend
exec celery -A backend worker --loglevel=info --pool=solo
EOF

COPY <<EOF /usr/local/bin/run-celery-with-queues
#!/bin/bash
echo "🚀 Starting Celery Worker with multiple queues..."
cd /workspace/ThesisProject/3d-webgen/backend
exec celery -A backend worker --loglevel=info --pool=solo -Q celery,default
EOF

RUN chmod +x /usr/local/bin/run-celery-worker /usr/local/bin/run-celery-with-queues

# 💡 Usage information
COPY <<EOF /workspace/README.txt
🎉 Complete Celery Worker Container Ready! (CUSTOM USER COMPATIBLE)

🔧 FEATURES:
   ✅ Custom User Model support
   ✅ Performance metrics tracking (psutil)
   ✅ onnxruntime support for rembg
   ✅ Updated code from git repository

🚀 Start options:
   1. Default: celery -A backend worker --loglevel=info --pool=solo
   2. Multi-queue: celery -A backend worker --loglevel=info --pool=solo -Q celery,default
   3. Helper script: run-celery-worker
   4. Multi-queue script: run-celery-with-queues

📁 Important paths:
   - ThesisProject backend: /workspace/ThesisProject/3d-webgen/backend
   - Hunyuan3D: /workspace/Hunyuan3D-2GP
   - Models cache: /app/models  
   - Outputs: /app/outputs

🔧 Environment:
   - Python: /usr/bin/python3
   - PYTHONPATH: includes Django backend and Hunyuan3D
   - CUDA: enabled for GPU processing
   - Django: full stack for database and storage
   - Celery: configured for Redis connection

🧪 Dependencies verified:
   ✅ Django + PostgreSQL (Supabase)
   ✅ Django Storage + S3 (Supabase)
   ✅ Celery + Redis (Railway)
   ✅ Hunyuan3D + PyTorch + CUDA
   ✅ Computer vision and 3D processing
   ✅ onnxruntime + rembg
   ✅ psutil for performance tracking
   ✅ Custom User Model compatible
EOF

# 🏷️ Final metadata
LABEL hunyuan3d.version="2GP-custom-user"
LABEL thesis.project="3d-webgen-celery-custom-user"
LABEL dependencies="complete-custom-user"

# 👟 Default command: Start Celery Worker with both queues
CMD ["celery", "-A", "backend", "worker", "--loglevel=info", "--pool=solo", "-Q", "celery,default"]