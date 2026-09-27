import React, { useState, useEffect } from 'react';
import { Report } from '../../utils/sampleData';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { dbInstance } from '../../utils/axios';
import { getRiskColor, getStatusBadge, formatDateTime } from '../../utils/helper';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Stethoscope,
  Calendar,
  MapPin,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Lock,
  FileCheck,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { Skeleton, SkeletonText } from './common/Skeleton';

interface ReportDetailsModalProps {
  report: Report | null;
  onClose: () => void;
  onOpenInvestigation: (report: Report) => void;
  onRefresh: () => void;
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  report,
  onClose,
  onOpenInvestigation,
  onRefresh
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const {
    t,
    translateCategory,
    translateDistrict,
    translateStatus,
    translateRisk,
    translateTitle,
    translateDescription,
    translateExplanation,
    translateRole,
    language,
    isRtl
  } = useLanguage();

  const [isModalLoading, setIsModalLoading] = useState(true);
  const [statusComment, setStatusComment] = useState('');
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!report) return;
    setIsModalLoading(true);
    const timer = setTimeout(() => setIsModalLoading(false), 350);
    return () => clearTimeout(timer);
  }, [report?.id]);

  // Finalize inspection panel state
  const [showFinalizePanel, setShowFinalizePanel] = useState(false);
  const [finalResult, setFinalResult] = useState<'Resolved' | 'Confirmed' | 'Not Confirmed'>('Resolved');
  const [finalFindings, setFinalFindings] = useState('');
  const [finalActions, setFinalActions] = useState('');
  const [finalRecommendations, setFinalRecommendations] = useState('');
  const [finalNotes, setFinalNotes] = useState('');

  // Rejection panel state
  const [showRejectPanel, setShowRejectPanel] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Close modal or active panels on Escape key
  useEffect(() => {
    if (!report) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showFinalizePanel) {
          setShowFinalizePanel(false);
        } else if (showRejectPanel) {
          setShowRejectPanel(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [report, showFinalizePanel, showRejectPanel, onClose]);

  if (!report) return null;

  const isOfficerOrAdmin = currentUser.role === 'HEALTH_OFFICER' || currentUser.role === 'ADMINISTRATOR';
  const riskVisual = getRiskColor(report.riskLevel);
  const statusVisual = getStatusBadge(report.status);

  // Strict linear stages order
  const steps = [
    { key: 'SUBMITTED', label: t('statusSubmitted'), stepNum: 1 },
    { key: 'UNDER_REVIEW', label: t('statusUnderReview'), stepNum: 2 },
    { key: 'VERIFIED', label: t('statusVerified'), stepNum: 3 },
    { key: 'IN_INVESTIGATION', label: t('statusInInvestigation'), stepNum: 4 },
    { key: 'RESOLVED', label: t('statusResolved'), stepNum: 5 },
    { key: 'CLOSED', label: t('statusClosed'), stepNum: 6 }
  ];

  const currentStepIdx = steps.findIndex(s => s.key === report.status);

  // One-way forward step handler
  const handleAdvanceStep = (targetStatus: string, comment?: string) => {
    setIsUpdating(true);
    dbInstance.updateReportStatus(
      report.id,
      targetStatus,
      comment || `Advanced forward to ${targetStatus} as per inspection protocol.`,
      currentUser
    );

    showToast(
      language === 'ar'
        ? `تم تقديم حالة البلاغ #${report.reportNumber} إلى: ${translateStatus(targetStatus)}`
        : `Report #${report.reportNumber} moved forward to: ${translateStatus(targetStatus)}`
    );

    setIsUpdating(false);
    onRefresh();
  };

  // Launch Field Investigation (Strictly from VERIFIED -> IN_INVESTIGATION)
  const handleLaunchInvestigation = () => {
    setIsUpdating(true);
    dbInstance.updateReportStatus(
      report.id,
      'IN_INVESTIGATION',
      `Field investigation dispatched to ${currentUser.name} (${currentUser.badgeNumber || 'Inspector'}).`,
      currentUser
    );
    setIsUpdating(false);
    onRefresh();
    onOpenInvestigation(report);
  };

  // Finalize Inspection (Strictly from IN_INVESTIGATION -> RESOLVED)
  const handleConfirmFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    dbInstance.finalizeInvestigation(
      report.id,
      {
        findings: finalFindings || (language === 'ar' ? 'تم استكمال الفحص والتأكد من إزالة ومعالجة الضرر الصحي.' : 'Remediation inspection completed and hazard contained.'),
        actionsTaken: finalActions || (language === 'ar' ? 'تم اتخاذ تدابير المعالجة والتطهير البلدية اللازمة.' : 'Municipal remediation and sanitization completed.'),
        recommendations: finalRecommendations || (language === 'ar' ? 'متابعة دورية للتأكد من استقرار الوضع الصحي.' : 'Routine monitoring scheduled.'),
        result: finalResult,
        notes: finalNotes || 'Inspection finalized and incident remediated.'
      },
      currentUser
    );

    showToast(
      language === 'ar'
        ? `تم إنهاء التفتيش ومعالجة البلاغ #${report.reportNumber} بنجاح!`
        : `Field inspection finalized! Report #${report.reportNumber} is now RESOLVED.`
    );

    setShowFinalizePanel(false);
    setIsUpdating(false);
    onRefresh();
  };

  // Reject Report (Only allowed before RESOLVED/CLOSED)
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    setIsUpdating(true);
    dbInstance.updateReportStatus(
      report.id,
      'REJECTED',
      `Report rejected / dismissed: ${rejectionReason}`,
      currentUser
    );

    showToast(
      language === 'ar'
        ? `تم رفض البلاغ #${report.reportNumber}.`
        : `Report #${report.reportNumber} marked as REJECTED.`
    );

    setShowRejectPanel(false);
    setIsUpdating(false);
    onRefresh();
  };

  const handleAssignOfficer = () => {
    if (!selectedOfficerId) return;
    const off = dbInstance.users.find(u => u.id === selectedOfficerId);
    if (!off) return;
    dbInstance.assignOfficer(report.id, off, currentUser);
    showToast(
      language === 'ar'
        ? `تم تكليف المراقب ${off.name} بالبلاغ #${report.reportNumber}`
        : `Officer ${off.name} assigned to #${report.reportNumber}`
    );
    setSelectedOfficerId('');
    onRefresh();
  };

  const healthOfficers = dbInstance.users.filter(u => u.role === 'HEALTH_OFFICER');

  const localizedTitle = translateTitle(report.title, report.category.name, report.location.district);
  const localizedDesc = translateDescription(report.description, report.category.name, report.location.district);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-teal-300">
              #{report.reportNumber}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${statusVisual.badge}`}>
              {translateStatus(report.status)}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${riskVisual.badge}`}>
              {translateRisk(report.riskLevel)} ({report.riskScore}/100)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isModalLoading ? (
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28 bg-slate-700" rounded="rounded" />
                <Skeleton className="h-3 w-32 bg-slate-700" rounded="rounded" />
              </div>
              <Skeleton className="h-6 w-3/4 bg-slate-700" rounded="rounded-lg" />
              <SkeletonText lines={3} className="space-y-2" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-700/60">
                <Skeleton className="h-10 bg-slate-700/50" rounded="rounded-lg" />
                <Skeleton className="h-10 bg-slate-700/50" rounded="rounded-lg" />
                <Skeleton className="h-10 bg-slate-700/50" rounded="rounded-lg" />
                <Skeleton className="h-10 bg-slate-700/50" rounded="rounded-lg" />
              </div>
            </div>
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 space-y-3">
              <Skeleton className="h-4 w-40 bg-slate-700" rounded="rounded" />
              <Skeleton className="h-12 w-full bg-slate-700/60" rounded="rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl space-y-2">
                <Skeleton className="h-4 w-32 bg-slate-700" rounded="rounded" />
                <SkeletonText lines={2} />
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl space-y-2">
                <Skeleton className="h-4 w-32 bg-slate-700" rounded="rounded" />
                <SkeletonText lines={2} />
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Incident Overview Card */}
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                {translateCategory(report.category.name)}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {language === 'ar' ? 'تاريخ البلاغ:' : 'Reported:'} {formatDateTime(report.incidentDate)}
              </span>
            </div>

            <h1 className="text-xl font-bold text-white leading-snug">{localizedTitle}</h1>
            <p className="text-sm text-slate-300 leading-relaxed">{localizedDesc}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-700/60 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'الحي / المنطقة' : 'District / Area'}</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  {translateDistrict(report.location.district)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'المتضررين التقديري' : 'Estimated Affected'}</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-teal-400" />
                  ~{report.affectedCount} {t('people')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t('assignedOfficerCol')}</span>
                <span className="font-semibold text-teal-300 flex items-center gap-1 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  {report.assignedOfficer?.name || t('unassigned')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'اسم المبلّغ' : 'Reporter'}</span>
                <span className="font-semibold text-slate-200 block truncate mt-0.5">
                  {report.citizen.name}
                </span>
              </div>
            </div>
          </div>

          {/* Strict Sequential Inspection Workflow Stepper (Requirement 1) */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/70 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-400" />
                <span>{t('oneWayWorkflowTitle')}</span>
              </h3>
              <span className="text-[11px] text-teal-400 font-semibold bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-800/60">
                {t('cannotRevert')}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t('oneWayWorkflowDesc')}
            </p>

            {/* Stepper Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
              {steps.map((step, idx) => {
                const isPassed = currentStepIdx > idx && report.status !== 'REJECTED';
                const isCurrent = report.status === step.key;
                const isFuture = currentStepIdx < idx || report.status === 'REJECTED';

                return (
                  <div
                    key={step.key}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-teal-950/60 border-teal-500 shadow-md ring-1 ring-teal-500/50'
                        : isPassed
                        ? 'bg-slate-800/90 border-teal-700/50 text-teal-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {isPassed ? (
                        <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-teal-500 text-white font-bold text-xs flex items-center justify-center animate-pulse">
                          {idx + 1}
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-[10px]">
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className={`text-[11px] font-bold ${isCurrent ? 'text-white' : isPassed ? 'text-teal-300' : 'text-slate-400'}`}>
                      {step.label}
                    </div>
                    <div className="text-[9px] mt-0.5">
                      {isCurrent ? (
                        <span className="text-teal-400 font-semibold">{t('currentStage')}</span>
                      ) : isPassed ? (
                        <span className="text-teal-500/80">✓ {language === 'ar' ? 'مكتمل' : 'Completed'}</span>
                      ) : (
                        <span className="text-slate-400">{language === 'ar' ? 'مغلق' : 'Locked'}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Authority Actions & Strict Forward Controls */}
          {isOfficerOrAdmin && (
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900 p-5 rounded-2xl border-2 border-teal-500/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-sm text-white">
                    {language === 'ar' ? 'الإجراء الرسمي التالي (مسار أحادي الاتجاه)' : 'Next Sequential Action (Forward-Only)'}
                  </h3>
                </div>
                <span className="text-xs text-teal-300 font-mono font-bold">
                  {report.status} →
                </span>
              </div>

              {/* Status Specific Forward Controls */}
              {report.status === 'SUBMITTED' && (
                <div className="space-y-3">
                  <div className="p-3 bg-teal-950/30 border border-teal-700/40 rounded-xl text-xs text-teal-200">
                    {language === 'ar'
                      ? 'البلاغ مسجل وجديد. الإجراء التالي هو نقله إلى مرحلة التدقيق والفرز المبدئي.'
                      : 'Incident is freshly submitted. Next protocol step is advancing to formal review & triage.'}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleAdvanceStep('UNDER_REVIEW', 'Inspector initiated formal review of incident.')}
                      disabled={isUpdating}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>{t('proceedToReview')}</span>
                    </button>
                    <button
                      onClick={() => setShowRejectPanel(!showRejectPanel)}
                      className="py-3 px-4 bg-slate-800 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-600 text-slate-300 hover:text-rose-200 text-xs font-semibold rounded-xl transition-colors"
                    >
                      {t('rejectReport')}
                    </button>
                  </div>
                </div>
              )}

              {report.status === 'UNDER_REVIEW' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-950/30 border border-blue-700/40 rounded-xl text-xs text-blue-200">
                    {language === 'ar'
                      ? 'البلاغ قيد المراجعة. بمجرد تأكيد صحة البلاغ، ينتقل إلى مرحلة "تم التحقق" ولا يمكن الرجوع للتقديم.'
                      : 'Report is under review. Verifying advances the case forward; you cannot revert to submitted.'}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleAdvanceStep('VERIFIED', 'Citizen report verified by health surveillance triage team.')}
                      disabled={isUpdating}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('proceedToVerify')}</span>
                    </button>
                    <button
                      onClick={() => setShowRejectPanel(!showRejectPanel)}
                      className="py-3 px-4 bg-slate-800 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-600 text-slate-300 hover:text-rose-200 text-xs font-semibold rounded-xl transition-colors"
                    >
                      {t('rejectReport')}
                    </button>
                  </div>
                </div>
              )}

              {report.status === 'VERIFIED' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-950/30 border border-amber-700/40 rounded-xl text-xs text-amber-200">
                    {language === 'ar'
                      ? 'تم التحقق من صحة البلاغ. الإجراء التالي هو بدء التحقيق والمعاينة الميدانية بواسطة المراقب الصحي.'
                      : 'Incident verified. Next mandatory step is launching the on-site field investigation.'}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleLaunchInvestigation}
                      disabled={isUpdating}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>{t('proceedToInvestigation')}</span>
                    </button>
                    <button
                      onClick={() => setShowRejectPanel(!showRejectPanel)}
                      className="py-3 px-4 bg-slate-800 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-600 text-slate-300 hover:text-rose-200 text-xs font-semibold rounded-xl transition-colors"
                    >
                      {t('rejectReport')}
                    </button>
                  </div>
                </div>
              )}

              {report.status === 'IN_INVESTIGATION' && (
                <div className="space-y-3">
                  <div className="p-3 bg-teal-950/30 border border-teal-700/40 rounded-xl text-xs text-teal-200">
                    {language === 'ar'
                      ? 'التحقيق الميداني جارٍ. لإتمام المعالجة، اضغط على "إنهاء التفتيش ومعالجة البلاغ" لتوثيق النتائج النهائية واعتماد الإنجاز.'
                      : 'Field investigation is active. To resolve, click "Finalize Field Inspection & Resolve" to record closing remediation & certify resolution.'}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Finalize Inspection Button (User's primary request) */}
                    <button
                      onClick={() => setShowFinalizePanel(!showFinalizePanel)}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <FileCheck className="w-4.5 h-4.5" />
                      <span>{t('finalizeInspectionBtn')}</span>
                    </button>

                    {/* Edit Current Findings in Progress */}
                    <button
                      onClick={() => {
                        onOpenInvestigation(report);
                        onClose();
                      }}
                      className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <ClipboardList className="w-4 h-4 text-teal-400" />
                      <span>{language === 'ar' ? 'تعديل محضر الكشف' : 'Edit Inspection Log'}</span>
                    </button>
                  </div>
                </div>
              )}

              {report.status === 'RESOLVED' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-950/40 border border-emerald-700/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      {language === 'ar'
                        ? 'تم إنهاء التفتيش ومعالجة الحادث بنجاح. الإجراء النهائي المتبقي هو الإغلاق والأرشفة الرسمية.'
                        : 'Incident successfully investigated and remediated. Final remaining step is archiving & closing the case.'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAdvanceStep('CLOSED', 'Case officially closed and archived by health authority.')}
                    disabled={isUpdating}
                    className="w-full py-3 px-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold text-xs rounded-xl shadow border border-slate-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{t('closeIncidentFinal')}</span>
                  </button>
                </div>
              )}

              {report.status === 'CLOSED' && (
                <div className="p-4 bg-slate-800/80 border border-teal-500/40 rounded-xl text-xs text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 text-teal-400 font-bold">
                    <Lock className="w-4 h-4" />
                    <span>{t('caseFinalizedClosed')}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {language === 'ar'
                      ? 'تم استكمال كافة مراحل التحقيق والمعالجة وأرشفة الملف في السجل البلدي العام.'
                      : 'All surveillance inspection and remediation stages are permanently certified and sealed.'}
                  </p>
                </div>
              )}

              {report.status === 'REJECTED' && (
                <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تم رفض البلاغ رسمياً' : 'Report Officially Rejected'}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {language === 'ar' ? 'تم استبعاد البلاغ لعدم ثبوت الضرر أو بلاغ كاذب.' : 'Dismissed due to invalidity or lack of verifiable public health hazard.'}
                  </p>
                </div>
              )}

              {/* Interactive Finalize Inspection Drawer / Dialog (Requirement 1) */}
              {showFinalizePanel && report.status === 'IN_INVESTIGATION' && (
                <form
                  onSubmit={handleConfirmFinalize}
                  className="p-4 bg-slate-900 rounded-xl border border-emerald-500/50 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <FileCheck className="w-4 h-4" />
                      <span>{t('finalizeInspectionTitle')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFinalizePanel(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    {t('finalizeInspectionDesc')}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                        {language === 'ar' ? 'النتيجة المعتمدة' : 'Final Certified Result'} *
                      </label>
                      <select
                        value={finalResult}
                        onChange={e => setFinalResult(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2 rounded-lg focus:outline-none focus:border-teal-500"
                      >
                        <option value="Resolved">{language === 'ar' ? 'تمت المعالجة والإصلاح (Resolved)' : 'Resolved / Remediated'}</option>
                        <option value="Confirmed">{language === 'ar' ? 'خطر مؤكد مع تدابير عقابية (Confirmed Hazard)' : 'Confirmed Hazard (Remediation Mandated)'}</option>
                        <option value="Not Confirmed">{language === 'ar' ? 'سليم مخبرياً (Clearance Achieved)' : 'Clearance Achieved'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                        {language === 'ar' ? 'المراقب المعتمد' : 'Certifying Officer'}
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`${currentUser.name} (${currentUser.badgeNumber || 'Inspector'})`}
                        className="w-full bg-slate-800 border border-slate-700 text-slate-400 p-2 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                      {t('fieldFindings')}
                    </label>
                    <textarea
                      rows={2}
                      value={finalFindings}
                      onChange={e => setFinalFindings(e.target.value)}
                      placeholder={language === 'ar' ? 'ملخص الفحص النهائي، القراءات المخبرية بعد المعالجة...' : 'Final post-cleanup inspection notes, lab clearance swabs...'}
                      className="w-full p-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:outline-none focus:border-teal-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                      {t('containmentActions')}
                    </label>
                    <input
                      type="text"
                      value={finalActions}
                      onChange={e => setFinalActions(e.target.value)}
                      placeholder={language === 'ar' ? 'شفط المياه، إصلاح الأنابيب، إتلاف الأغذية، التعقيم بالكلور...' : 'Valve repair, food destruction, chemical larvicide applied...'}
                      className="w-full p-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:outline-none focus:border-teal-500 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowFinalizePanel(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('confirmFinalize')}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Rejection Drawer */}
              {showRejectPanel && (
                <form
                  onSubmit={handleConfirmReject}
                  className="p-4 bg-slate-900 rounded-xl border border-rose-700/60 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{t('rejectReport')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRejectPanel(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                      {t('rejectionReason')} *
                    </label>
                    <textarea
                      rows={2}
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder={language === 'ar' ? 'سبب عدم قبول البلاغ (مثال: بلاغ مكرر، عدم وجود أثر ملوث)...' : 'Reason for dismissing (e.g. duplicate, unverified, out of jurisdiction)...'}
                      className="w-full p-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectPanel(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                    >
                      {t('rejectReport')}
                    </button>
                  </div>
                </form>
              )}

              {/* Assign Officer Controls */}
              {report.status !== 'CLOSED' && report.status !== 'REJECTED' && (
                <div className="pt-3 border-t border-slate-700/80 flex flex-wrap items-center gap-3">
                  <span className="text-xs text-slate-300 font-semibold">{t('assignOfficer')}:</span>
                  <select
                    value={selectedOfficerId}
                    onChange={e => setSelectedOfficerId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-teal-500"
                  >
                    <option value="">{t('selectHealthOfficer')}</option>
                    {healthOfficers.map(ho => (
                      <option key={ho.id} value={ho.id}>
                        {ho.name} ({ho.badgeNumber} • {translateDistrict(ho.district)})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignOfficer}
                    disabled={!selectedOfficerId}
                    className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {t('confirmAssignment')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Smart Risk Assessment Breakdown */}
          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm text-white">
                  {language === 'ar' ? 'تفصيل نقاط محرك تقييم المخاطر الذكي (0–100)' : 'Intelligent Risk Score Breakdown (0–100)'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white">{report.riskScore}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${riskVisual.badge}`}>
                  {translateRisk(report.riskLevel)}
                </span>
              </div>
            </div>

            {/* Breakdown Score Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{t('severityScoreLabel')}</span>
                <span className="text-base font-bold text-white">+{report.riskFactors?.severityScore || 10}</span>
                <span className="text-[9px] text-slate-400 block">{language === 'ar' ? 'الحد 25 نقطة' : 'Max 25 pts'}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{t('affectedPopLabel')}</span>
                <span className="text-base font-bold text-white">+{report.riskFactors?.affectedPeopleScore || 15}</span>
                <span className="text-[9px] text-slate-400 block">{language === 'ar' ? 'الحد 25 نقطة' : 'Max 25 pts'}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{t('recencyWeightLabel')}</span>
                <span className="text-base font-bold text-white">+{report.riskFactors?.recentReportsScore || 10}</span>
                <span className="text-[9px] text-slate-400 block">{language === 'ar' ? 'الحد 15 نقطة' : 'Max 15 pts'}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{t('geoClusterLabel')}</span>
                <span className="text-base font-bold text-white">+{report.riskFactors?.geographicClusterScore || 14}</span>
                <span className="text-[9px] text-slate-400 block">{language === 'ar' ? 'الحد 20 نقطة' : 'Max 20 pts'}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{t('categoryPriorityLabel')}</span>
                <span className="text-base font-bold text-white">+{report.riskFactors?.categoryScore || 12}</span>
                <span className="text-[9px] text-slate-400 block">{language === 'ar' ? 'الحد 15 نقطة' : 'Max 15 pts'}</span>
              </div>
            </div>

            {/* Explanation Factor Points */}
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300">
              <span className="font-semibold text-slate-200 text-xs">{t('evaluatorJustifications')}</span>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                {report.riskFactors?.explanations?.map((exp, idx) => (
                  <li key={idx}>{translateExplanation(exp)}</li>
                )) || <li>{language === 'ar' ? 'تم احتساب التقييم الوبائي متعدد المعايير بنجاح.' : 'Baseline multi-factor epidemiology assessment calculated.'}</li>}
              </ul>
            </div>
          </div>

          {/* Status History & Audit Trail */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" />
              {t('auditTrailTitle')}
            </h3>

            <div className="divide-y divide-slate-800 text-xs">
              {report.statusHistory.map((hist, idx) => (
                <div key={idx} className="py-2.5 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{hist.changedBy}</span>
                      <span className="text-[10px] text-teal-400 uppercase font-medium px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {translateRole(hist.role)}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {language === 'ar' && hist.comment.startsWith('Status set to ')
                        ? `تم تحديث الحالة إلى ${translateStatus(hist.comment.replace('Status set to ', ''))}`
                        : hist.comment}
                    </p>
                  </div>
                  <div className="text-right rtl:text-left shrink-0 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300 block">{translateStatus(hist.newStatus)}</span>
                    {formatDateTime(hist.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-800/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {language === 'ar' ? 'خط العرض:' : 'Latitude:'} {report.location.lat} • {language === 'ar' ? 'خط الطول:' : 'Longitude:'} {report.location.lng}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            {t('closeWindow')}
          </button>
        </div>
      </div>
    </div>
  );
};
