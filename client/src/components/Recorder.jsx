import { useEffect, useRef, useState } from "react";
import api from "../lib/api";

function fmt(t){
  const m = Math.floor(t/60).toString().padStart(2,"0");
  const s = Math.floor(t%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

export default function Recorder() {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState("");
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => () => timerRef.current && clearInterval(timerRef.current), []);

  const startTimer = () => {
    const start = Date.now();
    timerRef.current = setInterval(() => setElapsed((Date.now()-start)/1000), 200);
  };
  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); setElapsed(0); };

  const startRecording = async () => {
    setStatus("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await uploadBlob(blob, mimeType);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
      startTimer();
    } catch {
      setStatus("Mic permission denied or not available.");
    }
  };

  const stopRecording = () => {
    try { mediaRecorderRef.current?.stop(); } catch {}
    setRecording(false);
    stopTimer();
  };

  const uploadBlob = async (blob, mimeType) => {
    setUploading(true);
    setStatus("Uploading…");
    const file = new File([blob], `clip.${mimeType.includes("webm") ? "webm" : "mp4"}`, { type: mimeType });
    const form = new FormData();
    form.append("file", file);
    try {
      const { data } = await api.post("/transcribe", form, { headers: { "Content-Type": "multipart/form-data" } });
      const preview = (data?.text || "").slice(0, 80).trim();
      setStatus(
        data?.text
          ? `Transcript: ${preview}${preview.length === 80 ? "…" : ""} (${data.words?.length || 0} words)`
          : "No speech detected"
      );
    } catch (e) {
      setStatus(e?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl2 p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <button
          onClick={startRecording}
          disabled={recording || uploading}
          className={`px-4 py-2 rounded-xl border text-sm transition
            ${recording || uploading ? "opacity-50" : "bg-primary-500 text-white hover:bg-primary-700"}`}
          title="Start recording"
        >
          Add Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!recording}
          className={`px-4 py-2 rounded-xl border text-sm transition
            ${recording ? "bg-danger/10 text-danger border-danger" : "opacity-50"}`}
          title="Stop recording"
        >
          Stop Recording
        </button>

        <span className={`text-sm ${recording ? "text-danger animate-pulse" : "text-gray-600"}`}>
          {recording ? `Recording… ${fmt(elapsed)}` : uploading ? "Uploading…" : "Idle"}
        </span>
      </div>

      {status && (
        <div className={`mt-3 text-sm px-3 py-2 rounded-xl border inline-block
          ${status.startsWith("Transcript") ? "border-success/30 text-success bg-green-50"
           : status.includes("Uploading") ? "border-primary-300 text-primary-700 bg-primary-100/40"
           : status.includes("failed") || status.includes("denied") ? "border-danger/30 text-danger bg-red-50"
           : "border-gray-200 text-gray-700 bg-gray-50"}`}>
          {status}
        </div>
      )}
    </div>
  );
}
