import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CitizenDashboard } from './components/CitizenDashboard';
import { OfficerDashboard } from './components/OfficerDashboard';
import { TripoliMap } from './components/TripoliMap';
import { ReportsManagement } from './components/ReportsManagement';
import { InvestigationsView } from './components/InvestigationsView';
import { ClusterMonitor } from './components/ClusterMonitor';
import { AlertsFeed } from './components/AlertsFeed';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { AdminUsersManagement } from './components/AdminUsersManagement';
import { AdminCategoryManagement } from './components/AdminCategoryManagement';
import { AuditLogsView } from './components/AuditLogsView';
import { PublicPortal } from './components/PublicPortal';
import { AdminSystemSettings } from './components/AdminSystemSettings';
import { ReportFormModal } from './components/ReportFormModal';
import { ReportDetailsModal } from './components/ReportDetailsModal';
import { InvestigationModal } from './components/InvestigationModal';
import { ExportReportModal } from './components/ExportReportModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { dbInstance } from './utils/axios';
import { Report } from './utils/sampleData';

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const { t, language, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isNewReportOpen, setIsNewReportOpen] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [investigationReport, setInvestigationReport] = useState<Report | null>(null);
  const [isExportReportOpen, setIsExportReportOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState<boolean>(true);

  // Keyboard shortcut (Alt+N) to toggle navbar slide up/down independently from scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setIsNavbarVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Force re-render state on database updates
  const [, setTick] = useState(0);
  const handleRefresh = () => setTick(t => t + 1);

  const unreadAlerts = dbInstance.alerts.filter(a => a.status === 'ACTIVE').length;

  const handleOpenInvestigation = (report: Report) => {
    setInvestigationReport(report);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (currentUser.role === 'CITIZEN') {
          return (
            <CitizenDashboard
              onOpenNewReport={() => setIsNewReportOpen(true)}
              onSelectReport={rep => setSelectedReport(rep)}
              onViewAllReports={() => setActiveTab('my-reports')}
            />
          );
        } else {
          return (
            <OfficerDashboard
              onSelectReport={rep => setSelectedReport(rep)}
              onNavigateTab={tab => {
                if (tab === 'export-report') {
                  setIsExportReportOpen(true);
                } else {
                  setActiveTab(tab);
                }
              }}
            />
          );
        }

      case 'submit-report':
        return (
          <div className="max-w-3xl mx-auto py-4">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white">{t('submitIncident')}</h1>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ar' ? 'إخطار مباشر للرقابة الصحية في بلدية طرابلس الكبرى' : 'Directly notify Tripoli Health Directorate'}
              </p>
            </div>
            <button
              onClick={() => setIsNewReportOpen(true)}
              className="w-full py-8 bg-teal-600/20 border-2 border-dashed border-teal-500 rounded-2xl text-teal-300 font-bold hover:bg-teal-600/30 transition-all text-sm flex items-center justify-center gap-2"
            >
              <span>{language === 'ar' ? 'انقر هنا لفتح استمارة تقديم البلاغ الصحي في طرابلس' : 'Click to Launch Tripoli Incident Submission Form'}</span>
            </button>
          </div>
        );

      case 'my-reports':
      case 'reports-management':
        return (
          <ReportsManagement
            onSelectReport={rep => setSelectedReport(rep)}
            onOpenNewReport={() => setIsNewReportOpen(true)}
          />
        );

      case 'tripoli-map':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-white">
                  {language === 'ar' ? 'خريطة الرصد الجغرافي والوبائي التفاعلية لطرابلس' : 'Tripoli Public Health Geographic Surveillance Map'}
                </h1>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'تتبع لحظي للبؤر، مستويات الخطورة، والنقاط الصحية والبيئية الساخنة' : 'Real-time incident clustering, risk levels, and sanitary hot-spots'}
                </p>
              </div>
            </div>
            <TripoliMap
              reports={dbInstance.reports}
              clusters={dbInstance.clusters}
              onSelectReport={rep => setSelectedReport(rep)}
            />
          </div>
        );

      case 'investigations':
        return (
          <InvestigationsView
            onSelectReport={rep => setSelectedReport(rep)}
            onOpenNewInvestigation={rep => setInvestigationReport(rep)}
          />
        );

      case 'clusters':
        return (
          <ClusterMonitor
            clusters={dbInstance.clusters}
            onSelectReportNumber={rNum => {
              const r = dbInstance.reports.find(rep => rep.reportNumber === rNum);
              if (r) setSelectedReport(r);
            }}
            onRefresh={handleRefresh}
          />
        );

      case 'alerts':
        return (
          <AlertsFeed
            alerts={dbInstance.alerts}
            onRefresh={handleRefresh}
            onSelectReport={repId => {
              const r = dbInstance.reports.find(rep => rep.id === repId);
              if (r) setSelectedReport(r);
            }}
          />
        );

      case 'analytics':
        return <AnalyticsCharts />;

      case 'users-management':
        return <AdminUsersManagement />;

      case 'categories-management':
        return <AdminCategoryManagement />;

      case 'system-settings':
        return <AdminSystemSettings onRefresh={handleRefresh} />;

      case 'audit-logs':
        return <AuditLogsView />;

      case 'public-portal':
        return <PublicPortal onOpenReport={() => setIsNewReportOpen(true)} />;

      case 'export-report':
        return (
          <div className="py-8 text-center space-y-4">
            <h2 className="text-xl font-bold text-white">{t('exportDossier')}</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {language === 'ar' ? 'توليد وتصدير التقرير الوبائي المعتمد لبلدية طرابلس الكبرى بصيغة رسمية.' : 'Generate and download the certified Tripoli Municipal Health Directorate Epidemiological Report.'}
            </p>
            <button
              onClick={() => setIsExportReportOpen(true)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
            >
              {language === 'ar' ? 'معاينة التقرير الرسمي والطباعة' : 'Open Dossier Preview & Print'}
            </button>
          </div>
        );

      default:
        return (
          <OfficerDashboard
            onSelectReport={rep => setSelectedReport(rep)}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        );
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white relative">
      {/* Top Navigation - Smooth Slide Down/Up */}
      <Navbar
        onOpenNewReport={() => setIsNewReportOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode || 'signin');
          setIsAuthModalOpen(true);
        }}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isVisible={isNavbarVisible}
        onToggleVisibility={() => setIsNavbarVisible(v => !v)}
      />

      {/* Floating Slide-Down Tab when Navbar is hidden */}
      {!isNavbarVisible && (
        <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
          <button
            onClick={() => setIsNavbarVisible(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/95 hover:bg-slate-800/95 backdrop-blur-md border border-teal-500/60 hover:border-teal-400 text-teal-300 hover:text-white shadow-2xl text-xs font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 group ring-2 ring-teal-500/20"
            title={language === 'ar' ? 'إظهار الشريط العلوي (Alt+N)' : 'Slide down navigation (Alt+N)'}
          >
            <ChevronDown className="w-4 h-4 text-teal-400 group-hover:translate-y-0.5 transition-transform" />
            <span>{t('slideDownNavbar')}</span>
            <span className="hidden sm:inline-block text-[10px] text-teal-400/80 bg-teal-950/70 px-1.5 py-0.5 rounded border border-teal-500/30">
              Alt+N
            </span>
          </button>
        </div>
      )}

      {/* Main Layout (Sidebar + Body) with animated top offset - Both scroll independently */}
      <div className={`flex-1 flex w-full max-w-7xl mx-auto min-h-0 overflow-hidden transition-all duration-300 ease-in-out ${isNavbarVisible ? 'pt-16' : 'pt-2'}`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={tab => {
            if (tab === 'export-report') {
              setIsExportReportOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          unreadAlertCount={unreadAlerts}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          isNavbarVisible={isNavbarVisible}
        />

        {/* Main Content Area - Independent Scroll Container */}
        <main className="flex-1 h-full min-h-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      <ReportFormModal
        isOpen={isNewReportOpen}
        onClose={() => setIsNewReportOpen(false)}
        onSuccess={handleRefresh}
      />

      <ReportDetailsModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onOpenInvestigation={rep => handleOpenInvestigation(rep)}
        onRefresh={handleRefresh}
      />

      <InvestigationModal
        report={investigationReport}
        isOpen={!!investigationReport}
        onClose={() => setInvestigationReport(null)}
        onSuccess={handleRefresh}
      />

      <ExportReportModal
        isOpen={isExportReportOpen}
        onClose={() => setIsExportReportOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <MainApp />
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
