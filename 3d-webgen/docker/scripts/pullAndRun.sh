
#!/bin/bash

# Nome dell'immagine e tag
IMAGE_NAME="matteopostiferi/lambda-flask-gpu"
TAG="latest"

echo "🐳 Pull dell'immagine da Docker Hub..."
docker pull $IMAGE_NAME:$TAG

echo "🚀 Avvio del container con accesso GPU..."
docker run --gpus all -p 8000:5000 $IMAGE_NAME:$TAG#!/bin/bash

# Nome dell'immagine e tag
IMAGE_NAME="matteopostiferi/lambda-flask-gpu"
TAG="latest"

echo "🐳 Pull dell'immagine da Docker Hub..."
docker pull $IMAGE_NAME:$TAG

echo "🚀 Avvio del container con accesso GPU..."
docker run --gpus all -p 8000:5000 $IMAGE_NAME:$TAG

