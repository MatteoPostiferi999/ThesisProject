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
import psutil
from celery import shared_task
from django.conf import settings
from django.core.files import File
from models_history.models import GeneratedModel  
from core.models import Job

# Setup logging con livelli diversi
logger = logging.getLogger(__name__)

class SilentPerformanceTracker:
    """Classe per tracciare le performance SENZA logging intermedio"""
    
    def __init__(self):
        self.start_time = None
        self.end_time = None
        self.phase_times = {}
        self.memory_usage = {}
        self.process = psutil.Process()
        self.errors = []  # Collezioniamo errori per il report finale
        
    def start(self):
        """Inizia il tracking SILENZIOSAMENTE"""
        self.start_time = time.time()
        self.memory_usage['start'] = self.process.memory_info().rss / 1024 / 1024
        
    def start_phase(self, phase_name):
        """Inizia una fase specifica SILENZIOSAMENTE"""
        self.phase_times[f"{phase_name}_start"] = time.time()
        
    def end_phase(self, phase_name):
        """Termina una fase specifica SILENZIOSAMENTE"""
        phase_end = time.time()
        phase_start = self.phase_times.get(f"{phase_name}_start")
        if phase_start:
            duration = phase_end - phase_start
            self.phase_times[f"{phase_name}_duration"] = duration
            
    def track_memory(self, point_name):
        """Traccia uso memoria SILENZIOSAMENTE"""
        memory_mb = self.process.memory_info().rss / 1024 / 1024
        self.memory_usage[point_name] = memory_mb
        
    def log_error(self, error_msg, phase=None):
        """Colleziona errori per il report finale"""
        self.errors.append({
            'time': time.time(),
            'phase': phase,
            'message': error_msg
        })
        
    def end(self):
        """Termina il tracking e genera il REPORT FINALE COMPLETO"""
        self.end_time = time.time()
        self.memory_usage['end'] = self.process.memory_info().rss / 1024 / 1024
        
        total_time = self.end_time - self.start_time
        memory_diff = self.memory_usage['end'] - self.memory_usage['start']
        
        # 🎯 UNICO LOG VISIBILE - REPORT FINALE COMPLETO
        logger.info("🎯" + "="*80)
        logger.info("🚀 HUNYUAN3D-2 MESH GENERATION - PERFORMANCE REPORT")
        logger.info("="*85)
        
        # Timing Summary
        logger.info("⏰ TIMING ANALYSIS")
        logger.info(f"   Total Processing Time: {total_time:.2f}s ({total_time/60:.1f} min)")
        
        # Detailed Phase Breakdown
        ai_generation_time = self.phase_times.get('mesh_generation_duration', 0)
        logger.info(f"   🤖 AI Generation Time: {ai_generation_time:.2f}s ({(ai_generation_time/total_time)*100:.1f}%)")
        
        # Memory Analysis
        logger.info("🧠 MEMORY ANALYSIS")
        logger.info(f"   Peak Memory Usage: {self.memory_usage['end']:.1f} MB")
        logger.info(f"   Memory Delta: {memory_diff:+.1f} MB")
        
        # Phase Performance (solo le fasi principali)
        logger.info("📊 PHASE BREAKDOWN")
        key_phases = ['image_download', 'mesh_generation', 'file_upload', 'output_analysis']
        for phase in key_phases:
            duration_key = f"{phase}_duration"
            if duration_key in self.phase_times:
                duration = self.phase_times[duration_key]
                percentage = (duration / total_time) * 100
                logger.info(f"   📋 {phase.replace('_', ' ').title()}: {duration:.2f}s ({percentage:.1f}%)")
                
        # Error Summary (se presenti)
        if self.errors:
            logger.info("⚠️ ISSUES ENCOUNTERED")
            for error in self.errors[-3:]:  # Solo ultimi 3 errori
                phase_info = f" [{error['phase']}]" if error['phase'] else ""
                logger.info(f"   ❌{phase_info}: {error['message']}")
        
        logger.info("="*85)
        
        return {
            'total_time': total_time,
            'ai_generation_time': ai_generation_time,
            'memory_start': self.memory_usage['start'],
            'memory_end': self.memory_usage['end'],
            'memory_delta': memory_diff,
            'phase_times': {k: v for k, v in self.phase_times.items() if k.endswith('_duration')},
            'error_count': len(self.errors)
        }

def analyze_mesh_file_silent(file_path):
    """Analizza il file mesh SILENZIOSAMENTE"""
    try:
        file_size = os.path.getsize(file_path)
        
        with open(file_path, 'r') as f:
            vertex_count = 0
            face_count = 0
            for line in f:
                if line.startswith('v '):
                    vertex_count += 1
                elif line.startswith('f '):
                    face_count += 1
        
        return {
            'file_size_bytes': file_size,
            'file_size_kb': file_size / 1024,
            'estimated_vertices': vertex_count,
            'estimated_faces': face_count,
            'complexity_score': vertex_count + face_count
        }
        
    except Exception as e:
        return {
            'file_size_bytes': os.path.getsize(file_path) if os.path.exists(file_path) else 0,
            'error': str(e)
        }

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_mesh_task_silent(self, job_id, slug, model_id="1", preprocess=False):
    """
    Task per generare mesh 3D con LOGGING SILENZIOSO - Solo report finale
    """
    task_id = self.request.id
    input_path = None
    
    # Inizializza tracker performance SILENZIOSO
    perf_tracker = SilentPerformanceTracker()
    perf_tracker.start()
    
    try:
        # ========== OPERAZIONI SILENZIOSO ==========
        perf_tracker.start_phase("job_retrieval")
        try:
            job = Job.objects.get(pk=job_id)
        except Job.DoesNotExist:
            error_msg = f"Job {job_id} non trovato"
            perf_tracker.log_error(error_msg, "job_retrieval")
            raise RuntimeError(error_msg)
        perf_tracker.end_phase("job_retrieval")

        perf_tracker.start_phase("status_update")
        job.status = "IN_PROGRESS"
        job.updated_at = timezone.now()
        job.save(update_fields=["status", "updated_at"])
        perf_tracker.end_phase("status_update")

        perf_tracker.start_phase("image_validation")
        if not job.image:
            error_msg = "Nessuna immagine associata al job"
            perf_tracker.log_error(error_msg, "image_validation")
            raise RuntimeError(error_msg)
        
        image_url = job.image.url
        try:
            head_resp = requests.head(image_url, timeout=10)
        except Exception as e:
            error_msg = f"URL immagine non raggiungibile: {str(e)}"
            perf_tracker.log_error(error_msg, "image_validation")
            raise RuntimeError(error_msg)
        perf_tracker.end_phase("image_validation")

        perf_tracker.start_phase("image_download")
        perf_tracker.track_memory("before_download")
        try:
            resp = requests.get(image_url, stream=True, timeout=30)
            resp.raise_for_status()
        except Exception as e:
            error_msg = f"Errore download: {str(e)}"
            perf_tracker.log_error(error_msg, "image_download")
            raise RuntimeError(error_msg)
        perf_tracker.track_memory("after_download")
        perf_tracker.end_phase("image_download")

        perf_tracker.start_phase("file_write")
        try:
            ext = os.path.splitext(job.image.name)[1] or ".png"
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_img:
                for chunk in resp.iter_content(8192):
                    if chunk:
                        tmp_img.write(chunk)
                input_path = tmp_img.name
            
            if not os.path.exists(input_path) or os.path.getsize(input_path) == 0:
                raise RuntimeError("File temporaneo non valido")
                
        except Exception as e:
            error_msg = f"Errore scrittura file: {str(e)}"
            perf_tracker.log_error(error_msg, "file_write")
            raise RuntimeError(error_msg)
        perf_tracker.end_phase("file_write")

        perf_tracker.start_phase("script_preparation")
        with tempfile.TemporaryDirectory() as tmp_dir:
            script = "/workspace/ThesisProject/3d-webgen/ai/meshGen.py"
            
            if not os.path.exists(script):
                error_msg = f"Script non trovato: {script}"
                perf_tracker.log_error(error_msg, "script_preparation")
                raise RuntimeError(error_msg)
            
            cmd = [
                "python3", script,
                "--model-id", model_id,
                "--image-path", input_path,
                "--output-dir", tmp_dir
            ]
            if preprocess:
                cmd.append("--preprocess")
            perf_tracker.end_phase("script_preparation")

            perf_tracker.start_phase("mesh_generation")
            perf_tracker.track_memory("before_generation")
            try:
                result = subprocess.run(
                    cmd, 
                    check=True, 
                    capture_output=True, 
                    text=True,
                    timeout=300
                )
            except subprocess.TimeoutExpired:
                error_msg = "Timeout esecuzione meshGen.py"
                perf_tracker.log_error(error_msg, "mesh_generation")
                raise RuntimeError(error_msg)
            except subprocess.CalledProcessError as e:
                error_msg = f"meshGen.py fallito: exit code {e.returncode}"
                perf_tracker.log_error(error_msg, "mesh_generation")
                raise RuntimeError(error_msg)
            perf_tracker.track_memory("after_generation")
            perf_tracker.end_phase("mesh_generation")

            perf_tracker.start_phase("output_analysis")
            try:
                all_files = os.listdir(tmp_dir)
                obj_files = [f for f in all_files if f.endswith(".obj")]
                
                if not obj_files:
                    error_msg = "Nessun file .obj generato"
                    perf_tracker.log_error(error_msg, "output_analysis")
                    raise RuntimeError(error_msg)
                
                latest_obj = sorted(obj_files)[-1]
                local_obj = os.path.join(tmp_dir, latest_obj)
                
                obj_size = os.path.getsize(local_obj)
                if obj_size == 0:
                    raise RuntimeError("File .obj vuoto")
                
                mesh_metrics = analyze_mesh_file_silent(local_obj)
                    
            except Exception as e:
                error_msg = f"Errore controllo output: {str(e)}"
                perf_tracker.log_error(error_msg, "output_analysis")
                raise RuntimeError(error_msg)
            perf_tracker.end_phase("output_analysis")

            perf_tracker.start_phase("file_upload")
            try:
                with open(local_obj, "rb") as f:
                    filename = f"results/{slug}_{job_id}_{latest_obj}"
                    job.result_file.save(filename, File(f), save=False)
            except Exception as e:
                error_msg = f"Errore upload: {str(e)}"
                perf_tracker.log_error(error_msg, "file_upload")
                raise RuntimeError(error_msg)
            perf_tracker.end_phase("file_upload")

            perf_tracker.start_phase("history_save")
            try:
                generated_model = GeneratedModel.objects.create(
                    user=job.user,
                    job=job,
                    model_name=slug,
                    input_image=job.image.url,
                    output_model=job.result_file.url,
                )
            except Exception as e:
                # Non bloccante per cronologia
                perf_tracker.log_error(f"Errore cronologia: {str(e)}", "history_save")
            perf_tracker.end_phase("history_save")

        perf_tracker.start_phase("job_completion")
        job.status = "COMPLETED"
        job.updated_at = timezone.now()
        job.save(update_fields=["result_file", "status", "updated_at"])
        perf_tracker.end_phase("job_completion")

        # ========== UNICO OUTPUT: PERFORMANCE FINALE ==========
        performance_stats = perf_tracker.end()

        # Log finale con metriche mesh
        logger.info("🔍 MESH QUALITY METRICS")
        logger.info(f"   📁 File Size: {mesh_metrics.get('file_size_kb', 0):.1f} KB")
        logger.info(f"   🔺 Vertices: {mesh_metrics.get('estimated_vertices', 0):,}")
        logger.info(f"   📐 Faces: {mesh_metrics.get('estimated_faces', 0):,}")
        logger.info(f"   🏆 Complexity Score: {mesh_metrics.get('complexity_score', 0):,}")
        if performance_stats.get('ai_generation_time', 0) > 0:
            efficiency = mesh_metrics.get('estimated_vertices', 0) / performance_stats['ai_generation_time']
            logger.info(f"   ⚡ Generation Efficiency: {efficiency:.0f} vertices/second")
        logger.info("🎉 TASK COMPLETED SUCCESSFULLY!")
        logger.info("🎯" + "="*80)

        return {
            'job_id': job_id,
            'status': 'COMPLETED',
            'result_url': job.result_file.url,
            'task_id': task_id,
            'performance': performance_stats,
            'mesh_metrics': mesh_metrics
        }

    except Exception as exc:
        # ========== ERROR HANDLING SILENZIOSO ==========
        perf_tracker.log_error(str(exc), "task_execution")
        
        # Solo questo log di errore sarà visibile
        logger.error("🎯" + "="*80)
        logger.error("❌ HUNYUAN3D-2 TASK FAILED")
        logger.error(f"   Task ID: {task_id}")
        logger.error(f"   Job ID: {job_id}")
        logger.error(f"   Error: {str(exc)}")
        logger.error(f"   Retry: {self.request.retries}/{self.max_retries}")
        
        # Performance fino al punto di errore
        try:
            error_stats = perf_tracker.end()
            logger.error(f"   Processing Time: {error_stats.get('total_time', 0):.2f}s")
            logger.error(f"   Memory Delta: {error_stats.get('memory_delta', 0):+.1f} MB")
        except:
            pass
        logger.error("🎯" + "="*80)

        # Aggiorna job
        try:
            job = Job.objects.get(pk=job_id)
            job.status = "FAILED"
            job.error_message = str(exc)
            job.updated_at = timezone.now()
            job.save(update_fields=["status", "error_message", "updated_at"])
        except:
            pass

        # Retry logic
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc, countdown=60)
        else:
            raise exc

    finally:
        # Pulizia SILENZ IOSA
        try:
            if input_path and os.path.exists(input_path):
                os.remove(input_path)
        except:
            pass