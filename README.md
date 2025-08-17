# 🎙️ Vaish ASR Whisper Transcriber
A full-stack speech-to-text transcription web app featuring a React frontend and a FastAPI backend. Users can record audio, generate word-level transcripts using OpenAI Whisper (via faster-whisper), and manage their transcript history with authentication and database support.

---

🚀 **Features**  
- 🔐 **Auth System** — Sign up, log in, and manage user accounts.  
- 🎤 **Voice Recording** — Start/stop recording directly in the browser.  
- ✍️ **Word-Level Transcription** — Audio processed with Whisper ASR (faster-whisper).  
- 📜 **Transcript History** — View, edit, and save past transcriptions.  
- 🎨 **Modern UI** — Built with React + Tailwind, with interactive button feedback (color changes).  
- 🗄️ **Database Integration** — Store user info & transcripts in SQLite.  
- ⚡ **Full-Stack Deployment Ready** — Clean architecture for future cloud hosting.  

---

🏗️ **Architecture & Tech Stack**  

**Backend (FastAPI + Whisper)**  
- Language/Framework: Python 3.10 + FastAPI  
- ASR Model: OpenAI Whisper (via [faster-whisper](https://github.com/guillaumekln/faster-whisper))  
- Database: SQLite (lightweight, persistent)  
- ORM: SQLAlchemy + Pydantic schemas  
- Auth: JWT-based authentication  
- Deployment Ready: Easily containerizable with Docker  

**Frontend (React + Vite + Tailwind)**  
- Framework: React 18 + Vite  
- Styling: TailwindCSS (utility-first, responsive)  
- Routing: React Router  
- Components:  
  - `Recorder.jsx` for audio capture  
  - `Navbar.jsx` for navigation  
  - `History.jsx` for viewing/editing transcripts  
- State Management: React Context API  
- API Calls: Axios wrapper (`lib/api.js`)  

---

⚙️ **Installation & Setup**  

**Backend (FastAPI + Whisper)**  -- hosted on Render
URL: https://vaish-asr-backend.onrender.com

```# Clone repo
git clone https://github.com/iamVL/vaish-asr-whisper-transcriber.git
cd vaish-asr-whisper-transcriber

# Setup venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdir -p uploads
uvicorn app.main:app --reload

# http://127.0.0.1:8000/docs
```
**Frontend (React + Vite + Tailwind)**  -- hosted on Vercel
URL: https://vaish-asr-whisper-transcriber.vercel.app

```cd client
echo "VITE_API_BASE_URL=http://127.0.0.1:8000" > .env
npm install
npm run dev
# http://localhost:5173
```

