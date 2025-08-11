import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAuthed } = useAuth();
  return (
    <header className="w-full bg-white/90 backdrop-blur border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-primary-700">Vaish Recordingss</Link>
        <nav className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">Hi, {user?.username}</span>
              <Link to="/app" className="text-sm text-primary-700 hover:underline">App</Link>
              <Link to="/history" className="text-sm text-primary-700 hover:underline">Transcript History</Link>
              <button
                onClick={logout}
                className="text-sm px-3 py-1 rounded-xl border hover:bg-primary-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-primary-700 hover:underline">Login</Link>
              <Link to="/signup" className="text-sm text-primary-700 hover:underline">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
