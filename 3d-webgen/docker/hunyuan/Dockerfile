FROM matteopostiferi/hunyuan-base:latest

COPY docker/hunyuan/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

# Fase finale: solo codice
COPY ai ./ai

CMD ["python3", "ai/meshGen.py"]
