import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { dbInstance } from '../utils/axios';
import { TRIPOLI_DISTRICTS } from '../utils/APIConst';
import {
  HeartPulse,
  ShieldCheck,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Building2,
  Stethoscope,
  Globe,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useNotifications();
  const { t, translateDistrict, language, setLanguage, isRtl } = useLanguage();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up inputs
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('+961 7');
  const [signUpDistrict, setSignUpDistrict] = useState('Al-Tal');
  const [signUpRole, setSignUpRole] = useState<'CITIZEN' | 'HEALTH_OFFICER' | 'ADMINISTRATOR'>('CITIZEN');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  const usersCount = dbInstance.users.length;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!signInEmail.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني.' : 'Please enter your email.');
      return;
    }

    setIsSubmitting(true);
    const success = login(signInEmail, signInPassword);
    setIsSubmitting(false);

    if (success) {
      showToast(
        language === 'ar'
          ? 'تم تسجيل الدخول بنجاح! مرحباً بك في نبض طرابلس الصحي.'
          : 'Signed in successfully! Welcome to Tripoli HealthPulse.'
      );
    } else {
      setErrorMsg(
        usersCount === 0
          ? (language === 'ar'
              ? 'قاعدة البيانات فارغة حالياً ولا تحتوي على أي مستخدمين. يرجى إنشاء حساب جديد أولاً للبدء.'
              : 'Database currently has zero users. Please create a new account first.')
          : (language === 'ar'
              ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد والمحاولة مجدداً.'
              : 'Invalid email or password. Please verify and try again.')
      );
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!signUpName.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال الاسم الكامل.' : 'Please provide full name.');
      return;
    }
    if (!signUpEmail.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني.' : 'Please provide email address.');
      return;
    }
    if (signUpPassword && signUpPassword !== signUpConfirmPassword) {
      setErrorMsg(language === 'ar' ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      register({
        name: signUpName,
        email: signUpEmail,
        phone: signUpPhone,
        district: signUpDistrict,
        role: signUpRole,
        password: signUpPassword || undefined,
        title: signUpRole === 'HEALTH_OFFICER'
          ? 'Municipal Health Inspector'
          : signUpRole === 'ADMINISTRATOR'
          ? 'Health Directorate Administrator'
          : 'Tripoli Resident',
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`
      });

      showToast(
        language === 'ar'
          ? `تم إنشاء الحساب بنجاح وتسجيل الدخول بدور: ${signUpRole}`
          : `Account registered successfully! Logged in as: ${signUpRole}`
      );
    } catch {
      setErrorMsg(language === 'ar' ? 'فشل إنشاء الحساب. حاول مجدداً.' : 'Registration failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative selection:bg-teal-500 selection:text-white"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Header & Language Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white border border-teal-400/30">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-white block">
              {language === 'ar' ? 'نبض طرابلس الصحي' : 'Tripoli HealthPulse'}
            </span>
            <span className="text-[10px] text-teal-400 font-medium block">
              {language === 'ar' ? 'بلدية طرابلس الكبرى • الرقابة الصحية' : 'Greater Tripoli Health Directorate'}
            </span>
          </div>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-teal-400" />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-6">
          {/* Card Title */}
          <div className="text-center space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {mode === 'signin'
                ? (language === 'ar' ? 'تسجيل الدخول للمنظومة' : 'Sign In to Portal')
                : (language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account')}
            </h1>
            <p className="text-xs text-slate-400">
              {mode === 'signin'
                ? (language === 'ar'
                    ? 'أدخل بياناتك للوصول إلى لوحة المتابعة والرصد الصحي'
                    : 'Enter your credentials to access health surveillance dashboard')
                : (language === 'ar'
                    ? 'سجّل حسابك في قاعدة البيانات المباشرة لمدينة طرابلس'
                    : 'Register your profile in the live Tripoli health database')}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(''); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إنشاء حساب' : 'Sign Up'}</span>
            </button>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Zero Users Notice on Sign-In */}
          {mode === 'signin' && usersCount === 0 && (
            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 text-teal-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{language === 'ar' ? 'قاعدة البيانات فارغة تماماً' : 'Database Currently Empty'}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {language === 'ar'
                  ? 'تمت إزالة كافة البيانات والبيانات الوهمية بما فيها المستخدمين. اضغط على "إنشاء حساب" لتسجيل أول حساب لك في قاعدة البيانات واختبار النظام.'
                  : 'All static mock data and test users have been purged. Click "Sign Up" to register your initial account in the database.'}
              </p>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); }}
                className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
              >
                <span>{language === 'ar' ? 'الانتقال إلى إنشاء حساب جديد' : 'Switch to Create Account'}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-teal-400" />
                  <span>{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</span>
                </label>
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={e => setSignInEmail(e.target.value)}
                  placeholder="your.email@tripoli.lb"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-400" />
                  <span>{language === 'ar' ? 'كلمة المرور' : 'Password'}</span>
                </label>
                <input
                  type="password"
                  value={signInPassword}
                  onChange={e => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? (language === 'ar' ? 'جاري التحقق...' : 'Signing In...')
                    : (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
                </span>
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  <span>{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={e => setSignUpName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: سامر كرامي' : 'e.g. Samer Karami'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-400" />
                    <span>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={e => setSignUpEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    <span>{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</span>
                  </label>
                  <input
                    type="tel"
                    value={signUpPhone}
                    onChange={e => setSignUpPhone(e.target.value)}
                    placeholder="+961 70 123456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>{language === 'ar' ? 'الحي في طرابلس' : 'District in Tripoli'}</span>
                </label>
                <select
                  value={signUpDistrict}
                  onChange={e => setSignUpDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                >
                  {TRIPOLI_DISTRICTS.map(d => (
                    <option key={d} value={d}>
                      {translateDistrict(d)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Selection for Testing */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>{language === 'ar' ? 'نوع الحساب / الدور' : 'Account Role'}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignUpRole('CITIZEN')}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      signUpRole === 'CITIZEN'
                        ? 'bg-teal-600/30 border-teal-500 text-teal-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-[11px] font-bold">
                      {language === 'ar' ? 'مواطن' : 'Citizen'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignUpRole('HEALTH_OFFICER')}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      signUpRole === 'HEALTH_OFFICER'
                        ? 'bg-teal-600/30 border-teal-500 text-teal-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span className="text-[11px] font-bold">
                      {language === 'ar' ? 'مفتش صحي' : 'Inspector'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignUpRole('ADMINISTRATOR')}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      signUpRole === 'ADMINISTRATOR'
                        ? 'bg-teal-600/30 border-teal-500 text-teal-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-[11px] font-bold">
                      {language === 'ar' ? 'مدير بلدي' : 'Admin'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-teal-400" />
                    <span>{language === 'ar' ? 'كلمة المرور' : 'Password'}</span>
                  </label>
                  <input
                    type="password"
                    value={signUpPassword}
                    onChange={e => setSignUpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-teal-400" />
                    <span>{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm'}</span>
                  </label>
                  <input
                    type="password"
                    value={signUpConfirmPassword}
                    onChange={e => setSignUpConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? (language === 'ar' ? 'جاري التسجيل...' : 'Creating Account...')
                    : (language === 'ar' ? 'إنشاء الحساب ودخول المنظومة' : 'Create Account & Enter')}
                </span>
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto py-3 text-center text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60">
        <div>
          {language === 'ar'
            ? 'منظومة نبض طرابلس الصحي • بلدية طرابلس، شمال لبنان'
            : 'Tripoli HealthPulse System • Tripoli Municipality, North Lebanon'}
        </div>
        <div className="text-teal-400/80 font-mono text-[10px]">
          {language === 'ar' ? 'قاعدة بيانات مباشرة (0 بيانات وهمية)' : 'Live Database Mode (0 Mock Records)'}
        </div>
      </footer>
    </div>
  );
};
