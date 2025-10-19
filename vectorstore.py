from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from config import CHROMA_DIR

def load_vectordb():
    embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    db = Chroma(embedding_function=embedding, persist_directory=CHROMA_DIR)
    return db