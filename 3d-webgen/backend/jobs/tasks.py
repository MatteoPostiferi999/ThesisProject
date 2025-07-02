from django.utils import timezone
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
import psutil  # Per memoria e CPU
from celery import shared_task
from django.conf import settings
from django.core.files import File
from models_history.models import GeneratedModel  
from core.models import Job

# Setup logging
logger = logging.getLogger(__name__)

# Configurazione percorso Python
PYTHON_VENV_PATH = "python3"

class PerformanceTracker:
    """Classe per tracciare le performance della generazione mesh"""
    
    def __init__(self):
        self.start_time = None
        self.end_time = None
        self.phase_times = {}
        self.memory_usage = {}
        self.process = psutil.Process()
        
    def start(self):
        """Inizia il tracking"""
        self.start_time = time.time()
        self.memory_usage['start'] = self.process.memory_info().rss / 1024 / 1024  # MB
        logger.info(f"🎯 Performance tracking iniziato")
        logger.info(f"   Memoria iniziale: {self.memory_usage['start']:.1f} MB")
        
    def start_phase(self, phase_name):
        """Inizia una fase specifica"""
        phase_start = time.time()
        self.phase_times[f"{phase_name}_start"] = phase_start
        logger.info(f"⏱️ Inizio fase: {phase_name}")
        
    def end_phase(self, phase_name):
        """Termina una fase specifica"""
        phase_end = time.time()
        phase_start = self.phase_times.get(f"{phase_name}_start")
        if phase_start:
            duration = phase_end - phase_start
            self.phase_times[f"{phase_name}_duration"] = duration
            logger.info(f"✅ Fase completata: {phase_name} - Durata: {duration:.2f}s")
            
    def track_memory(self, point_name):
        """Traccia uso memoria in un punto specifico"""
        memory_mb = self.process.memory_info().rss / 1024 / 1024
        self.memory_usage[point_name] = memory_mb
        logger.info(f"📊 Memoria {point_name}: {memory_mb:.1f} MB")
        
    def end(self):
        """Termina il tracking e calcola statistiche finali"""
        self.end_time = time.time()
        self.memory_usage['end'] = self.process.memory_info().rss / 1024 / 1024
        
        total_time = self.end_time - self.start_time
        memory_diff = self.memory_usage['end'] - self.memory_usage['start']
        
        logger.info("📈 PERFORMANCE SUMMARY")
        logger.info("="*50)
        logger.info(f"⏰ Tempo totale: {total_time:.2f} secondi ({total_time/60:.1f} minuti)")
        logger.info(f"🧠 Memoria finale: {self.memory_usage['end']:.1f} MB")
        logger.info(f"📊 Delta memoria: {memory_diff:+.1f} MB")
        
        # Mostra durata delle fasi
        for key, value in self.phase_times.items():
            if key.endswith('_duration'):
                phase_name = key.replace('_duration', '')
                percentage = (value / total_time) * 100
                logger.info(f"   📋 {phase_name}: {value:.2f}s ({percentage:.1f}%)")
                
        logger.info("="*50)
        
        return {
            'total_time': total_time,
            'memory_start': self.memory_usage['start'],
            'memory_end': self.memory_usage['end'],
            'memory_delta': memory_diff,
            'phase_times': {k: v for k, v in self.phase_times.items() if k.endswith('_duration')}
        }

def analyze_mesh_file(file_path):
    """Analizza il file mesh generato per estrarre metriche"""
    try:
        file_size = os.path.getsize(file_path)
        
        # Conta righe per una stima approssimativa
        with open(file_path, 'r') as f:
            vertex_count = 0
            face_count = 0
            for line in f:
                if line.startswith('v '):
                    vertex_count += 1
                elif line.startswith('f '):
                    face_count += 1
        
        metrics = {
            'file_size_bytes': file_size,
            'file_size_kb': file_size / 1024,
            'estimated_vertices': vertex_count,
            'estimated_faces': face_count,
            'complexity_score': vertex_count + face_count  # Metrica semplice
        }
        
        logger.info("🔍 MESH ANALYSIS")
        logger.info(f"   📁 Dimensione file: {metrics['file_size_kb']:.1f} KB")
        logger.info(f"   🔺 Vertici stimati: {metrics['estimated_vertices']:,}")
        logger.info(f"   📐 Facce stimate: {metrics['estimated_faces']:,}")
        logger.info(f"   🏆 Score complessità: {metrics['complexity_score']:,}")
        
        return metrics
        
    except Exception as e:
        logger.warning(f"⚠️ Errore nell'analisi mesh: {e}")
        return {
            'file_size_bytes': os.path.getsize(file_path) if os.path.exists(file_path) else 0,
            'error': str(e)
        }

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_mesh_task(self, job_id, slug, model_id="1", preprocess=False):
    """
    Task per generare mesh 3D con controlli dettagliati e tracking performance
    """
    task_id = self.request.id
    input_path = None
    
    # Inizializza tracker performance
    perf_tracker = PerformanceTracker()
    perf_tracker.start()
    
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
        perf_tracker.start_phase("job_retrieval")
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
        perf_tracker.end_phase("job_retrieval")

        # ========== STEP 2: AGGIORNAMENTO STATUS ==========
        perf_tracker.start_phase("status_update")
        logger.info("🔄 STEP 2: Aggiornamento status a IN_PROGRESS...")
        try:
            old_status = job.status
            job.status = "IN_PROGRESS"
            job.updated_at = timezone.now()
            job.save(update_fields=["status", "updated_at"])
            logger.info(f"✅ Status aggiornato: {old_status} → IN_PROGRESS")
        except Exception as e:
            error_msg = f"❌ Errore nell'aggiornamento dello status: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
        perf_tracker.end_phase("status_update")

        # ========== STEP 3: VALIDAZIONE IMMAGINE ==========
        perf_tracker.start_phase("image_validation")
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
        perf_tracker.end_phase("image_validation")

        # ========== STEP 4: DOWNLOAD IMMAGINE ==========
        perf_tracker.start_phase("image_download")
        perf_tracker.track_memory("before_download")
        logger.info("📥 STEP 4: Download immagine...")
        try:
            logger.info(f"🌐 Scaricamento da: {image_url}")
            download_start = time.time()
            resp = requests.get(image_url, stream=True, timeout=30)
            resp.raise_for_status()
            download_time = time.time() - download_start
            
            content_length = resp.headers.get('Content-Length')
            if content_length:
                size_kb = int(content_length)/1024
                speed_kbps = size_kb / download_time if download_time > 0 else 0
                logger.info(f"📊 Dimensione file: {size_kb:.1f} KB")
                logger.info(f"⚡ Velocità download: {speed_kbps:.1f} KB/s")
            
            logger.info(f"⏱️ Tempo download: {download_time:.2f}s")
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
        perf_tracker.track_memory("after_download")
        perf_tracker.end_phase("image_download")

        # ========== STEP 5: SCRITTURA FILE TEMPORANEO ==========
        perf_tracker.start_phase("file_write")
        logger.info("💾 STEP 5: Scrittura file temporaneo...")
        try:
            ext = os.path.splitext(job.image.name)[1] or ".png"
            logger.info(f"📎 Estensione file: {ext}")
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_img:
                bytes_written = 0
                write_start = time.time()
                for chunk in resp.iter_content(8192):
                    if chunk:
                        tmp_img.write(chunk)
                        bytes_written += len(chunk)
                input_path = tmp_img.name
                write_time = time.time() - write_start
            
            logger.info(f"✅ File salvato: {input_path}")
            logger.info(f"📊 Bytes scritti: {bytes_written}")
            logger.info(f"⏱️ Tempo scrittura: {write_time:.2f}s")
            
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
        perf_tracker.end_phase("file_write")

        # ========== STEP 6: PREPARAZIONE ESECUZIONE ==========
        perf_tracker.start_phase("script_preparation")
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
            perf_tracker.end_phase("script_preparation")

            # ========== STEP 7: ESECUZIONE SCRIPT ==========
            perf_tracker.start_phase("mesh_generation")
            perf_tracker.track_memory("before_generation")
            logger.info("🚀 STEP 7: Esecuzione meshGen.py...")
            
            try:
                # Esecuzione con capture dell'output
                generation_start = time.time()
                result = subprocess.run(
                    cmd, 
                    check=True, 
                    capture_output=True, 
                    text=True,
                    timeout=300  # 5 minuti timeout
                )
                generation_time = time.time() - generation_start
                
                logger.info("✅ meshGen.py eseguito con successo")
                logger.info(f"⏰ Tempo generazione: {generation_time:.2f}s ({generation_time/60:.1f} min)")
                
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
            
            perf_tracker.track_memory("after_generation")
            perf_tracker.end_phase("mesh_generation")

            # ========== STEP 8: CONTROLLO OUTPUT ==========
            perf_tracker.start_phase("output_analysis")
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
                
                # Analizza il mesh generato
                mesh_metrics = analyze_mesh_file(local_obj)
                    
            except Exception as e:
                error_msg = f"❌ Errore nel controllo output: {str(e)}"
                logger.error(error_msg)
                raise RuntimeError(error_msg)
            perf_tracker.end_phase("output_analysis")

            # ========== STEP 9: UPLOAD FILE ==========
            perf_tracker.start_phase("file_upload")
            logger.info("📤 STEP 9: Upload file risultato...")
            
            try:
                with open(local_obj, "rb") as f:
                    filename = f"results/{slug}_{job_id}_{latest_obj}"
                    logger.info(f"📁 Nome file upload: {filename}")
                    
                    upload_start = time.time()
                    job.result_file.save(filename, File(f), save=False)
                    upload_time = time.time() - upload_start
                    
                    logger.info(f"✅ Upload completato: {job.result_file.url}")
                    logger.info(f"⏱️ Tempo upload: {upload_time:.2f}s")
                    
            except Exception as e:
                error_msg = f"❌ Errore durante l'upload: {str(e)}"
                logger.error(error_msg)
                raise RuntimeError(error_msg)
            perf_tracker.end_phase("file_upload")

            # ========== STEP 10: SALVATAGGIO CRONOLOGIA ==========
            perf_tracker.start_phase("history_save")
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
            perf_tracker.end_phase("history_save")

        # ========== STEP 11: COMPLETAMENTO JOB ==========
        perf_tracker.start_phase("job_completion")
        logger.info("✅ STEP 11: Completamento job...")
        
        try:
            job.status = "COMPLETED"
            job.updated_at = timezone.now()
            job.save(update_fields=["result_file", "status", "updated_at"])
            logger.info(f"✅ Job {job_id} completato con successo!")
            
        except Exception as e:
            error_msg = f"❌ Errore nel completamento job: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
        perf_tracker.end_phase("job_completion")

        # ========== PERFORMANCE FINALE ==========
        performance_stats = perf_tracker.end()

        # ========== RISULTATO FINALE ==========
        result_data = {
            'job_id': job_id,
            'status': 'COMPLETED',
            'result_url': job.result_file.url,
            'task_id': task_id,
            'performance': performance_stats,
            'mesh_metrics': mesh_metrics if 'mesh_metrics' in locals() else {}
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
            job.updated_at = timezone.now()
            job.save(update_fields=["status", "error_message", "updated_at"])
            logger.info(f"✅ Status job aggiornato a FAILED")
        except Exception as save_error:
            logger.error(f"❌ Errore nell'aggiornamento del job: {save_error}")

        # Performance stats anche in caso di errore
        if 'perf_tracker' in locals():
            try:
                error_stats = perf_tracker.end()
                logger.info(f"📊 Performance fino al punto di errore: {error_stats}")
            except:
                pass

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