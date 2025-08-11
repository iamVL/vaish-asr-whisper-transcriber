import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";

export default function TranscriptDetail() {
  const { id } = useParams();
  const [text, setText] = useState("");
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setStatus("");
      try {
        const { data } = await api.get(`/transcripts/${id}`);
        setText(data.text || "");
        setCount(data.words?.length || 0);
      } catch (e) {
        setStatus(e?.response?.data?.detail || "Failed to load transcript");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const save = async () => {
    setStatus("Saving…");
    try {
      const { data } = await api.put(`/transcripts/${id}`, { text });
      setText(data.text || "");
      setCount(data.words?.length || 0);
      setStatus("Saved.");
    } catch (e) {
      setStatus(e?.response?.data?.detail || "Save failed");
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-3xl font-bold text-primary-700">Transcript #{id}</h1>
        <Link to="/history" className="text-sm text-primary-700 hover:underline">Back to History</Link>
      </div>

      <div className="text-sm text-gray-600 mb-2">{count} words detected</div>

      <div className="p-4 rounded-xl2 border bg-white shadow-soft">
        <textarea
          className="w-full min-h-[260px] focus:outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button onClick={save} className="px-5 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-700 transition">
          Save
        </button>
        {status && <span className="text-sm">{status}</span>}
      </div>
    </div>
  );
}
