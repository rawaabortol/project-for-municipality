import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDismissOnBlurOrOutside } from '../utils/useDismissOnBlurOrOutside';
import {
  Shield,
  Bell,
  PlusCircle,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  LogOut,
  ChevronDown,
  ChevronUp,
  Globe,
  User,
  LogIn,
  UserPlus,
  Settings,
  Camera,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  onOpenNewReport: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
  onOpenProfileModal?: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewReport,
  setActiveTab,
  onOpenAuthModal,
  onOpenProfileModal,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  isVisible = true,
  onToggleVisibility
}) => {
  const { currentUser, switchRole, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, showToast } = useNotifications();
  const { language, setLanguage, t, isRtl, translateRole, translateDistrict } = useLanguage();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // References for outside click and blur dismissal
  const notifTriggerRef = useRef<HTMLButtonElement>(null);
  const notifDropdownRef = useDismissOnBlurOrOutside<HTMLDivElement>({
    isOpen: showNotifMenu,
    onDismiss: () => setShowNotifMenu(false),
    ignoreRefs: [notifTriggerRef]
  });

  const roleTriggerRef = useRef<HTMLButtonElement>(null);
  const roleDropdownRef = useDismissOnBlurOrOutside<HTMLDivElement>({
    isOpen: showRoleMenu,
    onDismiss: () => setShowRoleMenu(false),
    ignoreRefs: [roleTriggerRef]
  });

  if (!currentUser) return null;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleLogout = () => {
    logout();
    setShowRoleMenu(false);
    showToast(
      language === 'ar'
        ? 'تم تسجيل الخروج بنجاح. تم التحويل إلى وضع الضيف.'
        : 'Logged out successfully. Switched to guest visitor mode.'
    );
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 bg-slate-900/98 backdrop-blur-md border-b border-slate-800 text-white shadow-xl transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Left: Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Drawer Button */}
            {onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                aria-label="Toggle Navigation Menu"
                className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition-colors shrink-0"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-teal-400" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            {/* Brand & City Identification */}
            <div
              className="flex items-center gap-2.5 cursor-pointer min-w-0"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/20 ring-1 ring-white/20 shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold text-sm sm:text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-300 bg-clip-text text-transparent truncate">
                    {t('appTitle')}
                  </span>
                  <span className="hidden xs:inline-block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/80 shrink-0">
                    {t('country')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block truncate">{t('appSubtitle')}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Role Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors shadow-sm"
              title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
            >
              <Globe className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-teal-300">{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Slide Up Navigation Toggle Button */}
            {onToggleVisibility && (
              <button
                onClick={onToggleVisibility}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-teal-300 text-xs font-medium transition-colors shadow-sm"
                title={language === 'ar' ? 'إخفاء الشريط العلوي وتوسيع الشاشة (Alt+N)' : 'Slide up navigation header (Alt+N)'}
              >
                <ChevronUp className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-[11px] font-medium hidden md:inline">{t('slideUpNavbar')}</span>
              </button>
            )}

            {/* Quick Submit Report Button */}
            <button
              onClick={onOpenNewReport}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg shadow-md shadow-teal-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t('reportIncident')}</span>
              <span className="sm:hidden">{language === 'ar' ? 'إبلاغ' : 'Report'}</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                ref={notifTriggerRef}
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowRoleMenu(false);
                }}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title={t('notifications')}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifMenu && (
                <div
                  ref={notifDropdownRef}
                  tabIndex={-1}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setShowNotifMenu(false);
                    }
                  }}
                  className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-w-sm bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 focus:outline-none`}
                >
                  <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-teal-400" />
                      <span className="font-semibold text-sm">{t('notifications')}</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                      >
                        {t('markAllRead')}
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-400">
                        {t('noNotifications')}
                      </div>
                    ) : (
                      notifications.slice(0, 6).map(n => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-800/80 transition-colors ${
                            !n.isRead ? 'bg-teal-950/30 border-l-2 border-teal-500' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-200">{n.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sign In / Sign Up Direct Quick Button */}
            <button
              onClick={() => onOpenAuthModal?.('signin')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors shadow-sm"
              title={language === 'ar' ? 'تسجيل الدخول / إنشاء حساب جديد' : 'Sign In / Register'}
            >
              <LogIn className="w-3.5 h-3.5 text-teal-400" />
              <span>{language === 'ar' ? 'دخول / تسجيل' : 'Login / Register'}</span>
            </button>

            {/* User Profile & Account Menu */}
            <div className="relative">
              <button
                ref={roleTriggerRef}
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowNotifMenu(false);
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-left transition-colors"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-teal-500/50"
                  />
                ) : (
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-inner ${
                      currentUser.role === 'ADMINISTRATOR'
                        ? 'bg-purple-600 text-white'
                        : currentUser.role === 'HEALTH_OFFICER'
                        ? 'bg-teal-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {currentUser.role === 'ADMINISTRATOR'
                      ? language === 'ar' ? 'إداري' : 'ADM'
                      : currentUser.role === 'HEALTH_OFFICER'
                      ? language === 'ar' ? 'صحي' : 'OFF'
                      : language === 'ar' ? 'مواطن' : 'CIT'}
                  </div>
                )}

                <div className="hidden md:block">
                  <div className="text-xs font-semibold text-slate-200 leading-none">{currentUser.name}</div>
                  <div className="text-[10px] text-teal-400 font-medium leading-none mt-1">
                    {currentUser.role === 'ADMINISTRATOR'
                      ? t('administrator')
                      : currentUser.role === 'HEALTH_OFFICER'
                      ? t('healthOfficer')
                      : t('citizenReporter')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* User Dropdown Menu */}
              {showRoleMenu && (
                <div
                  ref={roleDropdownRef}
                  tabIndex={-1}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setShowRoleMenu(false);
                    }
                  }}
                  className={`absolute ${
                    isRtl ? 'left-0' : 'right-0'
                  } mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-xs bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 focus:outline-none max-h-[85vh] overflow-y-auto`}
                >
                  {/* Current User Card */}
                  <div className="p-3 bg-slate-800/70 border border-slate-700/80 rounded-xl mb-3">
                    <div className="flex items-center gap-3">
                      {currentUser.avatarUrl ? (
                        <img
                          src={currentUser.avatarUrl}
                          alt={currentUser.name}
                          className="w-11 h-11 rounded-xl object-cover ring-2 ring-teal-500/50"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-sm">
                          {currentUser.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{currentUser.name}</div>
                        <div className="text-[11px] text-teal-300 font-mono truncate">{currentUser.email}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-teal-400" />
                          <span>{translateDistrict(currentUser.district)}</span>
                          {currentUser.badgeNumber && <span>• #{currentUser.badgeNumber}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Edit Profile Action Button */}
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onOpenProfileModal?.();
                      }}
                      className="mt-3 w-full py-2 px-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{t('editProfileBtn')}</span>
                    </button>
                  </div>

                  {/* Auth Actions: Sign In or Register */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onOpenAuthModal?.('signin');
                      }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5 text-teal-400" />
                      <span>{t('signInTitle')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onOpenAuthModal?.('signup');
                      }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{t('createAccountBtn')}</span>
                    </button>
                  </div>

                  {/* Switch Demo Accounts / Roles */}
                  <div className="px-2 py-1 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {t('demoRoleSwitcher')}
                  </div>

                  <div className="space-y-1 mt-1">
                    {/* Citizen Account */}
                    <button
                      onClick={() => {
                        switchRole('CITIZEN', 'usr-cit-1');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left rtl:text-right p-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                        currentUser.role === 'CITIZEN' ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                        {language === 'ar' ? 'مواطن' : 'CIT'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-100 truncate">{language === 'ar' ? 'المواطن: رامي حداد' : 'Citizen: Rami Haddad'}</div>
                        <div className="text-[10px] text-slate-400 truncate">{language === 'ar' ? 'حي التل • إبلاغ ومتابعة' : 'Al-Tal District • Report'}</div>
                      </div>
                    </button>

                    {/* Health Officer Account */}
                    <button
                      onClick={() => {
                        switchRole('HEALTH_OFFICER', 'usr-off-1');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left rtl:text-right p-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                        currentUser.role === 'HEALTH_OFFICER' ? 'bg-teal-600/20 border border-teal-500/40 text-teal-300' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                        {language === 'ar' ? 'مراقب' : 'OFF'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-100 truncate">{language === 'ar' ? 'د. طارق الحج' : 'Officer: Dr. Tariq Al-Hajj'}</div>
                        <div className="text-[10px] text-slate-400 truncate">{language === 'ar' ? 'رئيس الترصد الوبائي • كشف وفرز' : 'Epidemiology Lead • Triage'}</div>
                      </div>
                    </button>

                    {/* Administrator Account */}
                    <button
                      onClick={() => {
                        switchRole('ADMINISTRATOR', 'usr-admin-1');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left rtl:text-right p-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                        currentUser.role === 'ADMINISTRATOR' ? 'bg-purple-600/20 border border-purple-500/40 text-purple-300' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                        {language === 'ar' ? 'إدارة' : 'ADM'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-100 truncate">{language === 'ar' ? 'د. نبيل صباغ' : 'Admin: Dr. Nabil Sabbagh'}</div>
                        <div className="text-[10px] text-slate-400 truncate">{language === 'ar' ? 'مدير الرقابة الصحية • تحكم كامل' : 'Municipal Health Director'}</div>
                      </div>
                    </button>
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-2 mt-2 border-t border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('signOut')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Centered Pull-Up Handle on bottom border */}
      {onToggleVisibility && (
        <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
          <button
            onClick={onToggleVisibility}
            className="flex items-center justify-center px-4 py-0.5 rounded-b-lg bg-slate-900/95 hover:bg-slate-800/95 border-b border-x border-slate-700/80 hover:border-teal-500/80 text-slate-400 hover:text-teal-300 shadow-md transition-all group cursor-pointer"
            title={language === 'ar' ? 'طي الشريط العلوي (Alt+N)' : 'Slide up navigation header (Alt+N)'}
            aria-label="Slide up navigation header"
          >
            <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform text-slate-400 group-hover:text-teal-300" />
          </button>
        </div>
      )}
    </header>
  );
};
