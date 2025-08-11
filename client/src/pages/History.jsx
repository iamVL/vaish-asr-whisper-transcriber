import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function History() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/transcripts");
        setItems(data);
      } catch (e) {
        setErr(e?.response?.data?.detail || "Failed to load history");
      }
    })();
  }, []);

  const onDelete = async (id) => {
    if (!confirm("Delete this transcript?")) return;
    setBusyId(id);
    try {
      await api.delete(`/transcripts/${id}`);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      alert(e?.response?.data?.detail || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-primary-700 mb-4">Transcript History</h1>
      {err && <div className="text-danger text-sm mb-2">{err}</div>}

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="p-4 rounded-xl2 border bg-white">No transcripts yet.</div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="p-4 rounded-xl2 border bg-white flex items-center justify-between shadow-soft">
              <div className="min-w-0">
                <div className="text-xs text-gray-500 truncate">{new Date(it.created_at).toLocaleString()}</div>
                <div className="text-base mt-1 truncate">{it.preview || "(empty)"}</div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/transcripts/${it.id}`}
                  className="text-sm px-3 py-1 rounded-xl border hover:bg-primary-100 transition"
                >
                  Open
                </Link>
                <button
                  onClick={() => onDelete(it.id)}
                  disabled={busyId === it.id}
                  className="text-sm px-3 py-1 rounded-xl border border-danger text-danger hover:bg-red-50 disabled:opacity-60"
                  title="Delete transcript"
                >
                  {busyId === it.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
