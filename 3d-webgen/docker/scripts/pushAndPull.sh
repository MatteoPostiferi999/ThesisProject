#!/bin/bash

# Nome dell'immagine e tag
IMAGE_NAME="matteopostiferi/lambda-flask-gpu"
TAG="latest"

echo "🔧 Build dell'immagine..."
docker build -t $IMAGE_NAME:$TAG .

echo "🐳 Login a Docker Hub..."
docker login

echo "🚀 Push dell'immagine su Docker Hub..."
docker push $IMAGE_NAME:$TAG

echo "✅ Push completato con successo!"