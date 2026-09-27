import React, { useState, useEffect } from 'react';
import { dbInstance } from '../../utils/axios';
import { Investigation, Report } from '../../utils/sampleData';
import { formatDateTime } from '../../utils/helper';
import { useLanguage } from '../../context/LanguageContext';
import { Stethoscope, CheckCircle2, AlertCircle, Clock, FileText, FlaskConical, Search, ExternalLink, RefreshCw } from 'lucide-react';
import { SkeletonInvestigationCard } from './common/Skeleton';

interface InvestigationsViewProps {
  onSelectReport: (report: Report) => void;
  onOpenNewInvestigation: (report: Report) => void;
}

export const InvestigationsView: React.FC<InvestigationsViewProps> = ({ onSelectReport, onOpenNewInvestigation }) => {
  const {
    t,
    translateCategory,
    translateDistrict,
    translateFindings,
    translateActions,
    translateRecommendations,
    translateSamples,
    language,
    isRtl
  } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [filterResult, setFilterResult] = useState('ALL');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 400);
  };

  const investigations = dbInstance.investigations;

  const filtered = investigations.filter(inv => {
    if (filterResult !== 'ALL' && inv.result !== filterResult) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{t('investigationsTitle')}</h1>
            <p className="text-xs text-slate-400">{t('investigationsDesc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleRefresh}
            title={language === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
          <button
            onClick={() => setFilterResult('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterResult === 'ALL' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t('allResults')} ({investigations.length})
          </button>
          <button
            onClick={() => setFilterResult('Confirmed')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterResult === 'Confirmed' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t('confirmedHazard')}
          </button>
          <button
            onClick={() => setFilterResult('Resolved')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterResult === 'Resolved' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t('remediatedStatus')}
          </button>
        </div>
      </div>

      {/* Investigations Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SkeletonInvestigationCard />
          <SkeletonInvestigationCard />
          <SkeletonInvestigationCard />
          <SkeletonInvestigationCard />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-lg space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mx-auto">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">
            {language === 'ar' ? 'لا توجد تحقيقات ميدانية مسجلة حالياً' : 'No Field Investigations Registered'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {language === 'ar'
              ? 'عند إسناد البلاغات الميدانية وبدء الفحوصات المخبرية، ستظهر ملفات التحقيق والنتائج وتوصيات المفتشين هنا.'
              : 'When inspectors are assigned to incidents and lab samples are collected, inspection dossiers and remedial actions will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(inv => {
          const rep = dbInstance.reports.find(r => r.reportNumber === inv.reportNumber);
          const findingsText = translateFindings(inv.findings, inv.investigationCode);
          const actionsText = translateActions(inv.actionsTaken, inv.investigationCode);
          const recsText = translateRecommendations(inv.recommendations, inv.investigationCode);
          const samplesText = translateSamples(inv.samplesCollected, inv.investigationCode);

          return (
            <div
              key={inv.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                      {inv.investigationCode}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {language === 'ar' ? 'المرجع: ' : 'Ref: '}#{inv.reportNumber}
                    </span>
                  </div>

                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    inv.result === 'Confirmed'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : inv.result === 'Resolved'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {inv.result === 'Confirmed' ? t('confirmedHazard') : inv.result === 'Resolved' ? t('remediatedStatus') : inv.result}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{t('fieldFindings')}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                    {findingsText}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-teal-300">{t('containmentActions')}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{actionsText}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-300">{t('officialDirective')}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{recsText}</p>
                </div>

                {inv.samplesCollected && (
                  <div className="text-[11px] text-teal-400/90 flex items-center gap-1.5 pt-1">
                    <FlaskConical className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{t('samplesLabel')} {samplesText}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                <div>
                  <span>{t('fieldOfficer')} </span>
                  <strong className="text-slate-200">{inv.officer.name}</strong>
                  <span className="text-slate-400 font-mono text-[10px]"> ({inv.officer.badgeNumber})</span>
                </div>

                <div className="flex items-center gap-2">
                  {rep && rep.status === 'IN_INVESTIGATION' && (
                    <button
                      onClick={() => onOpenNewInvestigation(rep)}
                      className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{language === 'ar' ? 'إنهاء التفتيش' : 'Finalize Inspection'}</span>
                    </button>
                  )}
                  {rep && (
                    <button
                      onClick={() => onSelectReport(rep)}
                      className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <span>{t('inspectLinkedIncident')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
