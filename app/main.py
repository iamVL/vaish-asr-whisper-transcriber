from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select
from jose import jwt, JWTError

from .config import settings
from .database import Base, engine, get_db
from . import models, schemas
from .auth import hash_password, verify_password, create_access_token

# ---- ASR imports & helpers ----
import os, uuid, shutil, json
from faster_whisper import WhisperModel

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Voice App Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Load ASR model once ----
# CPU, int8 is small/fast. First run downloads the model weights.
whisper_model = WhisperModel("base", device="cpu", compute_type="int8")

# ---- JWT helper: get current user from Authorization header ----
def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.get(models.User, int(sub))
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---- Basic routes (as before) ----
@app.get("/health")
def health():
    return {"ok": True}

@app.post("/auth/signup", status_code=201)
def signup(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.execute(
        select(models.User).where(
            (models.User.username == payload.username) | (models.User.email == payload.email)
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    user = models.User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "username": user.username, "email": user.email}

@app.post("/auth/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.execute(
        select(models.User).where(models.User.username == payload.username)
    ).scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    token = create_access_token({"sub": str(user.id), "username": user.username})
    return {"access_token": token, "token_type": "bearer"}

# ---- Upload + Transcribe (word-level) ----
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    # 1) Save file
    ext = os.path.splitext(file.filename or "")[1] or ".webm"
    fname = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.normpath(os.path.join(UPLOAD_DIR, fname))
    with open(dest_path, "wb") as out:
        shutil.copyfileobj(file.file, out)

    # 2) ASR with word timestamps
    # FORCE ENGLISH + add a few stability flags
    segments, info = whisper_model.transcribe(
        dest_path,
        language="en",                 # lock language to English
        task="transcribe",             # do not translate
        word_timestamps=True,          # keep word-level timings
        vad_filter=True,               # trim long silences/breaths
        condition_on_previous_text=False,  # reduces drift on short clips
        beam_size=5,                   # a bit more stable decoding
    )

    words = []
    texts = []
    for seg in segments:
        if seg.text:
            texts.append(seg.text)
        if seg.words:
            for w in seg.words:
                words.append({"word": w.word, "start": float(w.start), "end": float(w.end)})

    text = "".join(texts).strip()

    # 3) Persist to DB
    item = models.Transcript(
        user_id=user.id,
        audio_path=fname,
        text=text,
        words_json=json.dumps(words),
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    # 4) Response
    return {"id": item.id, "text": text, "words": words, "audio": fname}
from typing import Any
from sqlalchemy import desc
import json as _json
from fastapi import Path

def _serialize_item(item: models.Transcript) -> dict[str, Any]:
    try:
        words = _json.loads(item.words_json or "[]")
    except Exception:
        words = []
    return {
        "id": item.id,
        "audio": item.audio_path,
        "text": item.text or "",
        "words": words,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
    }

@app.get("/transcripts")
def list_transcripts(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    rows = db.execute(
        select(models.Transcript)
        .where(models.Transcript.user_id == user.id)
        .order_by(desc(models.Transcript.created_at))
    ).scalars().all()
    # return a lightweight list with preview
    out = []
    for r in rows:
        preview = (r.text or "")[:80]
        out.append({
            "id": r.id,
            "preview": preview,
            "audio": r.audio_path,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return out

@app.get("/transcripts/{tid}")
def get_transcript(
    tid: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    item = db.get(models.Transcript, tid)
    if not item or item.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    return _serialize_item(item)

from datetime import datetime

@app.put("/transcripts/{tid}")
def update_transcript(
    tid: int = Path(..., ge=1),
    payload: dict = None,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    item = db.get(models.Transcript, tid)
    if not item or item.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")

    new_text = (payload or {}).get("text", "")
    item.text = new_text
    item.updated_at = datetime.utcnow()
    db.add(item)
    db.commit()
    db.refresh(item)
    return _serialize_item(item)
# ---- Delete a transcript ----
from fastapi import Response

@app.delete("/transcripts/{tid}")
def delete_transcript(
    tid: int,
    Authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    # auth: get user id from JWT
    if not Authorization or not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = Authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # find transcript for this user
    tx = db.execute(
        select(models.Transcript).where(
            models.Transcript.id == tid,
            models.Transcript.user_id == user_id,
        )
    ).scalar_one_or_none()

    if not tx:
        raise HTTPException(status_code=404, detail="Transcript not found")

    # try to remove audio file
    try:
        if tx.audio_path:
            p = os.path.join("uploads", tx.audio_path)
            if os.path.exists(p):
                os.remove(p)
    except Exception:
        # ignore file errors
        pass

    db.delete(tx)
    db.commit()
    return {"ok": True}
