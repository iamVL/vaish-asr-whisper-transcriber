import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-primary-100/40 text-gray-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
