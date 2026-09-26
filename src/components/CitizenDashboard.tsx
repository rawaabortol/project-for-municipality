import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dbInstance } from '../utils/axios';
import { Report } from '../utils/sampleData';
import { getRiskColor, getStatusBadge, formatDateTime } from '../utils/helper';
import { PlusCircle, FileText, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Info, RefreshCw } from 'lucide-react';
import { SkeletonMetricCard, SkeletonReportCard, Skeleton } from './common/Skeleton';

interface CitizenDashboardProps {
  onOpenNewReport: () => void;
  onSelectReport: (report: Report) => void;
  onViewAllReports: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  onOpenNewReport,
  onSelectReport,
  onViewAllReports
}) => {
  const { currentUser } = useAuth();
  const { t, translateCategory, translateDistrict, translateStatus, translateRisk, translateTitle, language, isRtl } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 400);
  };

  const allReports = dbInstance.reports;
  const myReports = allReports.filter(r => r.citizen.userId === currentUser.id);

  // Statistics for this citizen
  const resolvedCount = myReports.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length;
  const inProgressCount = myReports.filter(r => r.status === 'IN_INVESTIGATION' || r.status === 'VERIFIED').length;


  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl border border-teal-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'بوابة المواطن لرصد الصحة العامة - طرابلس' : 'Tripoli Citizen Public Health Portal'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {language === 'ar' ? `أهلاً بك، ${currentUser.name}` : `Welcome back, ${currentUser.name}`}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            {language === 'ar'
              ? 'أبلغ عن المخاطر الصحية، تلوث المياه، سلامة الأغذية والمشاكل البيئية مباشرة لمديرية الصحة في بلدية طرابلس، وتابع تقدم التحقيقات الميدانية لحظة بلحظة.'
              : 'Report sanitary, water, food safety, and environmental concerns directly to the Tripoli Municipal Health Directorate. Track municipal field investigations in real-time.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewReport}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-teal-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('submitIncident')}</span>
            </button>
            <button
              onClick={onViewAllReports}
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>{language === 'ar' ? `متابعة بلاغاتي (${myReports.length})` : `Track My Submissions (${myReports.length})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Citizen Summary Counters */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">{language === 'ar' ? 'البلاغات المقدمة من قبلي' : 'My Submitted Reports'}</span>
              <div className="text-2xl font-black text-white">{myReports.length}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">{language === 'ar' ? 'قيد الكشف والتحقيق' : 'Under Active Inspection'}</span>
              <div className="text-2xl font-black text-amber-400">{inProgressCount}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">{language === 'ar' ? 'تم حلها ومعالجتها' : 'Resolved & Remediated'}</span>
              <div className="text-2xl font-black text-teal-400">{resolvedCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Citizen Submissions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-400" />
            {language === 'ar' ? 'أحدث بلاغاتي ومسار المعالجة' : 'My Recent Incident Reports & Tracking'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              title={language === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
            </button>
            {!isLoading && myReports.length > 3 && (
              <button onClick={onViewAllReports} className="text-xs text-teal-400 hover:underline">
                {language === 'ar' ? `عرض الكل (${myReports.length})` : `View All (${myReports.length})`}
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <SkeletonReportCard />
            <SkeletonReportCard />
            <SkeletonReportCard />
          </div>
        ) : myReports.length === 0 ? (
          <div className="p-8 text-center bg-slate-800/40 rounded-xl border border-slate-800 text-slate-400 text-sm space-y-3">
            <Info className="w-8 h-8 text-teal-400 mx-auto" />
            <p>{language === 'ar' ? 'لم تقم بتقديم أي بلاغ صحي حتى الآن.' : "You haven't filed any public health complaints yet."}</p>
            <button
              onClick={onOpenNewReport}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              {language === 'ar' ? 'إبلاغ عن مشكلة في حيك' : 'Report an Issue in Your Neighborhood'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myReports.slice(0, 4).map(report => {
              const riskVisual = getRiskColor(report.riskLevel);
              const statusVisual = getStatusBadge(report.status);

              return (
                <div
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-4 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-300">#{report.reportNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusVisual.badge}`}>
                        {translateStatus(report.status)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${riskVisual.badge}`}>
                        {translateRisk(report.riskLevel)}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {translateTitle(report.title, report.category.name, report.location.district)}
                    </div>
                    <div className="text-xs text-slate-400">
                      📍 {translateDistrict(report.location.district)} • {formatDateTime(report.incidentDate)}
                    </div>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <span className="text-xs text-teal-400 font-semibold hover:underline flex items-center gap-1">
                      <span>{language === 'ar' ? 'متابعة مسار الإجراءات' : 'View Workflow'}</span>
                      <span className={isRtl ? 'rotate-180 inline-block' : ''}>&rarr;</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tripoli Public Health Advisory Bulletin */}
      <div className="p-5 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl text-slate-200 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>{language === 'ar' ? 'توجيه صحي وبلدي عاجل: منطقة طرابلس الكبرى' : 'Active Municipal Health Advisory: Greater Tripoli Area'}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {language === 'ar'
            ? 'نظراً لأعمال صيانة شبكة المياه الرئيسية في قطاعات شارع سوريا ومحيط نهر أبو علي، يُطلب من أهالي باب التبانة والأحياء المجاورة غلي مياه الصنبور لمدة 3 دقائق قبل الاستخدام للشرب أو الطهي. تتوفر أجهزة ومعدات الفحص الميكروبي مجاناً لدى مركز الرقابة الصحية في الضم والفرز.'
            : 'Due to ongoing water infrastructure repairs along Syria Street and Abu Ali River sectors, residents in Bab Al-Tabbaneh and adjacent quarters are advised to boil tap water for 3 minutes before domestic consumption. Free test kits are available at the Tripoli Health Directorate center in Dam w Farez.'}
        </p>
      </div>
    </div>
  );
};
