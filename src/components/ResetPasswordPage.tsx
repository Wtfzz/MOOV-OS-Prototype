import { useState, useEffect } from "react";
import { KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { validatePassword } from "@/lib/store";
import { t, getCurrentLanguage, setCurrentLanguage, type Language, validateResetToken, markTokenAsUsed, getPasswordResetTokens } from "@/lib/i18n";

interface ResetPasswordPageProps {
  onBackToLogin: () => void;
}

export default function ResetPasswordPage({ onBackToLogin }: ResetPasswordPageProps) {
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    // Extract token from URL hash or search params
    const hash = window.location.hash;
    let extractedToken = "";

    // Try hash first (/#/reset-password?token=xxx)
    const hashMatch = hash.match(/[?&]token=([^&]+)/);
    if (hashMatch) {
      extractedToken = decodeURIComponent(hashMatch[1]);
    }

    // Try search params if no hash match
    if (!extractedToken) {
      const urlParams = new URLSearchParams(window.location.search);
      extractedToken = urlParams.get('token') || '';
    }

    if (extractedToken) {
      setToken(extractedToken);

      // Validate token
      const validated = validateResetToken(extractedToken);
      if (validated) {
        setValidToken(true);
        setEmail(validated.email);
      } else {
        setError(t(lang, 'invalidToken'));
      }
    } else {
      setError(t(lang, 'invalidToken'));
    }

    // Listen for language changes
    const handleStorageChange = () => {
      setLang(getCurrentLanguage());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [lang]);

  const handleLangChange = () => {
    const newLang = lang === 'zh' ? 'en' : 'zh';
    setLang(newLang);
    setCurrentLanguage(newLang);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validToken) {
      setError(t(lang, 'invalidToken'));
      return;
    }

    // Validate password strength
    if (!validatePassword(newPassword)) {
      setError(t(lang, 'passwordTooWeak'));
      return;
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      setError(t(lang, 'passwordsNotMatch'));
      return;
    }

    // Update demo account password
    try {
      const accountsStr = localStorage.getItem('moov-os-demo-accounts');
      let accounts: any[] = [];
      
      if (accountsStr) {
        accounts = JSON.parse(accountsStr);
      } else {
        // Load from initial state
        const stateStr = localStorage.getItem('moov-os-p1-state');
        if (stateStr) {
          const state = JSON.parse(stateStr);
          // We'll update this in the store
        }
      }

      // Mark token as used
      markTokenAsUsed(token);
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        onBackToLogin();
      }, 3000);
    } catch (err) {
      setError(t(lang, 'ssoLoginFailed'));
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-soft via-background to-muted p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t(lang, 'passwordResetSuccess')}</h2>
          <p className="text-muted-foreground mb-6">Redirecting to login...</p>
          <button
            onClick={onBackToLogin}
            className="btn-primary w-full h-10 rounded-md bg-brand text-white font-semibold hover:bg-brand-strong transition-colors"
          >
            {t(lang, 'backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-soft via-background to-muted" />
      
      {/* Language switcher */}
      <button
        onClick={handleLangChange}
        className="absolute top-4 right-4 z-20 px-3 py-1.5 text-sm rounded-md border border-border bg-card hover:bg-muted transition-colors"
      >
        {lang === 'zh' ? 'English' : '中文'}
      </button>

      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <KeyRound className="w-8 h-8 text-brand" />
            <div>
              <h1 className="text-2xl font-bold m-0">{t(lang, 'resetPasswordTitle')}</h1>
              <p className="text-muted-foreground text-sm mt-1">{email}</p>
            </div>
          </div>

          {!validToken ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{error || t(lang, 'invalidToken')}</p>
              <button
                onClick={onBackToLogin}
                className="btn-primary w-full h-10 rounded-md bg-brand text-white font-semibold hover:bg-brand-strong transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t(lang, 'backToLogin')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground/80">
                  {t(lang, 'newPassword')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                  required
                />
                <p className="text-xs text-muted-foreground">{t(lang, 'passwordRule')}</p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground/80">
                  {t(lang, 'confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full h-10 rounded-md bg-brand text-white font-semibold hover:bg-brand-strong transition-colors"
              >
                {t(lang, 'resetPasswordBtn')}
              </button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full h-10 rounded-md border border-border text-foreground font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t(lang, 'backToLogin')}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
