import { useState } from "react";
import { Save, KeyRound, LogOut } from "lucide-react";
import type { CurrentUser, AppState, LoginHistory, Session } from "@/types";
import { loadState, saveState, escapeHtml, validatePassword } from "@/lib/store";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";

interface ProfilePageProps {
  currentUser: CurrentUser;
}

export default function ProfilePage({ currentUser }: ProfilePageProps) {
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const [state, setState] = useState<AppState>(loadState());
  const [formData, setFormData] = useState({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    department: currentUser.department,
    phone: currentUser.phone,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [toast, setToast] = useState("");

  const user = state.users.find((u) => u.email === currentUser.email);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUsers = state.users.map((u) =>
      u.id === user.id
        ? {
            ...u,
            firstName: formData.firstName,
            lastName: formData.lastName,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            department: formData.department,
            phone: formData.phone,
          }
        : u
    );

    const newState = { ...state, users: updatedUsers };
    setState(newState);
    saveState(newState);

    showToast(t(lang, "save") + " OK");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Passwords do not match");
      return;
    }
    if (!validatePassword(passwordForm.newPassword)) {
      showToast(t(lang, "passwordRule"));
      return;
    }
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    showToast(t(lang, "changePassword") + " OK");
  };

  const handleEndSession = (sessionId: string) => {
    const updatedSessions = state.sessions.map((s) =>
      s.id === sessionId ? { ...s, endedAt: new Date().toLocaleString("en-US", { hour12: false }) } : s
    );
    const newState = { ...state, sessions: updatedSessions };
    setState(newState);
    saveState(newState);
    showToast(t(lang, "endSession") + " OK");
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2400);
  };

  const history: LoginHistory[] = state.loginHistory
    .filter((item) => item.userEmail === currentUser.email)
    .slice(-10)
    .reverse();

  const activeSessions: Session[] = state.sessions
    .filter((item) => item.userEmail === currentUser.email && !item.endedAt)
    .reverse();

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <section className="bg-card border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold">{t(lang, "personalInfo")}</h2>
            <p className="text-xs text-muted-foreground">{t(lang, "readOnlyNote")}</p>
          </div>
          <form onSubmit={handleProfileSubmit} className="p-4 grid grid-cols-2 gap-3">
            <div className="field">
              <label className="text-sm font-medium">First Name</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="text-sm font-medium">Last Name</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="text-sm font-medium">Email Address</label>
              <input className="w-full border rounded px-3 py-2 bg-muted" value={currentUser.email} disabled />
            </div>
            <div className="field">
              <label className="text-sm font-medium">Role(s)</label>
              <input
                className="w-full border rounded px-3 py-2 bg-muted"
                value={currentUser.roles.join(", ")}
                disabled
              />
            </div>
            <div className="field">
              <label className="text-sm font-medium">Department</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="text-sm font-medium">Phone Number</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <button type="submit" className="btn-primary inline-flex items-center gap-2">
                <Save size={16} />
                {t(lang, "save")}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-card border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold">{t(lang, "changePassword")}</h2>
            <p className="text-xs text-muted-foreground">
              {t(lang, "passwordRule")}
            </p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="p-4 grid gap-3">
            <div className="field">
              <label className="text-sm font-medium">Current Password</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="text-sm font-medium">New Password</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="text-sm font-medium">Confirm New Password</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary inline-flex items-center gap-2">
                <KeyRound size={16} />
                {t(lang, "changePassword")}
              </button>
            </div>
          </form>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-card border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold">{t(lang, "recentLogins")}</h2>
            <p className="text-xs text-muted-foreground">Time, IP and login status.</p>
          </div>
          <div className="p-4">
            {history.length > 0 ? (
              <div className="space-y-2">
                {history.map((item) => (
                  <div key={item.id} className="flex justify-between items-center pb-2 border-b last:border-0">
                    <div>
                      <strong className="text-sm">{escapeHtml(item.timestamp)}</strong>
                      <p className="text-xs text-muted-foreground">
                        {escapeHtml(item.ip)} · {escapeHtml(item.status)}
                      </p>
                    </div>
                    <span className={`badge badge-${item.status.toLowerCase()}`}>{escapeHtml(item.status)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t(lang, "noData")}</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-card border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold">{t(lang, "activeSessions")}</h2>
            <p className="text-xs text-muted-foreground">End other device sessions; ending current session will logout.</p>
          </div>
          <div className="p-4">
            {activeSessions.length > 0 ? (
              <div className="space-y-2">
                {activeSessions.map((item) => (
                  <div key={item.id} className="flex justify-between items-center pb-2 border-b last:border-0">
                    <div>
                      <strong className="text-sm">
                        {escapeHtml(item.device)} · {escapeHtml(item.browser)}
                      </strong>
                      <p className="text-xs text-muted-foreground">
                        {escapeHtml(item.ip)} · Login {escapeHtml(item.loginAt)} · Last activity{" "}
                        {escapeHtml(item.lastActivity)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEndSession(item.id)}
                      className="btn inline-flex items-center gap-1 text-sm"
                    >
                      <LogOut size={14} />
                      {t(lang, "endSession")}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t(lang, "noData")}</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed right-4 bottom-4 bg-foreground text-background px-4 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
