import { useState, useEffect } from "react";
import { LogIn, AlertCircle, Globe, Monitor, Chrome, Eye, EyeOff } from "lucide-react";
import { demoAccounts, validatePassword } from "@/lib/store";
import { t, getCurrentLanguage, setCurrentLanguage, type Language, generateResetToken, validateResetToken, markTokenAsUsed, getPasswordResetTokens } from "@/lib/i18n";
import type { CurrentUser } from "@/types";
import SliderCaptcha, { isCaptchaValid, resetCaptcha } from "./SliderCaptcha";

interface LoginPageProps {
  onLogin: (user: CurrentUser) => void;
}

const backgroundImages = [
  "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?q=80&w=1170&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=1172&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=1171&auto=format&fit=crop",
];

const moovLogoUrl = "https://conversation.cdn.meoo.host/conversations/311090703507873792/image/2026-07-01/1782894123144-MOOV%E6%A9%99%E8%93%9D%E9%85%8D%E8%89%B2%E5%9B%BE%E6%A0%87_Icon.png?auth_key=4da39d5dc69eda27dffb6f9502e51553cca76d8386e39f8772295e15c27e964b";

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [email, setEmail] = useState("admin@moov.local");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showForgotPanel, setShowForgotPanel] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [, setCaptchaVerified] = useState(false);
  const [showLoginCaptcha, setShowLoginCaptcha] = useState(false);
  const [forgotCaptchaVerified, setForgotCaptchaVerified] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    setCurrentLanguage(newLang);
    setLanguageMenuOpen(false);
  };

  const completeLogin = () => {
    setError("");
    setShowLoginCaptcha(false);

    if (lockedUntil && Date.now() < lockedUntil) {
      const minutes = Math.ceil((lockedUntil - Date.now()) / 60000);
      setError(lang === 'zh' ? `账号已锁定，请 ${minutes} 分钟后再试` : `Account locked, try again in ${minutes} minutes`);
      return;
    }

    const account = demoAccounts.find(
      (item: { email: string; password: string }) => item.email === email && item.password === password
    );

    if (!account) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      resetCaptcha("login");
      setCaptchaVerified(false);

      if (newAttempts >= 5) {
        const lockTime = Date.now() + 15 * 60 * 1000;
        setLockedUntil(lockTime);
      }

      setError(t(lang, 'login'));
      return;
    }

    const user: CurrentUser = {
      email: account.email,
      name: account.name,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
      roles: account.roles,
      team: account.team,
      department: account.department,
      phone: account.phone,
      sessionId: `sess-${Date.now()}`,
    };

    onLogin(user);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (lockedUntil && Date.now() < lockedUntil) {
      const minutes = Math.ceil((lockedUntil - Date.now()) / 60000);
      setError(lang === 'zh' ? `账号已锁定，请 ${minutes} 分钟后再试` : `Account locked, try again in ${minutes} minutes`);
      return;
    }

    resetCaptcha("login");
    setCaptchaVerified(false);
    setShowLoginCaptcha(true);
  };
  const handleSSOLogin = (provider: 'microsoft' | 'google') => {
    setError("");
    
    // Map SSO provider to demo account
    const targetEmail = provider === 'microsoft' ? 'admin@moov.local' : 'ops@moov.local';
    const account = demoAccounts.find(item => item.email === targetEmail);
    
    if (!account) {
      setError(t(lang, 'ssoLoginFailed'));
      return;
    }

    const user: CurrentUser = {
      email: account.email,
      name: account.name,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
      roles: account.roles,
      team: account.team,
      department: account.department,
      phone: account.phone,
      sessionId: `sess-sso-${Date.now()}`,
    };

    onLogin(user);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check captcha verification for forgot password
    if (!isCaptchaValid("forgotPassword")) {
      setError(lang === 'zh' ? '\u8bf7\u5148\u5b8c\u6210\u6ed1\u5757\u9a8c\u8bc1' : 'Please complete the slider captcha first');
      return;
    }

    if (!resetEmail) {
      setError(t(lang, 'username'));
      return;
    }

    // Generate reset token and show reset modal directly
    const token = generateResetToken(resetEmail);
    setResetToken(token);
    setShowResetModal(true);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate token
    const isTokenValid = validateResetToken(resetToken);
    if (!isTokenValid) {
      setError(t(lang, 'invalidToken'));
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError(t(lang, 'passwordMismatch'));
      return;
    }

    // Validate password strength
    const isValid = validatePassword(newPassword);
    if (!isValid) {
      setError(t(lang, 'weakPassword'));
      return;
    }

    // Update demo account password
    const updatedAccounts = demoAccounts.map(account =>
      account.email === resetEmail
        ? { ...account, password: newPassword }
        : account
    );

    // Save to localStorage
    localStorage.setItem('moov-os-demo-accounts', JSON.stringify(updatedAccounts));

    // Mark token as used
    markTokenAsUsed(resetToken);

    // Show success and close modal
    setResetSuccess(true);
    setTimeout(() => {
      setShowResetModal(false);
      setShowForgotPanel(false);
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setResetEmail("");
      setResetSuccess(false);
      setError("");
    }, 2000);
  };

  // Reset Password Modal
  if (showResetModal) {
    return (
      <div className="h-screen relative overflow-hidden">
        {backgroundImages.map((imageUrl, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url('${imageUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: currentImageIndex === index ? 1 : 0,
              zIndex: 0,
            }}
          />
        ))}

        <section className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-[420px] max-h-[calc(100vh-32px)] bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-5 sm:p-7 lg:p-8">
            <div className="flex items-center gap-3 mb-8">
              <img
                src={moovLogoUrl}
                alt="MOOV OS"
                className="w-10 h-10 rounded-lg object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold m-0 text-foreground">MOOV OS</h1>
                <p className="text-muted-foreground mt-1 mb-0 text-sm">{t(lang, 'resetPassword')}</p>
              </div>
            </div>

            {!resetSuccess ? (
              <form onSubmit={handleResetPasswordSubmit} className="grid gap-5">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-foreground/80">
                    {t(lang, 'emailAddress')}
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    readOnly
                    className="w-full border border-input rounded-md px-3 py-2.5 bg-gray-100 text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-foreground/80">
                    {t(lang, 'newPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2.5 pr-10 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft bg-white/80"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t(lang, 'passwordRequirements')}
                  </p>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-foreground/80">
                    {t(lang, 'confirmPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2.5 pr-10 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft bg-white/80"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50/80 p-3 rounded-md">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full h-10 rounded-md bg-brand text-white font-semibold hover:bg-brand-strong transition-colors"
                >
                  {t(lang, 'resetPassword')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setShowForgotPanel(false);
                    setResetToken("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setResetEmail("");
                    setError("");
                  }}
                  className="w-full h-10 rounded-md border border-border text-foreground font-semibold hover:bg-muted transition-colors"
                >
                  {t(lang, 'cancel')}
                </button>
              </form>
            ) : (
              <div className="grid gap-4">
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-green-800 font-medium">{t(lang, 'passwordResetSuccess')}</p>
                  <p className="text-xs text-green-600 mt-1">{t(lang, 'returningToLogin')}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // Forgot Password Panel (email input only)
  if (showForgotPanel) {
    return (
      <div className="h-screen relative overflow-hidden">
        {backgroundImages.map((imageUrl, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url('${imageUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: currentImageIndex === index ? 1 : 0,
              zIndex: 0,
            }}
          />
        ))}

        <section className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-[420px] max-h-[calc(100vh-32px)] bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-5 sm:p-7 lg:p-8">
            <div className="flex items-center gap-3 mb-8">
              <img
                src={moovLogoUrl}
                alt="MOOV OS"
                className="w-10 h-10 rounded-lg object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold m-0 text-foreground">MOOV OS</h1>
                <p className="text-muted-foreground mt-1 mb-0 text-sm">{t(lang, 'forgotPassword')}</p>
              </div>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground/80">
                  {t(lang, 'emailAddress')}
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft bg-white/80"
                  required
                  placeholder="admin@moov.local"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50/80 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Slider Captcha for Forgot Password */}
              <SliderCaptcha
                context="forgotPassword"
                onVerify={(verified) => setForgotCaptchaVerified(verified)}
              />

              <button
                type="submit"
                disabled={!forgotCaptchaVerified}
                className={`btn-primary w-full h-10 rounded-md font-semibold transition-colors ${
                  forgotCaptchaVerified
                    ? 'bg-brand text-white hover:bg-brand-strong'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {t(lang, 'continue')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPanel(false);
                  setResetToken("");
                  setError("");
                }}
                className="w-full h-10 rounded-md border border-border text-foreground font-semibold hover:bg-muted transition-colors"
              >
                {t(lang, 'backToLogin')}
              </button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden">
      {backgroundImages.map((imageUrl, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url('${imageUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: currentImageIndex === index ? 1 : 0,
            zIndex: 0,
          }}
        />
      ))}

      {/* Language switcher */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={() => setLanguageMenuOpen((open) => !open)}
          className="px-3 py-2 rounded-md border border-white/30 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Globe className="w-4 h-4" />
          {lang === 'zh' ? '语言' : 'Language'}
        </button>
        {languageMenuOpen && (
          <div className="absolute right-0 top-full mt-1 min-w-[120px] overflow-hidden rounded-lg border border-border bg-white shadow-lg">
            <button
              type="button"
              onClick={() => handleLangChange('zh')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${lang === 'zh' ? 'bg-brand-soft text-brand-strong' : ''}`}
            >
              中文
            </button>
            <button
              type="button"
              onClick={() => handleLangChange('en')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${lang === 'en' ? 'bg-brand-soft text-brand-strong' : ''}`}
            >
              English
            </button>
          </div>
        )}
      </div>

      <section className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[420px] max-h-[calc(100vh-72px)] bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-5 sm:p-7 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <img
              src={moovLogoUrl}
              alt="MOOV OS"
              className="w-10 h-10 rounded-lg object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold m-0 text-foreground">MOOV OS</h1>
              <p className="text-muted-foreground mt-1 mb-0 text-sm">P1 Foundation Console</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground/80">
                {t(lang, 'username')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft bg-white/80"
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-foreground/80">
                  {t(lang, 'password')}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPanel(true);
                    setResetEmail(email);
                  }}
                  className="text-brand font-semibold text-sm hover:underline bg-transparent border-0 p-0 cursor-pointer"
                >
                  {t(lang, 'forgotPassword')}
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft bg-white/80"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50/80 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full h-10 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg bg-brand text-white hover:bg-brand-strong"
            >
              <LogIn className="w-4 h-4" />
              {t(lang, 'login')}
            </button>
          </form>

          {/* SSO Divider */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* SSO Buttons */}
          <div className="mt-3 grid gap-2.5">
            <button
              type="button"
              onClick={() => handleSSOLogin('microsoft')}
              className="w-full h-10 rounded-md border border-border bg-white/80 hover:bg-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Monitor className="w-4 h-4 text-brand" />
              {t(lang, 'continueWithMicrosoft')}
            </button>
            <button
              type="button"
              onClick={() => handleSSOLogin('google')}
              className="w-full h-10 rounded-md border border-border bg-white/80 hover:bg-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Chrome className="w-4 h-4 text-red-500" />
              {t(lang, 'continueWithGoogle')}
            </button>
          </div>

          <div className="mt-4 p-3 border border-border/50 rounded-lg bg-white/50 text-muted-foreground text-xs sm:text-sm leading-relaxed">
            {t(lang, 'demoAccounts')}
          </div>
        </div>

        {/* Image indicators */}
        <div className="flex justify-center gap-2 mt-3">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentImageIndex === index
                  ? 'w-8 bg-brand'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={lang === 'zh' ? `\u5207\u6362\u5230\u7b2c ${index + 1} \u5f20\u56fe\u7247` : `Switch to image ${index + 1}`}
            />
          ))}
        </div>
      </section>
      {showLoginCaptcha && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-[420px] rounded-2xl border border-white/30 bg-white/90 p-5 shadow-2xl backdrop-blur-lg">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">{lang === 'zh' ? '安全验证' : 'Security verification'}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {lang === 'zh' ? '拖动滑块完成验证后将自动登录。' : 'Complete the slider captcha to continue signing in.'}
              </p>
            </div>
            <SliderCaptcha
              context="login"
              onVerify={(verified) => {
                setCaptchaVerified(verified);
                if (verified) {
                  completeLogin();
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                setShowLoginCaptcha(false);
                resetCaptcha("login");
                setCaptchaVerified(false);
              }}
              className="mt-4 h-10 w-full rounded-md border border-border bg-white/70 font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {t(lang, 'cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
