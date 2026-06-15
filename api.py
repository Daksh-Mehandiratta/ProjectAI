# api.py — Flask REST API with Groq LLM + Auth + Live Web Search + Spam Detector
# Run: python api.py
# Requires: pip install flask flask-cors openai python-dotenv joblib duckduckgo-search

import os
import json
import hashlib
import secrets
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import joblib

# ── Simple file-based user store ───────────────────────────────────────────────
USERS_FILE  = "users.json"
TOKENS_FILE = "tokens.json"

def _load(path):
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {}

def _save(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def get_user_by_token(token):
    tokens = _load(TOKENS_FILE)
    email  = tokens.get(token)
    if not email:
        return None
    users = _load(USERS_FILE)
    return users.get(email)

# ── Load environment variables from .env ───────────────────────────────────────
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL   = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
FLASK_PORT   = int(os.getenv("FLASK_PORT", 5000))
FLASK_DEBUG  = os.getenv("FLASK_DEBUG", "true").lower() == "true"

if not GROQ_API_KEY:
    raise EnvironmentError(
        "❌ GROQ_API_KEY not found.\n"
        "   Add it to your .env file: GROQ_API_KEY=gsk_..."
    )

# ── Flask app ──────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ── Groq client (OpenAI-compatible) ───────────────────────────────────────────
client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

# ── DuckDuckGo web search (free, no API key) ───────────────────────────────────
def web_search(query: str, max_results: int = 5) -> str:
    """Search the web and return a formatted string of results."""
    try:
        from duckduckgo_search import DDGS
        results = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results):
                results.append(
                    f"• **{r['title']}**\n  {r['body']}\n  Source: {r['href']}"
                )
        if not results:
            return "No web results found."
        return "\n\n".join(results)
    except Exception as e:
        return f"Web search failed: {str(e)}"

# ── Spam model (optional — loads if files exist) ───────────────────────────────
MODEL_PATH      = "model/spam_model.pkl"
VECTORIZER_PATH = "model/vectorizer.pkl"

spam_model      = None
spam_vectorizer = None

if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
    spam_model      = joblib.load(MODEL_PATH)
    spam_vectorizer = joblib.load(VECTORIZER_PATH)
    print("✅ Spam model loaded.")
else:
    print("⚠️  Spam model not found. /predict endpoint disabled.")


# ── Auth: Register ─────────────────────────────────────────────────────────────
@app.route("/register", methods=["POST"])
def register():
    data     = request.get_json(force=True)
    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    users = _load(USERS_FILE)
    if email in users:
        return jsonify({"error": "An account with this email already exists."}), 409

    users[email] = {
        "name":     name,
        "email":    email,
        "password": hash_password(password),
        "created":  datetime.now().isoformat(),
        "initials": "".join(w[0].upper() for w in name.split()[:2]),
    }
    _save(USERS_FILE, users)

    # Issue token
    token  = secrets.token_hex(32)
    tokens = _load(TOKENS_FILE)
    tokens[token] = email
    _save(TOKENS_FILE, tokens)

    user = users[email].copy()
    user.pop("password")
    return jsonify({"token": token, "user": user}), 201


# ── Auth: Login ────────────────────────────────────────────────────────────────
@app.route("/login", methods=["POST"])
def login():
    data     = request.get_json(force=True)
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    users = _load(USERS_FILE)
    user  = users.get(email)

    if not user or user["password"] != hash_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    token  = secrets.token_hex(32)
    tokens = _load(TOKENS_FILE)
    tokens[token] = email
    _save(TOKENS_FILE, tokens)

    safe_user = {k: v for k, v in user.items() if k != "password"}
    return jsonify({"token": token, "user": safe_user})


# ── Auth: Get current user ─────────────────────────────────────────────────────
@app.route("/me", methods=["GET"])
def me():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user  = get_user_by_token(token)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    safe_user = {k: v for k, v in user.items() if k != "password"}
    return jsonify({"user": safe_user})


# ── Auth: Google OAuth ─────────────────────────────────────────────────────────
import base64

@app.route("/auth/google", methods=["POST"])
def auth_google():
    """
    Accepts a Google JWT credential from the frontend (Google Identity Services).
    Decodes the payload, creates or retrieves the user, and returns a session token.
    """
    data       = request.get_json(force=True)
    credential = data.get("credential", "")

    if not credential:
        return jsonify({"error": "No Google credential provided."}), 400

    try:
        # Google JWT: header.payload.signature  (base64url encoded)
        payload_b64 = credential.split(".")[1]
        # Add padding if needed
        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += "=" * padding
        payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode("utf-8"))

        email    = payload.get("email", "").lower()
        name     = payload.get("name", email.split("@")[0].title())
        picture  = payload.get("picture", "")
        google_id = payload.get("sub", "")

        if not email:
            return jsonify({"error": "Could not extract email from Google token."}), 400

        # Create or update user
        users = _load(USERS_FILE)
        if email not in users:
            users[email] = {
                "name":     name,
                "email":    email,
                "password": None,          # Google users have no password
                "google":   True,
                "picture":  picture,
                "created":  datetime.now().isoformat(),
                "initials": "".join(w[0].upper() for w in name.split()[:2]),
            }
        else:
            # Update picture if changed
            users[email]["picture"] = picture
        _save(USERS_FILE, users)

        token  = secrets.token_hex(32)
        tokens = _load(TOKENS_FILE)
        tokens[token] = email
        _save(TOKENS_FILE, tokens)

        safe_user = {k: v for k, v in users[email].items() if k != "password"}
        return jsonify({"token": token, "user": safe_user})

    except Exception as e:
        return jsonify({"error": f"Google auth failed: {str(e)}"}), 400

@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "provider": "Groq (Free)",
        "web_search": "DuckDuckGo (Free)",
        "models": {
            "chat": GROQ_MODEL,
            "spam": "Naïve Bayes + TF-IDF" if spam_model else "not loaded",
        }
    })


# ── Chat endpoint (Groq + optional web search) ─────────────────────────────────
@app.route("/chat", methods=["POST"])
def chat():
    """
    Body: {
      "messages": [{ "role": "user"|"assistant", "content": "..." }, ...],
      "model":     "llama-3.3-70b-versatile"  (optional),
      "webSearch": true                         (optional — enables live search)
    }
    """
    data       = request.get_json(force=True)
    messages   = data.get("messages", [])
    model      = data.get("model", GROQ_MODEL)
    web_search_enabled = data.get("webSearch", False)

    if not messages:
        return jsonify({"error": "No messages provided."}), 400

    # ── Current date/time ──────────────────────────────────────────────────────
    now          = datetime.now()
    current_date = now.strftime("%A, %B %d, %Y")
    current_time = now.strftime("%I:%M %p")

    # ── Optional: live web search ──────────────────────────────────────────────
    search_context = ""
    search_query   = ""
    if web_search_enabled:
        # Use the last user message as the search query
        last_user_msg = next(
            (m["content"] for m in reversed(messages) if m["role"] == "user"), ""
        )
        search_query   = last_user_msg[:200]
        search_results = web_search(search_query)
        search_context = (
            f"\n\n---\n**Live Web Search Results** (for: \"{search_query}\"):\n\n"
            f"{search_results}\n---\n"
            f"Use the above search results to answer accurately. "
            f"Cite sources where relevant."
        )

    # ── System prompt ──────────────────────────────────────────────────────────
    system_content = (
        f"You are a helpful, friendly, and knowledgeable AI assistant inside Project-AI. "
        f"Today's date is {current_date} and the current time is {current_time}. "
        f"Always use this date when the user asks about today, current events, or time. "
        f"You can help with coding, writing, analysis, math, news, and creative tasks. "
        f"Keep responses clear and well-structured. Use markdown formatting when helpful."
        f"{search_context}"
    )

    system_prompt = {"role": "system", "content": system_content}

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[system_prompt] + messages,
            temperature=0.7,
            max_tokens=2048,
        )
        reply = response.choices[0].message.content
        usage = {
            "prompt_tokens":     response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens":      response.usage.total_tokens,
        }
        return jsonify({
            "reply":       reply,
            "model":       model,
            "usage":       usage,
            "webSearched": web_search_enabled,
            "searchQuery": search_query,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Spam Detector endpoint ─────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    if spam_model is None:
        return jsonify({"error": "Spam model not loaded. Run train_model.py first."}), 503

    data    = request.get_json(force=True)
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"error": "Message cannot be empty."}), 400

    vec        = spam_vectorizer.transform([message])
    prediction = spam_model.predict(vec)[0]
    proba      = spam_model.predict_proba(vec)[0]
    label      = "spam" if prediction == 1 else "ham"
    confidence = round(float(max(proba)) * 100, 1)

    return jsonify({
        "message":    message,
        "label":      label,
        "confidence": confidence,
        "is_spam":    bool(prediction == 1),
    })


# ── Run ────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"🚀 Project-AI API     →  http://localhost:{FLASK_PORT}")
    print(f"   🤖 Provider      →  Groq (Free)")
    print(f"   🧠 Model         →  {GROQ_MODEL}")
    print(f"   🔍 Web Search    →  DuckDuckGo (Free, no API key)")
    print(f"   🔑 API key       →  {GROQ_API_KEY[:12]}...{GROQ_API_KEY[-4:]} (from .env)")
    print()
    print("   POST /chat        →  Groq LLM + optional live web search")
    print("   POST /register    →  Create account")
    print("   POST /login       →  Email login")
    print("   POST /auth/google →  Google OAuth")
    print("   POST /predict     →  Spam classifier")
    app.run(debug=FLASK_DEBUG, port=FLASK_PORT)
