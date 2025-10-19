# import os
# from dotenv import load_dotenv, find_dotenv, dotenv_values

# path = find_dotenv()
# print("find_dotenv() ->", path or "<none>")
# print("python-dotenv installed? ->", bool(load_dotenv))

# # Try loading it
# loaded = load_dotenv(path, override=True)
# print("load_dotenv() returned ->", loaded)

# # Show what python-dotenv *would* parse from that file
# print("dotenv_values has token? ->", "HUGGINGFACEHUB_API_TOKEN" in dotenv_values(path))

# # Show what the process actually has after load_dotenv
# print("os.getenv token present? ->", bool(os.getenv("HUGGINGFACEHUB_API_TOKEN")))
# print("MODEL_ID ->", os.getenv("MODEL_ID"))

# import os
# from dotenv import load_dotenv, find_dotenv
# from huggingface_hub import InferenceClient, whoami

# load_dotenv(find_dotenv(), override=True)

# tok = os.getenv("HUGGINGFACEHUB_API_TOKEN")
# print("Token length:", len(tok) if tok else None)

# # whoami with explicit token (avoids “no cached login” error)
# print("whoami:", whoami(token=tok))

# # simple generation
# client = InferenceClient(token=tok, timeout=20)
# out = client.text_generation(
#     'Reply with JSON only: {"ok":',
#     model=os.getenv("MODEL_ID", "google/gemma-2-2b-it"),
#     max_new_tokens=24,
#     return_full_text=False,
#     stream=False
# )
# print("gen ok?", bool(out.strip()))

import os
from dotenv import load_dotenv, find_dotenv
from huggingface_hub import InferenceClient, whoami

load_dotenv(find_dotenv(), override=True)
tok = os.getenv("HUGGINGFACEHUB_API_TOKEN")
model = os.getenv("MODEL_ID", "Qwen/Qwen2.5-1.5B-Instruct")
print("MODEL_ID:", model)
print("whoami:", whoami(token=tok))

c = InferenceClient(token=tok, timeout=20)

# CHAT first
try:
    r = c.chat.completions.create(
        model=model,
        messages=[{"role":"user","content":"Reply with JSON only: {\"ok\": true}"}],
        max_tokens=32, temperature=0.2,
    )
    print("chat ok:", bool((r.choices[0].message.content or "").strip()))
except Exception as e:
    print("chat failed:", type(e).__name__, e)

# TEXT fallback
try:
    t = c.text_generation(
        'Reply with JSON only: {"ok":',
        model=model,
        max_new_tokens=24,
        return_full_text=False,
        stream=False,
    )
    print("text ok:", bool((t or "").strip()))
except Exception as e:
    print("text failed:", type(e).__name__, e)