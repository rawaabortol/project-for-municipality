import React, { useState, useEffect } from 'react';
import { Cluster } from '../utils/sampleData';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { clusterService } from '../services/clusterService';
import { Radio, RefreshCw, AlertTriangle, ShieldCheck, MapPin, Users, Clock, ArrowUpRight } from 'lucide-react';
import { getRiskColor, formatDateTime } from '../utils/helper';
import { SkeletonClusterCard } from './common/Skeleton';

interface ClusterMonitorProps {
  clusters: Cluster[];
  onSelectReportNumber?: (reportNum: string) => void;
  onRefresh: () => void;
}

export const ClusterMonitor: React.FC<ClusterMonitorProps> = ({ clusters, onSelectReportNumber, onRefresh }) => {
  const { showToast } = useNotifications();
  const {
    t,
    translateCategory,
    translateDistrict,
    translateRisk,
    translateCluster,
    language,
    isRtl
  } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const updated = clusterService.triggerScan();
      setIsScanning(false);
      showToast(
        language === 'ar'
          ? `اكتمل مسح البؤر الوبائية! رصد ومتابعة ${updated.length} بؤر نشطة في طرابلس.`
          : `Cluster scan complete! ${updated.length} active public health clusters monitored across Tripoli.`
      );
      onRefresh();
    }, 1000);
  };


  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-teal-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              {language === 'ar' ? 'الترصد الوبائي المكاني' : 'Epidemiological Surveillance'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">{t('clusterEngineTitle')}</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            {t('clusterEngineDesc')}
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? t('scanningTripoliGrid') : t('runClusterScan')}</span>
        </button>
      </div>

      {/* Cluster Cards Grid */}
      {isLoading || isScanning ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonClusterCard />
          <SkeletonClusterCard />
          <SkeletonClusterCard />
          <SkeletonClusterCard />
          <SkeletonClusterCard />
          <SkeletonClusterCard />
        </div>
      ) : clusters.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-lg space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mx-auto">
            <Radio className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">
            {language === 'ar' ? 'لا توجد بؤر وبائية مرصودة حالياً' : 'No Active Epidemiological Clusters'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {language === 'ar'
              ? 'يقوم محرك الترصد التلقائي بتحليل البلاغات جغرافياً وزمنياً باستمرار للتعرف على أي تفشيات محتملة فور تقديم البلاغات.'
              : 'The automated surveillance engine continuously analyzes spatio-temporal clusters as complaints are submitted across Tripoli.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clusters.map(cls => {
          const riskVisual = getRiskColor(cls.riskLevel);
          const localizedCategory = translateCluster(cls.categoryName);
          const localizedDistrict = translateDistrict(cls.district);

          return (
            <div
              key={cls.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {cls.clusterCode}
                  </span>
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${riskVisual.badge}`}>
                    {translateRisk(cls.riskLevel)}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white leading-snug">{localizedCategory}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="font-semibold text-slate-200">{localizedDistrict}</span>
                    <span>• {language === 'ar' ? `نطاق ~${cls.radiusMeters}م` : `Radius ~${cls.radiusMeters}m`}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-800/60 rounded-xl text-xs border border-slate-700/60">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t('interrelatedIncidents')}</span>
                    <span className="text-base font-bold text-teal-300">
                      {cls.reportCount} {language === 'ar' ? 'بلاغات' : 'Incidents'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t('estimatedAffected')}</span>
                    <span className="text-base font-bold text-rose-300">
                      ~{cls.totalAffected} {t('citizens')}
                    </span>
                  </div>
                </div>

                {/* Related Reports pills */}
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">{t('correlatedIncidents')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.reportNumbers.slice(0, 6).map(rNum => (
                      <button
                        key={rNum}
                        onClick={() => onSelectReportNumber && onSelectReportNumber(rNum)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-teal-600 hover:text-white border border-slate-700 font-mono text-[10px] text-slate-300 transition-colors flex items-center gap-1"
                      >
                        <span>{rNum}</span>
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {formatDateTime(cls.detectedAt)}
                </span>
                <span className="text-teal-400 text-[11px] font-semibold">
                  {language === 'ar' ? 'نافذة رصد 48-72 س' : '48-72h Window'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
