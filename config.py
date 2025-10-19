import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv()) 

MODEL_ID = os.getenv("MODEL_ID", "meta-llama/Llama-3.1-8B-Instruct")
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")
CHROMA_DIR = os.getenv("CHROMA_DIR", "chroma_db")  
TOP_K = int(os.getenv("TOP_K", "4"))