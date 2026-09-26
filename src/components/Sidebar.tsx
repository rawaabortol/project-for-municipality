import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDismissOnBlurOrOutside } from '../utils/useDismissOnBlurOrOutside';
import {
  LayoutDashboard,
  Map,
  FileSpreadsheet,
  Stethoscope,
  Radio,
  BellRing,
  BarChart3,
  FileDown,
  Users,
  Layers,
  History,
  Info,
  Send,
  Sliders,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadAlertCount: number;
  onOpenProfileModal?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isNavbarVisible?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertCount,
  onOpenProfileModal,
  isMobileOpen = false,
  onCloseMobile,
  isNavbarVisible = true
}) => {
  const { currentUser } = useAuth();
  const { t, language, isRtl, translateDistrict } = useLanguage();
  const role = currentUser.role;

  // Use dismiss hook for the mobile drawer container
  const mobileDrawerRef = useDismissOnBlurOrOutside<HTMLDivElement>({
    isOpen: isMobileOpen,
    onDismiss: () => onCloseMobile?.()
  });

  const citizenNav: NavItem[] = [
    { id: 'dashboard', label: t('citizenDashboard'), icon: LayoutDashboard },
    { id: 'submit-report', label: t('submitIncident'), icon: Send },
    { id: 'my-reports', label: t('myReports'), icon: FileSpreadsheet },
    { id: 'public-portal', label: t('publicPortal'), icon: Info }
  ];

  const officerNav: NavItem[] = [
    { id: 'dashboard', label: t('authorityDashboard'), icon: LayoutDashboard },
    { id: 'tripoli-map', label: t('tripoliMap'), icon: Map },
    { id: 'reports-management', label: t('reportTriage'), icon: FileSpreadsheet },
    { id: 'investigations', label: t('investigations'), icon: Stethoscope },
    { id: 'clusters', label: t('clusterDetection'), icon: Radio },
    { id: 'alerts', label: t('surveillanceAlerts'), icon: BellRing, badge: unreadAlertCount },
    { id: 'analytics', label: t('epidemiologyCharts'), icon: BarChart3 },
    { id: 'export-report', label: t('exportDossier'), icon: FileDown }
  ];

  const adminNav: NavItem[] = [
    { id: 'dashboard', label: t('adminDashboard'), icon: LayoutDashboard },
    { id: 'tripoli-map', label: t('tripoliMap'), icon: Map },
    { id: 'reports-management', label: t('allReports'), icon: FileSpreadsheet },
    { id: 'investigations', label: t('investigations'), icon: Stethoscope },
    { id: 'clusters', label: t('clusterDetection'), icon: Radio },
    { id: 'alerts', label: t('surveillanceAlerts'), icon: BellRing, badge: unreadAlertCount },
    { id: 'users-management', label: t('usersOfficers'), icon: Users },
    { id: 'categories-management', label: t('reportCategories'), icon: Layers },
    { id: 'system-settings', label: language === 'ar' ? 'إعدادات النظام والمعايير' : 'System & Risk Settings', icon: Sliders },
    { id: 'analytics', label: t('epidemiologyCharts'), icon: BarChart3 },
    { id: 'audit-logs', label: t('auditTrail'), icon: History },
    { id: 'export-report', label: t('exportDossier'), icon: FileDown }
  ];

  const navItems = role === 'ADMINISTRATOR' ? adminNav : role === 'HEALTH_OFFICER' ? officerNav : citizenNav;

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const renderContent = (isMobile: boolean = false) => (
    <div className="flex flex-col justify-between min-h-full">
      <div className="p-4 space-y-5">
        {/* Mobile Header with close button */}
        {isMobile && (
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-sm text-teal-300">
              {language === 'ar' ? 'قائمة التنقل' : 'Navigation Menu'}
            </span>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* User Card */}
        <div
          onClick={() => {
            onOpenProfileModal?.();
            if (isMobile && onCloseMobile) onCloseMobile();
          }}
          className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 hover:border-teal-500/50 flex items-center gap-3 cursor-pointer transition-all group"
          title={t('editProfileBtn')}
        >
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-9 h-9 rounded-lg object-cover ring-1 ring-teal-500/50 group-hover:ring-teal-400 shrink-0"
            />
          ) : (
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                role === 'ADMINISTRATOR' ? 'bg-purple-600' : role === 'HEALTH_OFFICER' ? 'bg-teal-600' : 'bg-blue-600'
              }`}
            >
              {currentUser.name.charAt(0)}
            </div>
          )}
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate group-hover:text-teal-300 transition-colors">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-teal-400 font-medium truncate">
              {currentUser.badgeNumber ? `${currentUser.badgeNumber} • ` : ''}
              {translateDistrict(currentUser.district)}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="text-[11px] text-slate-400">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>{language === 'ar' ? 'النطاق الإداري' : 'Jurisdiction'}</span>
            <span className="text-teal-400 font-medium">{t('cityJurisdiction')}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {language === 'ar' ? 'مديرية الصحة البلدية • وزارة الصحة العامة لبنان' : 'Municipal Health Directorate • MOPH Lebanon'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed/Docked Sidebar with independent scroll (visible on md: and up) */}
      <aside className="hidden md:flex w-64 bg-slate-900/95 ltr:border-r rtl:border-l border-slate-800 text-slate-300 flex-col shrink-0 h-full min-h-0 overflow-y-auto overflow-x-hidden">
        {renderContent(false)}
      </aside>

      {/* Mobile Responsive Slide-in Drawer with independent scroll */}
      {isMobileOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && onCloseMobile) onCloseMobile();
          }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden flex animate-in fade-in"
        >
          <div
            ref={mobileDrawerRef}
            tabIndex={-1}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node) && onCloseMobile) {
                onCloseMobile();
              }
            }}
            className={`w-72 max-w-[85vw] bg-slate-900 border-r rtl:border-r-0 rtl:border-l border-slate-800 text-slate-300 h-full overflow-y-auto shadow-2xl focus:outline-none animate-in ${
              isRtl ? 'slide-in-from-right' : 'slide-in-from-left'
            }`}
          >
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};

