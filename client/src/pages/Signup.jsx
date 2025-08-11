import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const { signup } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await signup(username, email, password);
      nav("/login");
    } catch (e) {
      setErr(e?.response?.data?.detail || "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-semibold mb-4">Sign up</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Username"
               value={username} onChange={(e)=>setUsername(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email"
               value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password"
               value={password} onChange={(e)=>setPassword(e.target.value)} />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button disabled={busy} className="w-full border rounded px-3 py-2">
          {busy ? "Creating…" : "Sign up"}
        </button>
      </form>
      <p className="text-sm mt-3">Have an account? <Link to="/login" className="underline">Log in</Link></p>
    </div>
  );
}
