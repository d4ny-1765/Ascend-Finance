import time, json, re
from typing import List, Tuple
from huggingface_hub import InferenceClient
from schemas import UserProfile
from config import MODEL_ID, HF_TOKEN

MAX_CTX_CHARS = 3500
MAX_NEW_TOKENS = 256
TEMPERATURE = 0.2
TIMEOUT_SECS = 30
TOP_P = 0.9
REPETITION_PENALTY = 1.05

client = InferenceClient(token=HF_TOKEN, timeout=30)

_json_block = re.compile(r"\{[\s\S]*\}\s*$")

def _create_prompt(question: str, contexts: List[str], max_ctx_chars: int = MAX_CTX_CHARS) -> str:
    ctx = ("\n\n".join(contexts) if contexts else "")[:max_ctx_chars]
    system = (
        "You are a question-answering assistant that must use ONLY the provided context.\n"
        "If the answer cannot be found in the context, reply exactly: \"I don't know.\" "
        "Do NOT make up facts.\n"
    )
    instr = (
        "Guidelines:\n"
        "1) Keep outputs concise but clear.\n"
        "2) Cite phrases and include source tags/URLs when helpful.\n"
        "3) If the question asks for something not in the context, say: I don't know.\n"
        '4) Output valid JSON with keys: "greeting", "recommendations", "warnings", "as_of_year". '
        'Each recommendation = {"title","summary","steps","considerations","citations"}.\n'
    )
    return f"{system}\n{instr}\nQuestion:\n{question}\n\nContext:\n{ctx}\n\nAnswer (JSON only):"

def _build_question(p: UserProfile) -> str:
    opts = ", ".join([o.value for o in p.form.benefits.employer_plan_options]) or "none provided"
    concerns = ", ".join([c.value for c in p.quiz.top_concerns]) or "unspecified"
    return (
        "Create a personalized plan based ONLY on the provided context and the user profile:\n"
        f"- Name: {p.name}\n"
        f"- Age: {p.age}\n"
        f"- Salary: ${p.salary:,.0f}\n"
        f"- State: {p.quiz.state}\n"
        f"- Employment tenure: {p.quiz.employment_tenure}\n"
        f"- Marital status: {p.quiz.marital_status}\n"
        f"- Help type: {p.help_type}\n"
        f"- Top concerns: {concerns}\n"
        f"- Employer plan options: {opts}\n"
        f"- Employer match %: {p.form.benefits.employer_match_percent or 'N/A'}\n"
        f"- Contributing now: {p.form.benefits.contributing_now}\n"
        f"- Monthly take-home: ${p.form.cashflow.monthly_take_home_pay or 'N/A'}\n"
        f"- Monthly expenses: ${p.form.cashflow.monthly_expenses or 'N/A'}\n"
        f"- Current savings: ${p.form.cashflow.current_savings or 'N/A'}\n"
        f"- Savings goal: {p.form.savings_goal.what_are_you_saving_for or 'N/A'} "
        f"target ${p.form.savings_goal.target_amount or 'N/A'} in "
        f"{p.form.savings_goal.timeline_months or 'N/A'} months\n"
        "Explain options (401k/Roth/HSA if present), contribution limits, match strategy, and actionable steps. "
        "If facts are not in the context, answer: I don't know."
    )

def _retrieve_contexts(retriever, p: UserProfile, k_each: int = 2, k_total: int = 8):
    queries = []
    if p.help_type.value.startswith("employer"):
        queries += ["401(k) basics fees match", "Roth 401(k) vs Traditional 401(k)", "auto-enrollment target-date funds"]
    if any(o.value.lower() in ("hsa", "fsa") for o in p.form.benefits.employer_plan_options):
        queries += ["HSA eligibility HDHP tax benefits vs FSA"]
    if p.form.savings_goal.what_are_you_saving_for:
        queries += ["saving plan contribution priority emergency fund rule of thumb"]

    contexts, sources, seen = [], [], set()
    for q in (queries[:4] or ["retirement plan basics"]):
        docs = retriever.invoke(q) if hasattr(retriever, "invoke") else retriever.similarity_search(q, k=k_each)
        for d in docs:
            s = (getattr(d, "metadata", None) or {}).get("source", "")
            key = (s, (getattr(d, "page_content", "") or "")[:120])
            if key in seen: 
                continue
            seen.add(key)
            contexts.append(getattr(d, "page_content", "") or "")
            sources.append(s)
            if len(contexts) >= k_total: break
        if len(contexts) >= k_total: break
    return contexts, sources

def _call_chat(prompt: str) -> str:
    messages = [
        {"role": "system", "content": "Follow the user-provided prompt exactly."},
        {"role": "user", "content": prompt},
    ]
    resp = client.chat.completions.create(
        model=MODEL_ID,               
        messages=messages,
        max_tokens=256,
        temperature=0.2,
    )
    return (resp.choices[0].message.content or "").strip()

def _call_text(prompt: str) -> str:
    return client.text_generation(
        prompt,
        model=MODEL_ID,                
        max_new_tokens=256,
        temperature=0.2,
        top_p=0.9,
        repetition_penalty=1.05,
        return_full_text=False,
        stream=False,                  
    ) or ""

def generate_plan(retriever, p: UserProfile):
    t0 = time.perf_counter()
    contexts, sources = _retrieve_contexts(retriever, p)
    t1 = time.perf_counter()
    prompt = _create_prompt(_build_question(p), contexts)

    try:
        text = (_call_chat(prompt) or "").strip()
        if not text:
            text = (_call_text(prompt) or "").strip()
        llm_ok = True
    except Exception as e1:
        # Try the other path if the first failed
        try:
            text = (_call_text(prompt) or "").strip()
            llm_ok = True
        except Exception as e2:
            t_err = time.perf_counter()
            return {
                "error": f"LLM call failed: {type(e2).__name__}: {e2}",
                "timing": {
                    "retrieve_s": round(t1 - t0, 2),
                    "llm_s": round(t_err - t1, 2),
                    "total_s": round(t_err - t0, 2),
                },
                "model": MODEL_ID,
                "chunks_used": len(contexts),
                "sources": list({s for s in sources if s}),
            }

    t2 = time.perf_counter()

    m = _json_block.search(text)
    if m:
        text = m.group(0)

    try:
        data = json.loads(text)
    except Exception:
        data = {
            "greeting": f"Hi {p.name}, here’s your personalized plan.",
            "recommendations": [{
                "title": "Plan Overview",
                "summary": text[:1200],
                "steps": [],
                "considerations": [],
                "citations": list({s for s in sources if s}),
            }],
            "warnings": [],
            "as_of_year": None,
        }

    return data