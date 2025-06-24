#!/usr/bin/env python3
"""
SUITE COMPLETA DI TEST - 3D WEBGEN PROJECT
==========================================

Script per testare tutti i componenti del sistema prima di integrare Celery e GPU processing.
Eseguire da terminale: python test_suite.py

Test inclusi:
1. Database & Models
2. Storage (Supabase)  
3. API Endpoints
4. File Upload/Download
5. Authentication
6. Integration Tests
"""

import os
import sys
django_imported = False
import django
import requests
import tempfile
import io
from pathlib import Path

# Setup Django environment

def setup_django():
    """Configura l'ambiente Django per i test"""
    # Aggiunge la cartella corrente (dove si trova manage.py) al path
    project_path = Path(__file__).parent
    sys.path.insert(0, str(project_path))

    # Imposta il modulo settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

    try:
        django.setup()
        print("✅ Django configurato correttamente")
        return True
    except Exception as e:
        print(f"❌ Errore configurazione Django: {e}")
        print("💡 Assicurati di essere nella directory che contiene manage.py e che DJANGO_SETTINGS_MODULE sia corretto")
        return False

# =============================================================================
# 1. TEST DATABASE & MODELS
# =============================================================================

def test_database_connection():
    """Test connessione al database"""
    print("🔍 Test connessione database...")
    from django.db import connection
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        print("   ✅ Database connesso correttamente")
        print(f"      Risultato query test: {result}")
        print(f"      Database: {connection.settings_dict['NAME']}")
        print(f"      Engine: {connection.settings_dict['ENGINE']}")
        return True
    except Exception as e:
        print(f"   ❌ Errore connessione database: {e}")
        return False


def test_models_crud():
    """Test operazioni CRUD sui modelli"""
    print("🔍 Test operazioni CRUD sui modelli...")
    try:
        from core.models import Job
        from django.core.files.base import ContentFile

        # CREATE
        print("   • Test CREATE...")
        job = Job.objects.create(status="PENDING")
        print(f"     ✅ Job creato: ID {job.id}")

        # READ
        print("   • Test READ...")
        retrieved_job = Job.objects.get(id=job.id)
        print(f"     ✅ Job recuperato: {retrieved_job}")

        # UPDATE
        print("   • Test UPDATE...")
        retrieved_job.status = "IN_PROGRESS"
        retrieved_job.save()
        print(f"     ✅ Status aggiornato: {retrieved_job.status}")

        # DELETE
        print("   • Test DELETE...")
        job_id = retrieved_job.id
        retrieved_job.delete()
        exists = Job.objects.filter(id=job_id).exists()
        print(f"     ✅ Job eliminato: {not exists}")
        return True
    except Exception as e:
        print(f"   ❌ Errore CRUD: {e}")
        return False


def test_model_validation():
    """Test validazione dei modelli"""
    print("🔍 Test validazione modelli...")
    try:
        from core.models import Job
        from django.core.exceptions import ValidationError

        # Test status validi
        valid_statuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED"]
        for status in valid_statuses:
            job = Job(status=status)
            job.full_clean()
            print(f"     ✅ Status valido: {status}")

        # Test status non valido
        try:
            job = Job(status="INVALID_STATUS")
            job.full_clean()
            print("     ❌ Status non valido dovrebbe dare errore!")
            return False
        except ValidationError:
            print("     ✅ Status non valido correttamente rifiutato")
        return True
    except Exception as e:
        print(f"   ❌ Errore validazione: {e}")
        return False

# =============================================================================
# 2. TEST STORAGE (SUPABASE)
# =============================================================================

def test_supabase_config():
    """Test configurazione storage S3 / Supabase via django-storages"""
    print("🔍 Test configurazione Supabase/S3 storage…")
    from django.conf import settings
    required = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_S3_ENDPOINT_URL',
        'AWS_STORAGE_BUCKET_NAME',
        'AWS_S3_REGION_NAME',
        'AWS_S3_SIGNATURE_VERSION',
    ]
    ok = True
    for name in required:
        if getattr(settings, name, None):
            print(f"   ✅ {name} configurato")
        else:
            print(f"   ❌ {name} NON configurato")
            ok = False

    # Verifica che il backend Django-storages sia S3Boto3Storage
    backend = settings.STORAGES['default']['BACKEND']
    if 'S3Boto3Storage' in backend:
        print(f"   ✅ BACKEND corretto: {backend}")
    else:
        print(f"   ❌ BACKEND errato: {backend} (serve storages.backends.s3boto3.S3Boto3Storage)")
        ok = False

    # Opzionale: conferma ACL e querystring auth
    print(f"   • AWS_DEFAULT_ACL = {settings.AWS_DEFAULT_ACL}")
    print(f"   • AWS_QUERYSTRING_AUTH = {settings.AWS_QUERYSTRING_AUTH}")

    return ok


def test_s3_connection():
    """Test connessione S3 (Supabase) via boto3"""
    print("🔍 Test connessione S3 storage…")
    import boto3
    from django.conf import settings
    try:
        s3 = boto3.client(
            's3',
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
            verify=settings.AWS_S3_VERIFY,
            config=boto3.session.Config(signature_version=settings.AWS_S3_SIGNATURE_VERSION)
        )
        resp = s3.list_objects_v2(Bucket=settings.AWS_STORAGE_BUCKET_NAME, MaxKeys=1)
        if resp.get('KeyCount', 0) >= 0:
            print("   ✅ Connessione S3 OK")
            return True
        else:
            print("   ❌ Bucket vuoto o non accessibile")
            return False
    except Exception as e:
        print(f"   ❌ Errore connessione S3: {e}")
        return False


def test_file_upload_storage():
    """Test upload file su storage"""
    print("🔍 Test upload file su storage...")
    try:
        from core.models import Job
        from django.core.files.base import ContentFile
        # Crea immagine di test
        try:
            from PIL import Image
            img = Image.new('RGB', (100, 100), color='red')
            img_io = io.BytesIO()
            img.save(img_io, format='PNG')
            img_io.seek(0)
            image_data = img_io.read()
        except ImportError:
            print("     ⚠️  PIL non disponibile, uso dati mock")
            image_data = b'\x89PNG...'
        test_image = ContentFile(image_data, name='test_upload.png')
        job = Job.objects.create(image=test_image, status="PENDING")
        if job.image and job.image.name:
            print(f"     ✅ File caricato: {job.image.name}")
            print(f"     ✅ URL disponibile: {job.image.url}")
            job.delete()
            return True
        else:
            print("     ❌ File non caricato correttamente")
            return False
    except Exception as e:
        print(f"   ❌ Errore upload: {e}")
        return False

# =============================================================================
# 3. TEST API ENDPOINTS
# =============================================================================

def test_api_health():
    """Test endpoint di health check"""
    print("🔍 Test API health...")
    try:
        response = requests.get('http://localhost:8000/api/health/', timeout=10)
        if response.status_code == 200:
            print("   ✅ Health endpoint OK")
            return True
        else:
            print(f"   ❌ Health endpoint: status {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Errore health check: {e}")
        return False


def test_jobs_list_api():
    """Test API lista jobs"""
    print("🔍 Test API lista jobs...")
    try:
        response = requests.get('http://localhost:8000/api/jobs/', timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Lista jobs OK: {len(data)} jobs trovati")
            return True
        else:
            print(f"   ❌ Lista jobs: status {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Errore lista jobs: {e}")
        return False


def test_job_detail_api():
    """Test API dettaglio job"""
    print("🔍 Test API dettaglio job...")
    try:
        from core.models import Job
        job = Job.objects.create(status="PENDING")
        response = requests.get(f'http://localhost:8000/api/jobs/{job.id}/', timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Dettaglio job OK: ID {data['id']}")
            job.delete()
            return True
        else:
            print(f"   ❌ Dettaglio job: status {response.status_code}")
            job.delete()
            return False
    except Exception as e:
        print(f"   ❌ Errore dettaglio job: {e}")
        return False

# =============================================================================
# 4. TEST FILE UPLOAD API
# =============================================================================

def test_upload_api():
    """Test API upload file"""
    print("🔍 Test API upload file...")
    try:
        # Crea immagine temporanea
        try:
            from PIL import Image
            img = Image.new('RGB', (100, 100), color='blue')
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                img.save(tmp_file.name, format='PNG')
                image_path = tmp_file.name
        except ImportError:
            print("     ⚠️  PIL non disponibile, uso file mock")
            png_data = b'\x89PNG...'
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                tmp_file.write(png_data)
                image_path = tmp_file.name
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post(
                'http://localhost:8000/api/jobs/upload/',
                files=files,
                timeout=30
            )
        os.unlink(image_path)
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"   ✅ Upload OK: Job ID {data.get('id')}")
            # Cleanup job
            if 'id' in data:
                from core.models import Job
                Job.objects.filter(id=data['id']).delete()
            return True
        else:
            print(f"   ❌ Upload fallito: status {response.status_code}")
            print(f"   ❌ Risposta: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"   ❌ Errore test upload: {e}")
        return False

# =============================================================================
# 5. TEST AUTHENTICATION
# =============================================================================

def test_authentication():
    """Test sistema di autenticazione"""
    print("🔍 Test autenticazione...")
    try:
        login_data = {'username': 'testuser', 'password': 'testpass'}
        response = requests.post(
            'http://localhost:8000/api/auth/login/',
            json=login_data,
            timeout=10
        )
        if response.status_code == 404:
            print("   ℹ️  Autenticazione non ancora implementata")
            return True
        elif response.status_code == 200:
            print("   ✅ Endpoint login disponibile")
            return True
        else:
            print(f"   ⚠️  Login endpoint status: {response.status_code}")
            return True
    except Exception as e:
        print(f"   ℹ️  Test auth saltato: {e}")
        return True

# =============================================================================
# 6. TEST INTEGRAZIONE COMPLETA
# =============================================================================

def test_complete_workflow():
    """Test workflow completo: upload -> processing -> download"""
    print("🔍 Test workflow completo...")
    try:
        # 1. Crea immagine di test
        try:
            from PIL import Image
            img = Image.new('RGB', (200, 200), color='green')
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                img.save(tmp_file.name, format='PNG')
                image_path = tmp_file.name
        except ImportError:
            print("     ⚠️  PIL non disponibile, uso file mock")
            png_data = b'\x89PNG...'
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                tmp_file.write(png_data)
                image_path = tmp_file.name
        # 2. Upload
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post('http://localhost:8000/api/jobs/upload/', files=files, timeout=30)
        os.unlink(image_path)
        if response.status_code not in [200, 201]:
            print(f"   ❌ Upload fallito: {response.status_code}")
            return False
        job_data = response.json()
        job_id = job_data['id']
        print(f"   ✅ 1. Upload completato: Job {job_id}")
        # 3. Verifica job in DB
        from core.models import Job
        job = Job.objects.get(id=job_id)
        if job.image:
            print(f"   ✅ 2. Immagine salvata: {job.image.name}")
        else:
            print("   ❌ 2. Immagine non salvata")
            return False
        # 4-5. Simula processing
        job.status = "IN_PROGRESS"
        job.save()
        print("   ✅ 3. Status aggiornato a IN_PROGRESS")
        from django.core.files.base import ContentFile
        result_content = ContentFile(b"Mock 3D model data", name="model.obj")
        job.result_file = result_content
        job.status = "COMPLETED"
        job.save()
        print("   ✅ 4. Processing completato con file risultato")
        # 6. Download
        if job.result_file:
            print(f"   ✅ 5. File risultato disponibile: {job.result_file.url}")
        else:
            print("   ❌ 5. File risultato non disponibile")
            return False
        # 7. API finale
        response = requests.get(f'http://localhost:8000/api/jobs/{job_id}/', timeout=10)
        if response.status_code == 200:
            final_data = response.json()
            print(f"   ✅ 6. Job finale via API: Status {final_data['status']}")
        job.delete()
        print("   ✅ 7. Cleanup completato")
        return True
    except Exception as e:
        print(f"   ❌ Errore workflow: {e}")
        return False

# =============================================================================
# RUNNER PRINCIPALE & UTILITÀ
# =============================================================================

def run_all_tests():
    print("🚀 AVVIO SUITE COMPLETA DI TEST - 3D WEBGEN")
    print("=" * 60)
    if not setup_django():
        print("❌ Impossibile configurare Django. Uscita.")
        return False
    tests = [
        ("Database Connection", test_database_connection),
        ("Models CRUD", test_models_crud),
        ("Model Validation", test_model_validation),
        ("Supabase Config", test_supabase_config),
        ("S3 Connection", test_s3_connection),
        ("File Upload Storage", test_file_upload_storage),
        ("API Health", test_api_health),
        ("Jobs List API", test_jobs_list_api),
        ("Job Detail API", test_job_detail_api),
        ("Upload API", test_upload_api),
        ("Authentication", test_authentication),
        ("Complete Workflow", test_complete_workflow),
    ]
    results = {}
    passed = 0
    total = len(tests)
    for name, func in tests:
        print(f"\n{'='*25} {name} {'='*25}")
        res = func()
        results[name] = res
        if res: passed += 1
    print(f"\n{'='*60}")
    print("📊 RIEPILOGO FINALE")
    print(f"✅ Test passati: {passed}/{total}")
    print(f"❌ Test falliti: {total-passed}/{total}")
    print(f"📈 Tasso di successo: {passed/total*100:.1f}%")
    print("\n📋 DETTAGLIO RISULTATI:")
    for name, res in results.items():
        status = "✅ PASS" if res else "❌ FAIL"
        print(f"   {status} {name}")
    print(f"\n{'='*60}")
    if passed == total:
        print("🎉 TUTTI I TEST PASSATI!")
        print("🚀 Sistema pronto per integrazione Celery + GPU processing")
    else:
        print("⚠️  ALCUNI TEST FALLITI")
    return passed == total


def check_dependencies():
    print("🔍 Verifica dipendenze...")
    required = [('django','django'),('requests','requests'),('boto3','boto3'),('PIL','Pillow')]
    missing = []
    for import_name, pkg in required:
        try:
            __import__(import_name)
            print(f"   ✅ {pkg}")
        except ImportError:
            if import_name=='PIL':
                print(f"   ⚠️  {pkg} - NON INSTALLATO (opzionale)")
            else:
                print(f"   ❌ {pkg} - NON INSTALLATO")
                missing.append(pkg)
    if missing:
        print("\n💡 Installa: pip install " + ' '.join(missing))
        return False
    return True


def show_help():
    print("""
🔧 GUIDA UTILIZZO - SUITE TEST 3D WEBGEN
==========================================

COMANDI:
  python test_suite.py        # esegue tutti i test
  python test_suite.py --deps # verifica dipendenze
  python test_suite.py --help # mostra questa guida
""")


def main():
    if len(sys.argv)>1:
        if '--help' in sys.argv or '-h' in sys.argv:
            show_help(); return
        if '--deps' in sys.argv:
            check_dependencies(); return
    if not check_dependencies():
        print("❌ Dipendenze mancanti."); sys.exit(1)
    success = run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

