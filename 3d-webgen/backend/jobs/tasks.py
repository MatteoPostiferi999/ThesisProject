
from celery import shared_task
from core.models import Job
import subprocess
import os
from django.conf import settings
from datetime import datetime
from django.conf import settings
import os
import time
import logging
import tempfile
import requests

from celery import shared_task
from django.conf import settings
from django.core.files import File

from core.models import Job

logger = logging.getLogger(__name__)


# Celery task to generate mesh using Docker
# This task is triggered when a new job is created and runs in the background.
# It uses the Docker image 'matteopostiferi/hunyuan-gpu' to process the input image and generate a mesh.
# The task updates the job status in the database and handles any errors that may occur during processing.
# The task takes the job ID, model ID, and a preprocess flag as arguments.
# The model ID specifies which model to use for mesh generation, and the preprocess flag indicates whether to apply preprocessing steps.




@shared_task
def process_image(job_id, input_path):
    try:
        job = Job.objects.get(id=job_id)

        # Simula elaborazione
        print("GENERO MESH: START")

        time.sleep(30)  # tempo fittizio
        print("GENERO MESH: DONE")


        # Simula risultato copiando una mesh finta
        fake_output_path = os.path.join(settings.MEDIA_ROOT, 'PROVA.obj')
        result_path = os.path.join(settings.MEDIA_ROOT, 'results', f'{job_id}_mesh.obj')


        with open(fake_output_path, 'rb') as fsrc, open(result_path, 'wb') as fdst:
            fdst.write(fsrc.read())

        # Salva path nel job
        job.result_file.name = f"results/{job_id}_mesh.obj"
        job.status = 'COMPLETED'
        job.save()
    except Exception as e:
        job.status = 'FAILED'
        job.error_message = str(e)
        job.save()



@shared_task
def generate_mesh_task(job_id, model_id="4", preprocess=False):
    try:
        logger.info(f"🚀 Avvio generazione mesh per job {job_id} (model {model_id})")

        # 1) Marca il job come in progress
        job = Job.objects.get(pk=job_id)
        job.status = "IN_PROGRESS"
        job.save(update_fields=["status"])

        # 2) Scarica l'immagine dal bucket Supabase
        img_url = job.image.url
        resp = requests.get(img_url, stream=True)
        if resp.status_code != 200:
            raise RuntimeError(f"Impossibile scaricare l'immagine ({resp.status_code})")

        # 3) Salva l'immagine in un file temporaneo
        ext = os.path.splitext(img_url)[1] or ".png"
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            for chunk in resp.iter_content(chunk_size=8192):
                tmp.write(chunk)
            input_path = tmp.name

        # 4) Prepara la directory di output
        output_dir = os.path.join(settings.MEDIA_ROOT, "results")
        os.makedirs(output_dir, exist_ok=True)

        # 5) Esegui meshGen.py
        script_path = "/home/ubuntu/ThesisProject/3d-webgen/ai/meshGen.py"
        cmd = [
            "python3", script_path,
            "--model-id", model_id,
            "--image-path", input_path,
            "--output-dir", output_dir
        ]
        if preprocess:
            cmd.append("--preprocess")
        logger.info("Running: %s", " ".join(cmd))
        subprocess.run(cmd, check=True)

        # 6) Recupera l'ultimo file .ply generato
        ply_files = sorted(f for f in os.listdir(output_dir) if f.endswith(".ply"))
        latest_ply = ply_files[-1]
        result_path = os.path.join(output_dir, latest_ply)

        # 7) Salva il .ply via FileField (carica su Supabase)
        with open(result_path, "rb") as f:
            django_file = File(f)
            job.result_file.save(f"results/{latest_ply}", django_file, save=False)

        # 8) Aggiorna lo stato a COMPLETED
        job.status = "COMPLETED"
        job.save(update_fields=["result_file", "status"])
        logger.info(f"✅ Job {job_id} completato: {latest_ply}")

    except Exception as e:
        logger.exception(f"❌ Job {job_id} fallito")
        # In caso di errore, marca il job come FAILED e memorizza il messaggio
        job.status = "FAILED"
        job.error_message = str(e)
        job.save(update_fields=["status", "error_message"])
    finally:
        # 9) Pulisci il file temporaneo
        try:
            os.remove(input_path)
        except Exception:
            pass