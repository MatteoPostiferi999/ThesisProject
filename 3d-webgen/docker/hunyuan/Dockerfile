# Usa l'immagine base già corretta con PyMeshLab funzionante
FROM matteopostiferi/hunyuan-base:latest

# Imposta la working directory
WORKDIR /workspace

# Installa le dipendenze Python specifiche del progetto (se presenti)
COPY docker/hunyuan/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

# Copia il codice sorgente
COPY ai ./ai

# Comando di default all'avvio del container
CMD ["python3", "-u", "ai/meshGen.py"]
