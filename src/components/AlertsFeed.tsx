import React, { useState, useEffect } from 'react';
import { Alert } from '../utils/sampleData';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { alertService } from '../services/alertService';
import { getRiskColor, formatDateTime } from '../utils/helper';
import { BellRing, ShieldAlert, CheckCircle2, AlertTriangle, Clock, MapPin, UserCheck, Eye, RefreshCw } from 'lucide-react';
import { SkeletonAlertItem } from './common/Skeleton';

interface AlertsFeedProps {
  alerts: Alert[];
  onRefresh: () => void;
  onSelectReport?: (reportId: string) => void;
}

export const AlertsFeed: React.FC<AlertsFeedProps> = ({ alerts, onRefresh, onSelectReport }) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const {
    t,
    translateDistrict,
    translateRisk,
    translateAlertTitle,
    translateAlertDesc,
    language,
    isRtl
  } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const handleRefreshFeed = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onRefresh();
    }, 400);
  };

  const handleAcknowledge = (alertId: string) => {
    alertService.acknowledgeAlert(alertId, currentUser);
    showToast(
      language === 'ar'
        ? `تم استلام وتأكيد التنبيه بواسطة ${currentUser.name}`
        : `Alert acknowledged by ${currentUser.name}`
    );
    onRefresh();
  };

  const handleResolve = (alertId: string) => {
    alertService.resolveAlert(alertId);
    showToast(
      language === 'ar'
        ? 'تم تحديث حالة التنبيه إلى تمت المعالجة.'
        : 'Alert status set to RESOLVED.'
    );
    onRefresh();
  };

  const filtered = alerts.filter(a => {
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Feed Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t('surveillanceAlertsFeed')}</h2>
            <p className="text-xs text-slate-400">{t('automatedTriageTriggers')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleRefreshFeed}
            title={language === 'ar' ? 'تحديث الإشارات' : 'Refresh Alerts'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === 'ALL' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t('allAlerts')} ({alerts.length})
          </button>
          <button
            onClick={() => setFilterStatus('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === 'ACTIVE' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t('activeAlertsCount')} ({alerts.filter(a => a.status === 'ACTIVE').length})
          </button>
          <button
            onClick={() => setFilterStatus('ACKNOWLEDGED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === 'ACKNOWLEDGED' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t('acknowledgedAlerts')}
          </button>
          <button
            onClick={() => setFilterStatus('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === 'RESOLVED' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t('resolvedAlerts')}
          </button>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <SkeletonAlertItem />
            <SkeletonAlertItem />
            <SkeletonAlertItem />
            <SkeletonAlertItem />
          </>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-sm">
            {language === 'ar' ? 'لا توجد تنبيهات تطابق هذا الفلتر.' : `No alerts found under filter "${filterStatus}".`}
          </div>
        ) : (
          filtered.map(alert => {
            const riskVisual = getRiskColor(alert.riskLevel);
            const isOfficerOrAdmin = currentUser.role === 'HEALTH_OFFICER' || currentUser.role === 'ADMINISTRATOR';
            const localizedTitle = translateAlertTitle(alert.title, alert.alertCode);
            const localizedDesc = translateAlertDesc(alert.description, alert.alertCode);
            const localizedArea = translateDistrict(alert.area);

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all ${
                  alert.status === 'ACTIVE'
                    ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40 shadow-lg'
                    : alert.status === 'ACKNOWLEDGED'
                    ? 'bg-slate-900 border-amber-500/30'
                    : 'bg-slate-900 border-slate-800 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {alert.alertCode}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${riskVisual.badge}`}>
                      {translateRisk(alert.riskLevel)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      alert.status === 'ACTIVE'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : alert.status === 'ACKNOWLEDGED'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    }`}>
                      {alert.status === 'ACTIVE' ? t('activeAlertsCount') : alert.status === 'ACKNOWLEDGED' ? t('acknowledgedAlerts') : t('resolvedAlerts')}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDateTime(alert.createdAt)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1.5">{localizedTitle}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{localizedDesc}</p>

                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      {localizedArea}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                      {alert.assignedOfficer.name} ({alert.assignedOfficer.badgeNumber})
                    </span>
                  </div>

                  {/* Actions for Health Officers & Admins */}
                  {isOfficerOrAdmin && (
                    <div className="flex items-center gap-2">
                      {alert.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('acknowledge')}</span>
                        </button>
                      )}

                      {alert.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('resolve')}</span>
                        </button>
                      )}

                      {alert.relatedReportId && onSelectReport && (
                        <button
                          onClick={() => onSelectReport(alert.relatedReportId!)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('inspect')}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
