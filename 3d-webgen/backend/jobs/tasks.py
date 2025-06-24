
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
logging.basicConfig(level=logging.INFO)



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
    job = Job.objects.get(pk=job_id)

    try:
        logger.info(f"🚀 Generazione mesh per job {job_id} (model {model_id})")

        # 1) Mark in progress
        job.status = "IN_PROGRESS"
        job.save(update_fields=["status"])

        # 2) Download dell’immagine da Supabase
        resp = requests.get(job.image.url, stream=True)
        resp.raise_for_status()

        # 3) Scrivo l’immagine in un file temporaneo
        ext = os.path.splitext(job.image.name)[1] or ".png"
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_img:
            for chunk in resp.iter_content(8192):
                tmp_img.write(chunk)
            input_path = tmp_img.name

        # 4) Creo una cartella temporanea per l’output
        with tempfile.TemporaryDirectory() as tmp_dir:
            # 5) Invoco meshGen.py puntando a tmp_dir
            script = "/home/ubuntu/ThesisProject/3d-webgen/ai/meshGen.py"
            cmd = [
                "python3", script,
                "--model-id", model_id,
                "--image-path", input_path,
                "--output-dir", tmp_dir
            ]
            if preprocess:
                cmd.append("--preprocess")

            logger.info("Eseguo: %s", " ".join(cmd))
            subprocess.run(cmd, check=True)

            # 6) Trovo l’ultimo .ply in tmp_dir
            ply_files = [f for f in os.listdir(tmp_dir) if f.endswith(".ply")]
            if not ply_files:
                raise RuntimeError("Nessun file .ply generato")
            latest = sorted(ply_files)[-1]
            local_ply = os.path.join(tmp_dir, latest)

            # 7) Carico direttamente su Supabase (S3) tramite Django-storages
            with open(local_ply, "rb") as f:
                # il percorso su S3 sarà results/<nome_file>.ply
                job.result_file.save(f"results/{latest}", File(f), save=False)

        # 8) Aggiorno lo stato a COMPLETED
        job.status = "COMPLETED"
        job.save(update_fields=["result_file","status"])
        logger.info(f"✅ Job {job_id} completato!")

    except Exception as exc:
        logger.exception(f"❌ Job {job_id} fallito")
        job.status = "FAILED"
        job.error_message = str(exc)
        job.save(update_fields=["status","error_message"])

    finally:
        # Rimuovo l’immagine temporanea
        try:
            os.remove(input_path)
        except Exception:
            pass
