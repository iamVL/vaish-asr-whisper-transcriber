import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import AppShell from "./shell/AppShell";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AppHome from "./pages/AppHome";
import ProtectedRoute from "./components/ProtectedRoute";
import History from "./pages/History";
import TranscriptDetail from "./pages/TranscriptDetail";
import Home from "./pages/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      {
        path: "/app",
        element: (
          <ProtectedRoute>
            <AppHome />
          </ProtectedRoute>
        ),
      },
      {
        path: "/history",
        element: (
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        ),
      },
      {
        path: "/transcripts/:id",
        element: (
          <ProtectedRoute>
            <TranscriptDetail />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
