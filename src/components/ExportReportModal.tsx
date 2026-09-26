import React, { useRef, useEffect } from 'react';
import { dbInstance } from '../utils/axios';
import { dashboardService } from '../services/dashboardService';
import { useLanguage } from '../context/LanguageContext';
import { formatDateTime } from '../utils/helper';
import { Printer, Download, X, Shield, FileText, CheckCircle2 } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const {
    t,
    translateCategory,
    translateDistrict,
    translateStatus,
    translateRisk,
    translateTitle,
    translateCluster,
    language,
    isRtl
  } = useLanguage();

  const stats = dashboardService.getStats();
  const criticalReports = dbInstance.reports.filter(r => r.riskLevel === 'CRITICAL').slice(0, 8);
  const clusters = dbInstance.clusters;

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 animate-in fade-in">
        {/* Controls Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <FileText className="w-5 h-5 text-teal-400" />
            <span>{t('exportDossier')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{t('printSavePDF')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div
          className="overflow-y-auto p-6 sm:p-8 flex-1 bg-white text-slate-900"
          id="printable-dossier"
          ref={printRef}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                {language === 'ar' ? 'الجمهورية اللبنانية • وزارة الصحة العامة' : 'Republic of Lebanon • Ministry of Public Health'}
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {language === 'ar' ? 'اتحاد بلديات الفيحاء • بلدية طرابلس الكبرى' : 'MUNICIPALITY OF GREATER TRIPOLI'}
              </h1>
              <div className="text-xs font-semibold text-teal-800">
                {language === 'ar' ? 'مديرية الرقابة الصحية والبيئية ووحدة الترصد الوبائي الذكي' : 'Directorate of Environmental Health & Epidemiological Surveillance'}
              </div>
            </div>

            <div className="text-right rtl:text-left text-xs text-slate-600">
              <div className="font-mono font-bold text-slate-900">DOC-TRP-EPI-{new Date().getFullYear()}-09</div>
              <div>{language === 'ar' ? 'تاريخ التوليد:' : 'Date Generated:'} {new Date().toLocaleDateString(language === 'ar' ? 'ar-LB' : 'en-US', { dateStyle: 'long' })}</div>
              <div>{language === 'ar' ? 'التصنيف: تقرير رسمي للترصد الصحي' : 'Classification: OFFICIAL SURVEILLANCE REPORT'}</div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">
                {language === 'ar' ? '1. ملخص الموقف الوبائي والصحي العام' : '1. Executive Epidemiological Summary'}
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {language === 'ar' ? (
                  <>
                    يستعرض هذا التقرير الرقابي الشامل البلاغات الصحية الواردة لحظياً، تقييمات محرك المخاطر الذكي، والبؤر المكانية المكتشفة في مدينة طرابلس، لبنان. تم رصد وتسجيل ما مجموعه <strong>{stats.totalReports} بلاغاً صحياً وبيئياً</strong> عبر منصة &quot;نبض طرابلس الصحي&quot;، منها <strong>{stats.criticalCount} بلاغات حرجة</strong> (درجة الخطورة &ge; 76). تواصل الفرق الميدانية للمراقبين الصحيين أعمال المعاينة والاحتواء بنسبة إنجاز بلغت <strong>{stats.resolutionRate}%</strong>.
                  </>
                ) : (
                  <>
                    This comprehensive surveillance briefing aggregates real-time incident reports, algorithmic risk assessments, and detected geographic clusters across Tripoli, Lebanon. A total of <strong>{stats.totalReports} public health incidents</strong> have been logged through the Tripoli HealthPulse surveillance system, with <strong>{stats.criticalCount} incidents</strong> classified in the Critical Tier (score &ge; 76). Field inspection teams maintain an active containment and remediation rate of <strong>{stats.resolutionRate}%</strong>.
                  </>
                )}
              </p>
            </div>

            {/* Metrics Table */}
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-800 mb-2">
                {language === 'ar' ? '2. مؤشرات الترصد الصحي الرئيسية (طرابلس الكبرى)' : '2. Key Surveillance Indicators (Greater Tripoli)'}
              </h3>
              <table className="w-full text-left rtl:text-right border border-slate-300">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r rtl:border-r-0 rtl:border-l border-slate-300">{language === 'ar' ? 'المؤشر' : 'Indicator'}</th>
                    <th className="p-2 border-r rtl:border-r-0 rtl:border-l border-slate-300">{language === 'ar' ? 'العدد / النسبة' : 'Count / Value'}</th>
                    <th className="p-2 border-r rtl:border-r-0 rtl:border-l border-slate-300">{language === 'ar' ? 'الحالة الراهنة' : 'Status'}</th>
                    <th className="p-2">{language === 'ar' ? 'التوجيهات الموصى بها' : 'Recommended Directive'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-semibold">{language === 'ar' ? 'إجمالي البلاغات المسجلة' : 'Total Monitored Incidents'}</td>
                    <td className="p-2 font-mono font-bold">{stats.totalReports}</td>
                    <td className="p-2 text-teal-700 font-semibold">{language === 'ar' ? 'قاعدة بيانات نشطة' : 'Active Database'}</td>
                    <td className="p-2">{language === 'ar' ? 'متابعة تلقي بلاغات المواطنين على مدار الساعة' : 'Continuous digital citizen intake'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">{language === 'ar' ? 'البلاغات الحرجة (الدرجة ≥ 76)' : 'Critical Incidents (Score ≥ 76)'}</td>
                    <td className="p-2 font-mono font-bold text-rose-600">{stats.criticalCount}</td>
                    <td className="p-2 text-rose-600 font-bold">{language === 'ar' ? 'أولوية قصوى' : 'Priority Triage'}</td>
                    <td className="p-2">{language === 'ar' ? 'استجابة ميدانية عاجلة للفرق الصحية خلال 6 ساعات' : 'Immediate field dispatch within 6 hours'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">{language === 'ar' ? 'البؤر المكانية المرصودة' : 'Detected Spatial Clusters'}</td>
                    <td className="p-2 font-mono font-bold text-orange-600">{clusters.length}</td>
                    <td className="p-2 text-orange-600 font-semibold">{language === 'ar' ? 'قيد التحقيق والاحتواء' : 'Under Investigation'}</td>
                    <td className="p-2">{language === 'ar' ? 'عزل مصادر التلوث وإغلاق المنشآت المخالفة احترازياً' : 'Sector containment & pipe/kitchen closures'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">{language === 'ar' ? 'الحوادث المعالجة والمغلقة' : 'Resolved / Closed Incidents'}</td>
                    <td className="p-2 font-mono font-bold text-teal-700">{stats.resolvedCount} ({stats.resolutionRate}%)</td>
                    <td className="p-2 text-teal-700 font-semibold">{language === 'ar' ? 'تم التأكد مخبرياً' : 'Verified Safe'}</td>
                    <td className="p-2">{language === 'ar' ? 'متابعة وفحص دوري لمدة 7 أيام بعد المعالجة' : '7-day post-resolution monitoring'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Active Clusters Breakdown */}
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-800 mb-2">
                {language === 'ar' ? '3. البؤر الوبائية والمكانية النشطة في طرابلس' : '3. Active Spatial-Temporal Outbreak Clusters'}
              </h3>
              <table className="w-full text-left rtl:text-right border border-slate-300 text-[11px]">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-1.5 border-r rtl:border-r-0 rtl:border-l border-slate-300">{language === 'ar' ? 'رمز البؤرة' : 'Cluster Code'}</th>
                    <th className="p-1.5 border-r rtl:border-r-0 rtl:border-l border-slate-300">{language === 'ar' ? 'الحي' : 'District'}</th>
                    <th className="p-1.5 border-r rtl:border-r-0 rtl:border-l border-slate-300">{language === 'ar' ? 'الفئة الصحية' : 'Category'}</th>
                    <th className="p-1.5 border-r rtl:border-r-0 rtl:border-l border-slate-300">{language === 'ar' ? 'عدد البلاغات' : 'Incidents'}</th>
                    <th className="p-1.5 border-r rtl:border-r-0 rtl:border-l border-slate-300">{language === 'ar' ? 'المتضررين' : 'Est. Affected'}</th>
                    <th className="p-1.5">{language === 'ar' ? 'مستوى الخطورة' : 'Risk Level'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clusters.map(c => (
                    <tr key={c.id}>
                      <td className="p-1.5 font-mono font-bold">{c.clusterCode}</td>
                      <td className="p-1.5 font-semibold">{translateDistrict(c.district)}</td>
                      <td className="p-1.5">{translateCluster(c.categoryName)}</td>
                      <td className="p-1.5 font-mono">{c.reportCount}</td>
                      <td className="p-1.5 font-mono font-bold text-rose-600">~{c.totalAffected}</td>
                      <td className="p-1.5 font-bold">{translateRisk(c.riskLevel)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Critical Priority Incident Log */}
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-800 mb-2">
                {language === 'ar' ? '4. عينة البلاغات ذات الأولوية القصوى (الحرجة)' : '4. Priority Critical Incident Summary'}
              </h3>
              <table className="w-full text-left rtl:text-right border border-slate-300 text-[11px]">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-1.5 border-r rtl:border-r-0 rtl:border-l border-slate-300">{language === 'ar' ? 'رقم البلاغ' : 'Report #'}</th>
                    <th className="p-1.5 border-r rtl:border-r-0 rtl:border-l border-slate-300">{language === 'ar' ? 'الفئة' : 'Category'}</th>
                    <th className="p-1.5 border-r rtl:border-r-0 rtl:border-l border-slate-300">{language === 'ar' ? 'العنوان والموقع' : 'Title & Location'}</th>
                    <th className="p-1.5 border-r rtl:border-r-0 rtl:border-l border-slate-300">{language === 'ar' ? 'الدرجة' : 'Score'}</th>
                    <th className="p-1.5">{language === 'ar' ? 'المراقب المكلف' : 'Assigned Officer'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {criticalReports.map(r => (
                    <tr key={r.id}>
                      <td className="p-1.5 font-mono font-bold text-teal-800">{r.reportNumber}</td>
                      <td className="p-1.5 font-semibold">{translateCategory(r.category.name)}</td>
                      <td className="p-1.5">
                        <span className="font-semibold">{translateTitle(r.title, r.category.name, r.location.district)}</span> ({translateDistrict(r.location.district)})
                      </td>
                      <td className="p-1.5 font-mono font-bold text-rose-700">{r.riskScore}</td>
                      <td className="p-1.5">{r.assignedOfficer?.name || (language === 'ar' ? 'مكلف' : 'Assigned')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official Signatures */}
            <div className="pt-8 grid grid-cols-2 gap-8 border-t border-slate-300 text-xs text-slate-700">
              <div className="border-t border-slate-400 pt-2">
                <div className="font-bold text-slate-900">{language === 'ar' ? 'د. طارق الحج' : 'Dr. Tariq Al-Hajj'}</div>
                <div className="text-[11px]">
                  {language === 'ar' ? 'رئيس وحدة الترصد الوبائي والرقابة الصحية • TRP-OFF-01' : 'Lead Epidemiological Inspector • TRP-OFF-01'}
                </div>
                <div className="text-[10px] text-slate-400 mt-4">
                  {language === 'ar' ? '[توقيع رقمي موثق رسمياً]' : '[Certified Digital Signature]'}
                </div>
              </div>

              <div className="border-t border-slate-400 pt-2 text-right rtl:text-left">
                <div className="font-bold text-slate-900">{language === 'ar' ? 'د. نبيل صباغ' : 'Dr. Nabil Sabbagh'}</div>
                <div className="text-[11px]">
                  {language === 'ar' ? 'مدير الرقابة الصحية والبيئية في بلدية طرابلس • TRP-ADM-01' : 'Director of Municipal Health Surveillance • TRP-ADM-01'}
                </div>
                <div className="text-[10px] text-slate-400 mt-4">
                  {language === 'ar' ? '[الختم الرسمي لبلدية طرابلس الكبرى]' : '[Certified Official Seal]'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
