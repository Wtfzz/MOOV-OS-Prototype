import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import LoginPage from "@/components/LoginPage";
import AppShell from "@/components/AppShell";
import type { CurrentUser, AppState } from "@/types";

export const Route = createFileRoute("/")({
  component: Index,
});

const STORAGE_KEY = "moov-os-p1-state";
const SESSION_KEY = "moov-os-p1-session";

function loadSession(): CurrentUser | null {
  const saved = localStorage.getItem(SESSION_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function Index() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(loadSession());

  const handleLogin = (user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <AppShell currentUser={currentUser} onLogout={handleLogout} />;
}
