import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { dbInstance } from '../utils/axios';
import { Report } from '../utils/sampleData';
import { getRiskColor, getStatusBadge, formatDateTime } from '../utils/helper';
import { TripoliMap } from './TripoliMap';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldAlert,
  AlertTriangle,
  Stethoscope,
  CheckCircle2,
  MapPin,
  Clock,
  Radio,
  FileSpreadsheet,
  ArrowRight,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { SkeletonMetricCard, SkeletonMap, SkeletonClusterCard, SkeletonTableRow } from './common/Skeleton';

interface OfficerDashboardProps {
  onSelectReport: (report: Report) => void;
  onNavigateTab: (tab: string) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  onSelectReport,
  onNavigateTab
}) => {
  const { t, translateCategory, translateDistrict, translateStatus, translateRisk, translateTitle, translateCluster, language, isRtl } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 400);
  };

  const stats = dashboardService.getStats();
  const reports = dbInstance.reports;
  const clusters = dbInstance.clusters;

  // Unreviewed or critical triage queue
  const triageQueue = reports.filter(
    r => (r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW' || r.riskLevel === 'CRITICAL') && r.status !== 'RESOLVED' && r.status !== 'CLOSED'
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Metric Counters Grid (Objective 10) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium block">{t('totalReports')}</span>
            <div className="text-2xl font-black text-white mt-1">{stats.totalReports}</div>
            <span className="text-[10px] text-teal-400 mt-1 block">{t('cityJurisdiction')}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium block">{t('reportsToday')}</span>
            <div className="text-2xl font-black text-teal-300 mt-1">{stats.reportsToday}</div>
            <span className="text-[10px] text-slate-400 mt-1 block">{stats.reportsThisWeek} {language === 'ar' ? 'هذا الأسبوع' : 'this week'}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium block">{t('criticalRisk')}</span>
            <div className="text-2xl font-black text-rose-500 mt-1">{stats.criticalCount}</div>
            <span className="text-[10px] text-rose-400/80 mt-1 block">{t('immediateDispatch')}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium block">{t('highRisk')}</span>
            <div className="text-2xl font-black text-orange-400 mt-1">{stats.highCount}</div>
            <span className="text-[10px] text-orange-300/80 mt-1 block">{t('priorityInspection')}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium block">{t('underInspection')}</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{stats.underInvestigationCount}</div>
            <span className="text-[10px] text-amber-300/80 mt-1 block">{t('activeFieldTeams')}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium block">{t('resolutionRate')}</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{stats.resolutionRate}%</div>
            <span className="text-[10px] text-slate-400 mt-1 block">{stats.resolvedCount} {t('remediated')}</span>
          </div>
        </div>
      )}

      {/* Row 2: Live Tripoli Map & Cluster Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map (2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              {t('liveTripoliView')}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                title={language === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
              </button>
              <button
                onClick={() => onNavigateTab('tripoli-map')}
                className="text-xs text-teal-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{t('fullScreenMap')}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <SkeletonMap height="h-[440px]" />
          ) : (
            <TripoliMap
              reports={reports}
              clusters={clusters}
              onSelectReport={onSelectReport}
              heightClass="h-[440px]"
            />
          )}
        </div>

        {/* Active Clusters & Quick Alerts (1 Column) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-teal-400" />
                {t('detectedClusters')}
              </h3>
              <button
                onClick={() => onNavigateTab('clusters')}
                className="text-[11px] text-teal-400 hover:underline"
              >
                {language === 'ar' ? `عرض الكل (${clusters.length})` : `View All (${clusters.length})`}
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-2.5">
                <SkeletonClusterCard />
                <SkeletonClusterCard />
              </div>
            ) : clusters.length === 0 ? (
              <div className="py-8 text-center bg-slate-800/40 rounded-xl border border-slate-800/80 px-4 space-y-1.5">
                <Radio className="w-6 h-6 text-slate-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">
                  {language === 'ar' ? 'لا توجد بؤر وبائية مرصودة حالياً' : 'No active clusters detected'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {language === 'ar' ? 'يقوم النظام بمسح البلاغات تلقائياً' : 'System scans reports automatically'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {clusters.slice(0, 3).map(c => {
                  const colors = getRiskColor(c.riskLevel);
                  return (
                    <div
                      key={c.id}
                      onClick={() => onNavigateTab('clusters')}
                      className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 cursor-pointer transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-300">{c.clusterCode}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${colors.badge}`}>
                          {translateRisk(c.riskLevel)}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white">{translateCluster(c.categoryName)}</div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>📍 {translateDistrict(c.district)}</span>
                        <span className="font-semibold text-rose-300">~{c.totalAffected} {t('citizens')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Surveillance Actions */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              {language === 'ar' ? 'إجراءات المراقب السريعة' : 'Officer Quick Actions'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigateTab('reports-management')}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left rtl:text-right border border-slate-700 transition-colors"
              >
                <div className="text-xs font-bold text-white">{t('reportTriage')}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{language === 'ar' ? 'مراجعة القائمة' : 'Review queue'}</div>
              </button>
              <button
                onClick={() => onNavigateTab('investigations')}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left rtl:text-right border border-slate-700 transition-colors"
              >
                <div className="text-xs font-bold text-white">{t('investigations')}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{language === 'ar' ? 'سجلات وتحاليل' : 'Lab logs & results'}</div>
              </button>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left rtl:text-right border border-slate-700 transition-colors"
              >
                <div className="text-xs font-bold text-white">{t('activeAlerts')}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{language === 'ar' ? 'إشارات فورية' : 'Dispatches'}</div>
              </button>
              <button
                onClick={() => onNavigateTab('export-report')}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left rtl:text-right border border-slate-700 transition-colors"
              >
                <div className="text-xs font-bold text-white">{t('exportDossier')}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{language === 'ar' ? 'تقرير جاهز للطباعة' : 'Printable brief'}</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Priority Triage Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              {t('priorityQueue')}
            </h3>
            <p className="text-xs text-slate-400">{t('awaitingTriage')}</p>
          </div>
          <button
            onClick={() => onNavigateTab('reports-management')}
            className="text-xs text-teal-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>{t('manageAllReports')}</span>
            <span className={isRtl ? 'rotate-180 inline-block' : ''}>&rarr;</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">{t('reportNumberCol')}</th>
                <th className="py-2.5 px-3">{t('categoryCol')}</th>
                <th className="py-2.5 px-3">{t('titleLocationCol')}</th>
                <th className="py-2.5 px-3">{t('riskScoreCol')}</th>
                <th className="py-2.5 px-3">{t('affectedCol')}</th>
                <th className="py-2.5 px-3">{t('statusCol')}</th>
                <th className="py-2.5 px-3 text-right rtl:text-left">{t('actionCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <>
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                </>
              ) : triageQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    <p className="font-semibold text-slate-300">
                      {language === 'ar' ? 'لا توجد بلاغات بانتظار الفرز والتدقيق حالياً.' : 'No incident reports awaiting triage at this time.'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {language === 'ar' ? 'البلاغات الجديدة المسجلة في طرابلس ستظهر هنا فور إرسالها.' : 'New complaints submitted across Tripoli will appear here.'}
                    </p>
                  </td>
                </tr>
              ) : (
                triageQueue.map(rep => {
                  const colors = getRiskColor(rep.riskLevel);
                  const statusColors = getStatusBadge(rep.status);
                  return (
                    <tr key={rep.id} className="hover:bg-slate-800/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-teal-300">{rep.reportNumber}</td>
                      <td className="py-3 px-3 text-slate-200 font-semibold">{translateCategory(rep.category.name)}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-white truncate max-w-xs">
                          {translateTitle(rep.title, rep.category.name, rep.location.district)}
                        </div>
                        <div className="text-[11px] text-slate-400">📍 {translateDistrict(rep.location.district)}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${colors.badge}`}>
                          {rep.riskScore} ({translateRisk(rep.riskLevel)})
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-300">~{rep.affectedCount} {t('people')}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColors.badge}`}>
                          {translateStatus(rep.status)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right rtl:text-left">
                        <button
                          onClick={() => onSelectReport(rep)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs transition-colors"
                        >
                          {t('inspect')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
