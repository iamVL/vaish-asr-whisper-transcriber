import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isAuthed } = useAuth();
  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-100/60 to-transparent"></div>

      <div className="max-w-6xl mx-auto mt-10 grid md:grid-cols-3 gap-6 items-center">
        {/* Left image */}
        <div className="order-2 md:order-1">
          <img
            className="w-full rounded-xl2 shadow-soft object-cover"
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop"
            alt="Studio microphone"
          />
        </div>

        {/* Center hero */}
        <div className="order-1 md:order-2 text-center px-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-700 tracking-tight">
            Vaish Recordingss
          </h1>
          <p className="mt-3 text-gray-700 max-w-xl mx-auto">
            Record your voice, get instant word-level transcripts, and edit them in one place.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            {isAuthed ? (
              <>
                <Link
                  to="/app"
                  className="px-5 py-3 rounded-xl bg-primary-500 text-white hover:bg-primary-700 transition"
                >
                  Open Recorder
                </Link>
                <Link
                  to="/history"
                  className="px-5 py-3 rounded-xl border hover:bg-primary-100 transition"
                >
                  Transcript History
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="px-5 py-3 rounded-xl bg-primary-500 text-white hover:bg-primary-700 transition"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-3 rounded-xl border hover:bg-primary-100 transition"
                >
                  Log in
                </Link>
              </>
            )}
          </div>

          <div className="mt-8 text-sm text-gray-600">
            • Word-level timestamps • Edit & save • Private by default
          </div>
        </div>

        {/* Right image */}
        <div className="order-3">
          <img
            className="w-full rounded-xl2 shadow-soft object-cover"
            src="https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1200&auto=format&fit=crop"
            alt="Waveform and headphones"
          />
        </div>
      </div>
    </section>
  );
}
