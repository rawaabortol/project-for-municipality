import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";
import { TRIPOLI_DISTRICTS } from "../../utils/APIConst";
import {
  X,
  LogIn,
  UserPlus,
  Shield,
  UserCheck,
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "signin",
}) => {
  const { login, register } = useAuth();
  const { showToast } = useNotifications();
  const { t, translateDistrict, translateRole, language, isRtl } =
    useLanguage();

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign In form
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up form
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("+961 ");
  const [signUpDistrict, setSignUpDistrict] = useState("Al-Tal");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");

  // Close modal when pressing Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!signInEmail.trim()) {
      setErrorMsg(
        language === "ar"
          ? "يرجى إدخال البريد الإلكتروني."
          : "Please enter your email.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await login(signInEmail, signInPassword);
      showToast(
        language === "ar"
          ? "تم تسجيل الدخول بنجاح! مرحباً بك في نبض طرابلس الصحي."
          : "Signed in successfully! Welcome to Tripoli HealthPulse.",
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          (language === "ar"
            ? "تعذر العثور على الحساب أو كلمة المرور غير صحيحة."
            : "User not found or invalid credentials."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!signUpName.trim()) {
      setErrorMsg(
        language === "ar"
          ? "يرجى إدخال الاسم الكامل."
          : "Please provide full name.",
      );
      return;
    }
    if (!signUpEmail.trim()) {
      setErrorMsg(
        language === "ar"
          ? "يرجى إدخال البريد الإلكتروني."
          : "Please provide email address.",
      );
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMsg(
        language === "ar"
          ? "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل."
          : "Password must be at least 6 characters.",
      );
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMsg(
        language === "ar"
          ? "كلمتا المرور غير متطابقتين."
          : "Passwords do not match.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = await register({
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        phone: signUpPhone.trim() === "+961 " ? "" : signUpPhone.trim(),
        district: signUpDistrict,
        password: signUpPassword,
      });
      showToast(
        language === "ar"
          ? `أهلاً بك يا ${newUser.name}! تم إنشاء حسابك كمواطن راصد بنجاح.`
          : `Welcome ${newUser.name}! Your citizen account has been created.`,
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === "signin" ? t("loginTitle") : t("registerTitle")}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t("cityJurisdiction")}, {t("country")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMsg("");
            }}
            className={`flex-1 py-3 font-bold text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
              mode === "signin"
                ? "border-teal-500 text-teal-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{t("signIn")}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg("");
            }}
            className={`flex-1 py-3 font-bold text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
              mode === "signup"
                ? "border-teal-500 text-teal-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{t("signUp")}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {t("emailAddress")} *
                </label>
                <div className="relative">
                  <Mail
                    className={`w-4 h-4 text-slate-400 absolute ${isRtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`}
                  />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="officer@tripoli-health.gov.lb"
                    className={`w-full ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"} py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {t("password")}
                </label>
                <div className="relative">
                  <Lock
                    className={`w-4 h-4 text-slate-400 absolute ${isRtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`}
                  />
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"} py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? language === "ar"
                      ? "جاري التحقق..."
                      : "Authenticating..."
                    : t("signIn")}
                </span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  {t("fullName")} *
                </label>
                <div className="relative">
                  <User
                    className={`w-4 h-4 text-slate-400 absolute ${isRtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`}
                  />
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder={
                      language === "ar"
                        ? "مثال: كريم المير"
                        : "e.g., Karim Al-Mir"
                    }
                    className={`w-full ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"} py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {t("emailAddress")} *
                  </label>
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {t("phoneNumber")}
                  </label>
                  <input
                    type="tel"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  {t("tripoliDistrict")}
                </label>
                <select
                  value={signUpDistrict}
                  onChange={(e) => setSignUpDistrict(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                >
                  {TRIPOLI_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {translateDistrict(d)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Citizen Registration Policy Card */}
              <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
                  <Shield className="w-4 h-4 text-teal-400" />
                  <span>
                    {language === "ar"
                      ? "نوع الحساب: مواطن / راصد مجتمعي"
                      : "Account Type: Citizen / Community Reporter"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {language === "ar"
                    ? 'سياسة أمنية معتمدة: يتم إنشاء جميع الحسابات الجديدة برتبة "مواطن" فقط. لا يمكن التسجيل المباشر كموظف، وتُمنح رتب المراقبين الصحيين حصرياً من قِبل إدارة المنظومة.'
                    : "Security Policy: All newly registered accounts are created strictly as Citizens. Municipal employee and health officer roles cannot be self-selected and are assigned exclusively by the Administration."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {t("password")}
                  </label>
                  <input
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {t("confirmPassword")}
                  </label>
                  <input
                    type="password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? language === "ar"
                      ? "جاري الإنشاء..."
                      : "Creating Account..."
                    : t("signUp")}
                </span>
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-800/60 text-center text-xs text-slate-400">
          {mode === "signin" ? (
            <button
              onClick={() => {
                setMode("signup");
                setErrorMsg("");
              }}
              className="text-teal-400 hover:text-teal-300 font-semibold"
            >
              {t("dontHaveAccount")}
            </button>
          ) : (
            <button
              onClick={() => {
                setMode("signin");
                setErrorMsg("");
              }}
              className="text-teal-400 hover:text-teal-300 font-semibold"
            >
              {t("alreadyHaveAccount")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
