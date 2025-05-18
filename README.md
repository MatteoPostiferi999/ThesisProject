# ThesisProject

# 3D Web Generator

This is a web-based system that generates 3D models from 2D images using AI.

## Features

- Upload a 2D image via a simple React frontend
- Django backend processes the request
- A deep learning model (Hunyuan 3D) runs on GPU (e.g., Lambda AI)
- Optional segmentation step before 3D generation
- Dockerized setup

## Project Structure

frontend/ # React app
backend/ # Django API and Celery tasks
model/ # Inference pipeline
queue/ # Background job management
docker/ # Docker and deployment


## Quick Start

```bash
# Backend setup (example)
cd backend
python -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt

