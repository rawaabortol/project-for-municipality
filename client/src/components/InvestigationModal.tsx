import React, { useState, useEffect } from 'react';
import { Report, Investigation } from '../../utils/sampleData';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { dbInstance } from '../../utils/axios';
import {
  X,
  Stethoscope,
  CheckCircle2,
  FlaskConical,
  ClipboardCheck,
  FileText,
  AlertCircle,
  Save,
  Lock,
  FileCheck,
  ArrowRight
} from 'lucide-react';

interface InvestigationModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InvestigationModal: React.FC<InvestigationModalProps> = ({
  report,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
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

  // Look for existing investigation on this report if any
  const existingInv = report ? dbInstance.investigations.find(i => i.reportId === report.id || i.reportNumber === report.reportNumber) : undefined;

  const [findings, setFindings] = useState(
    existingInv
      ? language === 'ar'
        ? translateFindings(existingInv.findings, existingInv.investigationCode)
        : existingInv.findings
      : ''
  );
  const [actionsTaken, setActionsTaken] = useState(
    existingInv
      ? language === 'ar'
        ? translateActions(existingInv.actionsTaken, existingInv.investigationCode)
        : existingInv.actionsTaken
      : ''
  );
  const [recommendations, setRecommendations] = useState(
    existingInv
      ? language === 'ar'
        ? translateRecommendations(existingInv.recommendations, existingInv.investigationCode)
        : existingInv.recommendations
      : ''
  );
  const [result, setResult] = useState<'Confirmed' | 'Not Confirmed' | 'Inconclusive' | 'Resolved'>(existingInv?.result || 'Resolved');
  const [samplesCollected, setSamplesCollected] = useState(
    existingInv?.samplesCollected || (language === 'ar' ? 'عينة مياه / مسحة تم إرسالها إلى مختبر طرابلس المركزي' : 'Water/swab sample sent to North Lebanon Central Laboratory')
  );
  const [notes, setNotes] = useState(existingInv?.notes || '');
  const [invStatus, setInvStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>(existingInv?.status || 'COMPLETED');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const isAlreadyResolvedOrClosed = report.status === 'RESOLVED' || report.status === 'CLOSED';

  const validateInputs = () => {
    if (!findings.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى تدوين الملاحظات والمشاهدات الميدانية.' : 'Please specify field findings and observations.');
      return false;
    }
    if (!actionsTaken.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى تفصيل الإجراءات المتخذة أو تدابير الاحتواء.' : 'Please detail actions taken or containment measures.');
      return false;
    }
    return true;
  };

  const handleSaveProgress = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateInputs()) return;

    setIsSaving(true);
    setErrorMsg('');

    try {
      dbInstance.createInvestigation(
        {
          reportId: report.id,
          reportNumber: report.reportNumber,
          findings,
          actionsTaken,
          recommendations,
          result,
          samplesCollected,
          notes,
          status: invStatus === 'COMPLETED' ? 'IN_PROGRESS' : invStatus
        },
        currentUser
      );

      showToast(
        language === 'ar'
          ? `تم حفظ وتحديث مسودة محضر التحقيق للبلاغ #${report.reportNumber}!`
          : `Field investigation draft updated for #${report.reportNumber}!`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || (language === 'ar' ? 'فشل حفظ محضر التحقيق' : 'Failed to save investigation'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalizeInspection = () => {
    if (!validateInputs()) return;

    setIsSaving(true);
    setErrorMsg('');

    try {
      dbInstance.finalizeInvestigation(
        report.id,
        {
          findings,
          actionsTaken,
          recommendations: recommendations || (language === 'ar' ? 'استمرار الرقابة الدورية وتكثيف سحب العينات' : 'Continuous routine surveillance & swab monitoring'),
          result: result === 'Inconclusive' ? 'Resolved' : result,
          samplesCollected,
          notes: notes || (language === 'ar' ? 'تم إنهاء التفتيش ومعالجة المخاطر بالكامل' : 'Field inspection concluded and hazards remediated')
        },
        currentUser
      );

      showToast(
        language === 'ar'
          ? `تم إنهاء التفتيش الميداني بنجاح وحل البلاغ #${report.reportNumber}! لا يمكن التراجع عن هذه الخطوة.`
          : `Field inspection finalized and report #${report.reportNumber} marked RESOLVED! One-way progression locked.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || (language === 'ar' ? 'فشل إنهاء التفتيش' : 'Failed to finalize inspection'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {language === 'ar' ? 'محضر التحقيق الميداني والمخبري للمراقب الصحي' : 'Health Officer Field Investigation Record'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'مرتبط بالبلاغ رقم: ' : 'Related to Report: '}
                <span className="text-teal-400 font-mono font-bold">#{report.reportNumber}</span> ({translateDistrict(report.location.district)})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* One-way workflow notice */}
          <div className="p-3 bg-teal-950/40 border border-teal-700/50 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-teal-300">
              <ClipboardCheck className="w-4 h-4 text-teal-400" />
              <span>{language === 'ar' ? 'نظام التحقيق الميداني أحادي المسار (غير قابل للتراجع)' : 'One-Way Field Inspection Protocol (Strict Forward)'}</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {language === 'ar'
                ? 'بمجرد الضغط على "إنهاء التفتيش ومعالجة البلاغ"، سيتم توثيق النتائج رسميًا ونقل البلاغ إلى مرحلة "تمت المعالجة (RESOLVED)". لا يمكن التراجع عن هذه الخطوة إلى مسودات سابقة.'
                : 'Clicking "Finalize Inspection & Resolve Incident" commits the investigation and advances the incident to RESOLVED. Backtracking to earlier stages is permanently disabled.'}
            </p>
          </div>

          {isAlreadyResolvedOrClosed && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-700 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0" />
              <span>
                {language === 'ar'
                  ? `هذا المحضر مغلق ومؤكد رسمياً بحالة (${report.status}). أي تعديلات ستحدث السجلات المحفوظة.`
                  : `This inspection is officially finalized in (${report.status}) state. Audit trail is permanent.`}
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="investigation-form" onSubmit={handleSaveProgress} className="space-y-4 text-xs">
            {/* Investigation Result & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1.5 text-[11px]">
                  {language === 'ar' ? 'نتيجة الكشف الميداني' : 'Investigation Result'} *
                </label>
                <select
                  value={result}
                  onChange={e => setResult(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                >
                  <option value="Confirmed">{language === 'ar' ? 'خطر صحي مؤكد (Confirmed)' : 'Confirmed Hazard'}</option>
                  <option value="Not Confirmed">{language === 'ar' ? 'غير مؤكد / سليم (Not Confirmed)' : 'Not Confirmed / Safe'}</option>
                  <option value="Inconclusive">{language === 'ar' ? 'غير حاسم / بانتظار التحاليل (Inconclusive)' : 'Inconclusive / Pending Labs'}</option>
                  <option value="Resolved">{language === 'ar' ? 'تمت المعالجة والإغلاق (Resolved)' : 'Resolved / Remediated'}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1.5 text-[11px]">
                  {language === 'ar' ? 'مرحلة التحقيق' : 'Lifecycle Status'} *
                </label>
                <select
                  value={invStatus}
                  onChange={e => setInvStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                >
                  <option value="IN_PROGRESS">{language === 'ar' ? 'قيد المتابعة والتحقيق الميداني' : 'IN_PROGRESS (Active)'}</option>
                  <option value="PENDING">{language === 'ar' ? 'معلق / بانتظار الفحوصات' : 'PENDING (Awaiting Testing)'}</option>
                  <option value="COMPLETED">{language === 'ar' ? 'مكتمل ومغلق رسمياً' : 'COMPLETED (Closed Record)'}</option>
                </select>
              </div>
            </div>

            {/* Field Findings */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1.5 text-[11px]">
                {t('fieldFindings')} *
              </label>
              <textarea
                rows={3}
                value={findings}
                onChange={e => setFindings(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'المشاهدات العينية، قراءات الأجهزة المخبرية الميدانية (مثل فحص الكلور، مقياس العكارة، حرارة التبريد)...'
                    : 'Physical observations, sensory evaluation, field instrumentation readings (free chlorine, turbidity, refrigeration temp)...'
                }
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-3 rounded-xl focus:outline-none focus:border-teal-500 leading-relaxed"
                required
              />
            </div>

            {/* Actions Taken */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1.5 text-[11px]">
                {t('containmentActions')} *
              </label>
              <textarea
                rows={3}
                value={actionsTaken}
                onChange={e => setActionsTaken(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'إجراءات الاحتواء المتخذة فورياً (إغلاق صمامات، إتلاف منتجات فاسدة، نشر مبيدات، تشميع منشأة)...'
                    : 'Immediate containment executed: valves shut off, contaminated products seized/destroyed, larvicide dispersed...'
                }
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-3 rounded-xl focus:outline-none focus:border-teal-500 leading-relaxed"
                required
              />
            </div>

            {/* Recommendations */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1.5 text-[11px]">
                {t('officialDirective')}
              </label>
              <textarea
                rows={2}
                value={recommendations}
                onChange={e => setRecommendations(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'القرارات والتوجيهات الإدارية الموجهة للبلدية أو المواطنين أو المؤسسات...'
                    : 'Policy mandates, municipal directives, follow-up schedules, health notices...'
                }
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-3 rounded-xl focus:outline-none focus:border-teal-500 leading-relaxed"
              />
            </div>

            {/* Lab Samples */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1.5 text-[11px]">
                {t('samplesLabel')}
              </label>
              <input
                type="text"
                value={samplesCollected}
                onChange={e => setSamplesCollected(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'مثال: عينة مياه صنبور رقم W-401 أرسلت لمختبر طرابلس المركزي'
                    : 'e.g., Water Tap Sample #TRP-W-401 sent to Central Laboratory'
                }
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            {t('cancel')}
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="submit"
              form="investigation-form"
              disabled={isSaving}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ المسودة' : 'Save Progress')}</span>
            </button>

            <button
              type="button"
              onClick={handleFinalizeInspection}
              disabled={isSaving}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50"
            >
              <FileCheck className="w-4.5 h-4.5" />
              <span>
                {language === 'ar' ? 'إنهاء التفتيش ومعالجة البلاغ (نهائي)' : 'Finalize Inspection & Resolve (Final)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
