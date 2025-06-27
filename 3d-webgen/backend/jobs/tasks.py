
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
from models_history.models import GeneratedModel  

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



Pimport os
import tempfile
import subprocess
import requests
from celery import shared_task
from celery.utils.log import get_task_logger
from django.core.files import File
from django.utils import timezone
from .models import Job, GeneratedModel

logger = get_task_logger(__name__)

PYTHON_VENV_PATH = "python3"

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_mesh_task(self, job_id, slug, model_id="1", preprocess=False):
    """
    Task per generare mesh 3D con controlli dettagliati
    """
    task_id = self.request.id
    input_path = None
    
    # ========== LOGGING INIZIALE ==========
    logger.info("="*80)
    logger.info(f"🚀 INIZIO TASK generate_mesh_task")
    logger.info(f"   Task ID: {task_id}")
    logger.info(f"   Job ID: {job_id}")
    logger.info(f"   Slug: {slug}")
    logger.info(f"   Model ID: {model_id}")
    logger.info(f"   Preprocess: {preprocess}")
    logger.info(f"   Retry count: {self.request.retries}")
    logger.info("="*80)
    
    try:
        # ========== STEP 1: RECUPERO JOB ==========
        logger.info("📋 STEP 1: Recupero informazioni job...")
        try:
            job = Job.objects.get(pk=job_id)
            logger.info(f"✅ Job trovato: {job}")
            logger.info(f"   User: {job.user}")
            logger.info(f"   Status attuale: {job.status}")
            logger.info(f"   Immagine: {job.image}")
            logger.info(f"   Immagine URL: {job.image.url if job.image else 'None'}")
        except Job.DoesNotExist:
            error_msg = f"❌ Job {job_id} non trovato nel database"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
        except Exception as e:
            error_msg = f"❌ Errore nel recupero del job {job_id}: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        # ========== STEP 2: AGGIORNAMENTO STATUS ==========
        logger.info("🔄 STEP 2: Aggiornamento status a IN_PROGRESS...")
        try:
            old_status = job.status
            job.status = "IN_PROGRESS"
            job.task_id = task_id  # Salva l'ID del task
            job.started_at = timezone.now()  # Aggiungi questo campo se non c'è
            job.save(update_fields=["status", "task_id"])
            logger.info(f"✅ Status aggiornato: {old_status} → IN_PROGRESS")
        except Exception as e:
            error_msg = f"❌ Errore nell'aggiornamento dello status: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        # ========== STEP 3: VALIDAZIONE IMMAGINE ==========
        logger.info("🖼️ STEP 3: Validazione immagine...")
        if not job.image:
            raise RuntimeError("❌ Nessuna immagine associata al job")
        
        image_url = job.image.url
        logger.info(f"📍 URL immagine: {image_url}")
        
        # Test di raggiungibilità dell'URL
        try:
            logger.info("🔍 Test raggiungibilità URL...")
            head_resp = requests.head(image_url, timeout=10)
            logger.info(f"✅ URL raggiungibile - Status: {head_resp.status_code}")
            logger.info(f"   Content-Type: {head_resp.headers.get('Content-Type', 'Unknown')}")
            logger.info(f"   Content-Length: {head_resp.headers.get('Content-Length', 'Unknown')}")
        except Exception as e:
            error_msg = f"❌ URL immagine non raggiungibile: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        # ========== STEP 4: DOWNLOAD IMMAGINE ==========
        logger.info("📥 STEP 4: Download immagine...")
        try:
            logger.info(f"🌐 Scaricamento da: {image_url}")
            resp = requests.get(image_url, stream=True, timeout=30)
            resp.raise_for_status()
            
            content_length = resp.headers.get('Content-Length')
            if content_length:
                logger.info(f"📊 Dimensione file: {int(content_length)/1024:.1f} KB")
            
            logger.info("✅ Download completato con successo")
        except requests.exceptions.Timeout:
            error_msg = "❌ Timeout durante il download dell'immagine"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
        except requests.exceptions.RequestException as e:
            error_msg = f"❌ Errore HTTP durante il download: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
        except Exception as e:
            error_msg = f"❌ Errore generico durante il download: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        # ========== STEP 5: SCRITTURA FILE TEMPORANEO ==========
        logger.info("💾 STEP 5: Scrittura file temporaneo...")
        try:
            ext = os.path.splitext(job.image.name)[1] or ".png"
            logger.info(f"📎 Estensione file: {ext}")
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_img:
                bytes_written = 0
                for chunk in resp.iter_content(8192):
                    if chunk:
                        tmp_img.write(chunk)
                        bytes_written += len(chunk)
                input_path = tmp_img.name
            
            logger.info(f"✅ File salvato: {input_path}")
            logger.info(f"📊 Bytes scritti: {bytes_written}")
            
            # Verifica che il file esista e abbia contenuto
            if not os.path.exists(input_path):
                raise RuntimeError("File temporaneo non creato")
            
            file_size = os.path.getsize(input_path)
            if file_size == 0:
                raise RuntimeError("File temporaneo vuoto")
                
            logger.info(f"✅ Verifica file OK - Dimensione: {file_size} bytes")
            
        except Exception as e:
            error_msg = f"❌ Errore nella scrittura del file temporaneo: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        # ========== STEP 6: PREPARAZIONE ESECUZIONE ==========
        logger.info("⚙️ STEP 6: Preparazione esecuzione meshGen.py...")
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            logger.info(f"📂 Directory temporanea: {tmp_dir}")
            
            # Verifica esistenza script
            script = "/workspace/ThesisProject/3d-webgen/ai/meshGen.py"
            logger.info(f"🔍 Controllo script: {script}")
            
            if not os.path.exists(script):
                error_msg = f"❌ Script non trovato: {script}"
                logger.error(error_msg)
                raise RuntimeError(error_msg)
            
            logger.info("✅ Script trovato")
            
            # Costruzione comando
            cmd = [
                PYTHON_VENV_PATH, script,
                "--model-id", model_id,
                "--image-path", input_path,
                "--output-dir", tmp_dir
            ]
            if preprocess:
                cmd.append("--preprocess")

            logger.info("🔧 Comando da eseguire:")
            logger.info(f"   {' '.join(cmd)}")

            # ========== STEP 7: ESECUZIONE SCRIPT ==========
            logger.info("🚀 STEP 7: Esecuzione meshGen.py...")
            
            try:
                # Esecuzione con capture dell'output
                result = subprocess.run(
                    cmd, 
                    check=True, 
                    capture_output=True, 
                    text=True,
                    timeout=300  # 5 minuti timeout
                )
                
                logger.info("✅ meshGen.py eseguito con successo")
                
                if result.stdout:
                    logger.info("📄 STDOUT:")
                    for line in result.stdout.split('\n'):
                        if line.strip():
                            logger.info(f"   {line}")
                
                if result.stderr:
                    logger.info("⚠️ STDERR:")
                    for line in result.stderr.split('\n'):
                        if line.strip():
                            logger.info(f"   {line}")
                            
            except subprocess.TimeoutExpired:
                error_msg = "❌ Timeout nell'esecuzione di meshGen.py (>5 minuti)"
                logger.error(error_msg)
                raise RuntimeError(error_msg)
            except subprocess.CalledProcessError as e:
                error_msg = f"❌ meshGen.py fallito con exit code {e.returncode}"
                logger.error(error_msg)
                if e.stdout:
                    logger.error(f"STDOUT: {e.stdout}")
                if e.stderr:
                    logger.error(f"STDERR: {e.stderr}")
                raise RuntimeError(error_msg)
            except Exception as e:
                error_msg = f"❌ Errore nell'esecuzione di meshGen.py: {str(e)}"
                logger.error(error_msg)
                raise RuntimeError(error_msg)

            # ========== STEP 8: CONTROLLO OUTPUT ==========
            logger.info("📦 STEP 8: Controllo file di output...")
            
            try:
                all_files = os.listdir(tmp_dir)
                logger.info(f"📋 File nella directory output: {all_files}")
                
                obj_files = [f for f in all_files if f.endswith(".obj")]
                logger.info(f"📋 File .obj trovati: {obj_files}")
                
                if not obj_files:
                    error_msg = "❌ Nessun file .obj generato"
                    logger.error(error_msg)
                    raise RuntimeError(error_msg)
                
                latest_obj = sorted(obj_files)[-1]
                local_obj = os.path.join(tmp_dir, latest_obj)
                
                # Verifica dimensione file
                obj_size = os.path.getsize(local_obj)
                logger.info(f"✅ File .obj selezionato: {latest_obj}")
                logger.info(f"📊 Dimensione: {obj_size} bytes")
                
                if obj_size == 0:
                    raise RuntimeError("File .obj vuoto")
                    
            except Exception as e:
                error_msg = f"❌ Errore nel controllo output: {str(e)}"
                logger.error(error_msg)
                raise RuntimeError(error_msg)

            # ========== STEP 9: UPLOAD FILE ==========
            logger.info("📤 STEP 9: Upload file risultato...")
            
            try:
                with open(local_obj, "rb") as f:
                    filename = f"results/{slug}_{job_id}_{latest_obj}"
                    logger.info(f"📁 Nome file upload: {filename}")
                    
                    job.result_file.save(filename, File(f), save=False)
                    logger.info(f"✅ Upload completato: {job.result_file.url}")
                    
            except Exception as e:
                error_msg = f"❌ Errore durante l'upload: {str(e)}"
                logger.error(error_msg)
                raise RuntimeError(error_msg)

            # ========== STEP 10: SALVATAGGIO CRONOLOGIA ==========
            logger.info("🗂️ STEP 10: Salvataggio in cronologia...")
            
            try:
                generated_model = GeneratedModel.objects.create(
                    user=job.user,
                    job=job,
                    model_name=slug,
                    input_image=job.image.url,
                    output_model=job.result_file.url,
                )
                logger.info(f"✅ Modello salvato in cronologia: ID {generated_model.id}")
                
            except Exception as e:
                error_msg = f"❌ Errore nel salvataggio cronologia: {str(e)}"
                logger.error(error_msg)
                # Non interrompiamo per questo, solo log
                logger.warning("⚠️ Continuiamo nonostante l'errore in cronologia")

        # ========== STEP 11: COMPLETAMENTO JOB ==========
        logger.info("✅ STEP 11: Completamento job...")
        
        try:
            job.status = "COMPLETED"
            job.completed_at = timezone.now()
            job.save(update_fields=["result_file", "status", "completed_at"])
            logger.info(f"✅ Job {job_id} completato con successo!")
            
        except Exception as e:
            error_msg = f"❌ Errore nel completamento job: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        # ========== RISULTATO FINALE ==========
        result_data = {
            'job_id': job_id,
            'status': 'COMPLETED',
            'result_url': job.result_file.url,
            'task_id': task_id
        }
        
        logger.info("🎉 TASK COMPLETATO CON SUCCESSO!")
        logger.info(f"📊 Risultato: {result_data}")
        
        return result_data

    except Exception as exc:
        # ========== GESTIONE ERRORI ==========
        logger.error("="*80)
        logger.error(f"❌ ERRORE IN TASK generate_mesh_task")
        logger.error(f"   Task ID: {task_id}")
        logger.error(f"   Job ID: {job_id}")
        logger.error(f"   Retry: {self.request.retries}/{self.max_retries}")
        logger.error(f"   Errore: {str(exc)}")
        logger.exception("Stack trace completo:")
        logger.error("="*80)
        
        # Aggiorna job con errore
        try:
            job = Job.objects.get(pk=job_id)
            job.status = "FAILED"
            job.error_message = str(exc)
            job.failed_at = timezone.now()
            job.save(update_fields=["status", "error_message", "failed_at"])
            logger.info(f"✅ Status job aggiornato a FAILED")
        except Exception as save_error:
            logger.error(f"❌ Errore nell'aggiornamento del job: {save_error}")

        # Retry logic
        if self.request.retries < self.max_retries:
            logger.info(f"🔄 Tentativo di retry in 60 secondi...")
            raise self.retry(exc=exc, countdown=60)
        else:
            logger.error(f"❌ Massimo numero di retry raggiunto, task fallito definitivamente")
            raise exc

    finally:
        # ========== PULIZIA FINALE ==========
        logger.info("🧹 Pulizia file temporanei...")
        try:
            if input_path and os.path.exists(input_path):
                os.remove(input_path)
                logger.info(f"✅ File temporaneo rimosso: {input_path}")
        except Exception as cleanup_error:
            logger.warning(f"⚠️ Errore nella pulizia: {cleanup_error}")
        
        logger.info("🏁 FINE TASK generate_mesh_task")
        logger.info("="*80)