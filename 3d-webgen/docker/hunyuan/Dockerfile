FROM matteopostiferi/hunyuan-base:latest
COPY ai ./ai
COPY docker/hunyuan/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt
CMD ["python3", "ai/meshGen.py"]
