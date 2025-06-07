
from celery import shared_task
from core.models import Job
import subprocess
import os
from django.conf import settings
from datetime import datetime
from django.conf import settings
import os
import time

# Celery task to generate mesh using Docker
# This task is triggered when a new job is created and runs in the background.
# It uses the Docker image 'matteopostiferi/hunyuan-gpu' to process the input image and generate a mesh.
# The task updates the job status in the database and handles any errors that may occur during processing.
# The task takes the job ID, model ID, and a preprocess flag as arguments.
# The model ID specifies which model to use for mesh generation, and the preprocess flag indicates whether to apply preprocessing steps.

# backend/jobs/tasks.py



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
        job = Job.objects.get(id=job_id)
        job.status = "IN_PROGRESS"
        job.save()

        if not job.image:
           raise ValueError("No input image provided for this job.")

        input_path = job.image.path

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"mesh_{job_id}_{timestamp}.ply"
        output_dir = os.path.join(settings.MEDIA_ROOT, "generated_meshes")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, filename)


        # Monta le cartelle corrette nel container
        # XXX DA CREARE L'IMMAGINE HUNYUAN-GPU XXX
        cmd = [
            "docker", "run", "--rm", "--gpus", "all",
            "-v", f"{settings.MEDIA_ROOT}/input_images:/input",
            "-v", f"{settings.MEDIA_ROOT}/generated_meshes:/output",
            "matteopostiferi/hunyuan-gpu",
            "--model-id", str(model_id),
            "--image-path", f"/input/{os.path.basename(input_path)}",
            "--output-path", f"/output/{filename}",
        ]


        if preprocess:
            cmd.append("--preprocess")

        subprocess.run(cmd, check=True)

        # Salva il risultato
        job.result_file.name = f"generated_meshes/{filename}"
        job.status = "COMPLETED"
        job.save()

    except Exception as e:
        job.status = "FAILED"
        job.error_message = str(e)
        job.save()
