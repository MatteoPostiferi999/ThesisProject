from rembg import remove
from PIL import ImageEnhance, Image
import os
import torch
import logging
from datetime import datetime
from huggingface_hub import snapshot_download
from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline
import trimesh
import sys
import argparse

logging.basicConfig(level=logging.INFO)

device = 'cuda' if torch.cuda.is_available() else 'cpu'
logging.info(f"🖥️ Usando device: {device}")

def preprocess_image(img: Image.Image, name: str = "input_clean") -> Image.Image:
    img = remove(img)
    img = img.crop(img.getbbox())
    #img = img.resize((512, 512))
    img = ImageEnhance.Contrast(img).enhance(1.5)

    os.makedirs("preprocessed", exist_ok=True)
    img.save(f"preprocessed/{name}.png")

    return img


def parse_args():
    parser = argparse.ArgumentParser(description="Generate 3D mesh from 2D image using Hunyuan3D.")

    parser.add_argument("--model-id", required=True, choices=[str(i) for i in range(1, 10)], help="Model ID (1–9)")
    parser.add_argument("--image-path", help="Path to single image (for non-multiview models)")
    parser.add_argument("--multiview-paths", nargs="+", help="Paths for multiview images in order: front left right back")
    parser.add_argument("--preprocess", action="store_true", help="Enable background removal and enhancement")

    # Optional inference settings
    parser.add_argument("--target-face-number", type=int, default=60000)
    parser.add_argument("--steps", type=int, default=60)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--octree-resolution", type=int, default=256)

    return parser.parse_args()


if __name__ == "__main__":
    print("🚀 Inizio esecuzione meshGen.py")

    args = parse_args()

    model = {
        '1': {'repo': 'tencent/Hunyuan3D-2mini', 'subfolder': 'hunyuan3d-dit-v2-mini'},
        '2': {'repo': 'tencent/Hunyuan3D-2mini', 'subfolder': 'hunyuan3d-dit-v2-mini-fast'},
        '3': {'repo': 'tencent/Hunyuan3D-2mini', 'subfolder': 'hunyuan3d-dit-v2-mini-turbo'},
        '4': {'repo': 'tencent/Hunyuan3D-2',     'subfolder': 'hunyuan3d-dit-v2-0'},
        '5': {'repo': 'tencent/Hunyuan3D-2',     'subfolder': 'hunyuan3d-dit-v2-0-fast'},
        '6': {'repo': 'tencent/Hunyuan3D-2',     'subfolder': 'hunyuan3d-dit-v2-0-turbo'},
        '7': {'repo': 'tencent/Hunyuan3D-2mv',   'subfolder': 'hunyuan3d-dit-v2-mv'},
        '8': {'repo': 'tencent/Hunyuan3D-2mv',   'subfolder': 'hunyuan3d-dit-v2-mv-fast'},
        '9': {'repo': 'tencent/Hunyuan3D-2mv',   'subfolder': 'hunyuan3d-dit-v2-mv-turbo'},
    }[args.model_id]

    # Download model
    local_dir = snapshot_download(
        repo_id=model['repo'],
        allow_patterns=[
            f"{model['subfolder']}/config.yaml",
            f"{model['subfolder']}/*.safetensors"
        ],
        resume_download=True
    )

    pipeline = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
        local_dir,
        subfolder=model['subfolder'],
        device=device,
        local_files_only=True
    )

    # Load image(s)
    if 'mv' in model['subfolder']:
        views = ['front', 'left', 'right', 'back']
        if not args.multiview_paths or len(args.multiview_paths) != 4:
            raise ValueError("Multiview models require exactly 4 image paths (front, left, right, back).")
        image_input = {
            view: preprocess_image(Image.open(p).convert("RGBA"), view) if args.preprocess else Image.open(p).convert("RGBA")
            for view, p in zip(views, args.multiview_paths)
        }
    else:
        if not args.image_path:
            raise ValueError("Single image model requires --image-path.")
        img = Image.open(args.image_path).convert("RGBA")
        image_input = preprocess_image(img) if args.preprocess else img

    # Generate mesh
    with torch.no_grad():
        mesh = pipeline(
            image=image_input,
            target_face_number=args.target_face_number,
            inference_steps=args.steps,
            seed=args.seed,
            octree_resolution=args.octree_resolution
        )[0]

    # Save mesh in fixed directory
    base_dir = "/home/ubuntu/ThesisProject/3d-webgen/backend/media/results"
    os.makedirs(base_dir, exist_ok=True)
    output_path = os.path.join(base_dir, f"mesh_{datetime.now().strftime('%Y%m%d_%H%M%S')}.ply")
    mesh.export(output_path)
    print(f"✅ Mesh salvata in: {output_path}")