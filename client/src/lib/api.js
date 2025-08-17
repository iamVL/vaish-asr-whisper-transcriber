import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Axios instance
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Attach JWT from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth helpers ---
export const signup = (payload) => api.post("/auth/signup", payload);
export const login = (payload) => api.post("/auth/login", payload);

// --- Transcription ---
export const uploadAudio = (blob) => {
  const form = new FormData();
  form.append("file", blob, "recording.webm");
  return api.post("/transcribe", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// --- Transcripts ---
export const listTranscripts = () => api.get("/transcripts");
export const getTranscript = (tid) => api.get(`/transcripts/${tid}`);
export const updateTranscript = (tid, text) =>
  api.put(`/transcripts/${tid}`, { text });
export const deleteTranscript = (tid) => api.delete(`/transcripts/${tid}`);
