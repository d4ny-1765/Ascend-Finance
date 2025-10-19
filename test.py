import os, json
from pathlib import Path
from vectorstore import load_vectordb
from rag import generate_plan
from schemas import UserProfile
from config import TOP_K

def main():
    sample_path = Path("sample_json")
    with sample_path.open("r", encoding="utf-8") as f:
        payload = json.load(f)
    profile = UserProfile.model_validate(payload)

    db = load_vectordb()
    retriever = db.as_retriever(search_kwargs={"k": TOP_K})

    result = generate_plan(retriever, profile)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    assert os.getenv("HUGGINGFACEHUB_API_TOKEN"), "Set HUGGINGFACEHUB_API_TOKEN in your environment."
    main()