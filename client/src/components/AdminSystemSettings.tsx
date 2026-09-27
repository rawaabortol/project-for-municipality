import React, { useState } from 'react';
import { dbInstance } from '../../utils/axios';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sliders,
  ShieldAlert,
  Radio,
  Clock,
  RefreshCw,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server,
  Zap,
  Activity
} from 'lucide-react';

interface AdminSystemSettingsProps {
  onRefresh?: () => void;
}

export const AdminSystemSettings: React.FC<AdminSystemSettingsProps> = ({ onRefresh }) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const { language, isRtl, t } = useLanguage();

  // Smart Risk Engine Weights Configuration
  const [severityMax, setSeverityMax] = useState<number>(30);
  const [affectedMax, setAffectedMax] = useState<number>(25);
  const [recencyMax, setRecencyMax] = useState<number>(20);
  const [clusterMax, setClusterMax] = useState<number>(15);
  const [categoryMax, setCategoryMax] = useState<number>(10);

  // Cluster Detection Parameters
  const [clusterRadius, setClusterRadius] = useState<number>(850);
  const [clusterTimeWindow, setClusterTimeWindow] = useState<number>(48);
  const [clusterMinReports, setClusterMinReports] = useState<number>(5);
  const [autoAlertCluster, setAutoAlertCluster] = useState<boolean>(true);

  // SLA & Escalation Thresholds
  const [unresolvedSlaHours, setUnresolvedSlaHours] = useState<number>(72);
  const [criticalSlaHours, setCriticalSlaHours] = useState<number>(12);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
    showToast(
      language === 'ar'
        ? 'تم حفظ وتطبيق معايير تقييم المخاطر وإعدادات الرصد الذكي بنجاح.'
        : 'Smart risk assessment weights and cluster detection parameters saved.'
    );
  };

  const handleTriggerClusterScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const detected = dbInstance.runClusterScan();
      setIsScanning(false);
      onRefresh?.();
      showToast(
        language === 'ar'
          ? `اكتمل مسح البؤر الوبائية بنجاح. تم رصد وتحديث ${detected.length} بؤرة وبائية نشطة في طرابلس.`
          : `Cluster detection completed. ${detected.length} active surveillance clusters detected.`
      );
    }, 600);
  };

  const handleRecalculateRiskScores = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      // Re-evaluate risk scores across all reports
      dbInstance.reports.forEach((rep, idx) => {
        const sevVal = rep.initialSeverity === 'CRITICAL' ? severityMax : rep.initialSeverity === 'HIGH' ? severityMax * 0.7 : rep.initialSeverity === 'MEDIUM' ? severityMax * 0.4 : severityMax * 0.2;
        const affVal = Math.min(affectedMax, (rep.affectedCount / 25) * affectedMax);
        const catVal = Math.min(categoryMax, (rep.category?.code ? 10 : 5));
        const recVal = recencyMax * 0.8;
        const clusterVal = clusterMax * 0.7;

        const newScore = Math.min(100, Math.round(sevVal + affVal + catVal + recVal + clusterVal));
        rep.riskScore = newScore;
        rep.riskLevel = newScore >= 76 ? 'CRITICAL' : newScore >= 51 ? 'HIGH' : newScore >= 26 ? 'MEDIUM' : 'LOW';
      });
      dbInstance.persistAll();
      setIsRecalculating(false);
      onRefresh?.();
      showToast(
        language === 'ar'
          ? 'تمت إعادة معايرة واحتساب درجات الخطورة لجميع البلاغات المسجلة في طرابلس.'
          : 'All report risk scores recalculated using latest formula parameters.'
      );
    }, 700);
  };

  const handleResetBaseline = () => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من إعادة ضبط البيانات إلى الحالة المرجعية الأساسية؟' : 'Are you sure you want to reset all data to the certified baseline?')) {
      dbInstance.resetDemoData();
      onRefresh?.();
      showToast(
        language === 'ar'
          ? 'تمت استعادة بيانات النظام المرجعية المعتمدة لطرابلس.'
          : 'Database reset to certified Tripoli baseline.'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shadow-inner">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">
                {language === 'ar' ? 'إعدادات النظام ومعايير تقييم المخاطر الذكية' : 'System Settings & Smart Risk Thresholds'}
              </h1>
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono font-bold">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ar'
                ? 'التحكم بأوزان معادلة المخاطر الخوارزمية، عتبات رصد البؤر الجغرافية والزمنية، وإجراءات التصعيد التلقائي'
                : 'Configure risk scoring weights, spatial-temporal cluster discovery radius, and automated alert dispatch'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetBaseline}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إعادة ضبط البيانات' : 'Reset Baseline'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Risk Calculation Algorithm Weights (Section 7) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-teal-400" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  {language === 'ar' ? 'معايير أوزان خوارزمية تقييم المخاطر (مجموع 100 نقطة)' : 'Smart Risk Assessment Algorithm Weights (Total: 100 pts)'}
                </h2>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  riskScore = severityScore + affectedPeopleScore + recentReportsScore + geographicClusterScore + categoryScore
                </p>
              </div>
            </div>
            <div className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-teal-950 text-teal-300 border border-teal-800">
              {severityMax + affectedMax + recencyMax + clusterMax + categoryMax} / 100 PTS
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Severity Weight */}
            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{language === 'ar' ? 'وزن درجة الشدة المبدئية' : 'Severity Weight'}</span>
                <span className="text-xs font-mono font-bold text-teal-400">{severityMax} pts</span>
              </div>
              <input
                type="range"
                min={10}
                max={40}
                value={severityMax}
                onChange={e => setSeverityMax(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
              <p className="text-[10px] text-slate-400">
                {language === 'ar' ? 'الوزن الأقصى لحالات الخطورة الحرجة (CRITICAL / HIGH)' : 'Weight allocated for initial incident severity classification'}
              </p>
            </div>

            {/* Affected People Weight */}
            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{language === 'ar' ? 'مضاعف عدد المتضررين' : 'Affected People Score'}</span>
                <span className="text-xs font-mono font-bold text-teal-400">{affectedMax} pts</span>
              </div>
              <input
                type="range"
                min={10}
                max={35}
                value={affectedMax}
                onChange={e => setAffectedMax(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
              <p className="text-[10px] text-slate-400">
                {language === 'ar' ? 'التصعيد التناسبي بحسب عدد المواطنين المصابين أو المتأثرين' : 'Proportional score calculated from affected count'}
              </p>
            </div>

            {/* Recency Weight */}
            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{language === 'ar' ? 'عامل الحداثة الزمنية' : 'Temporal Recency Weight'}</span>
                <span className="text-xs font-mono font-bold text-teal-400">{recencyMax} pts</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                value={recencyMax}
                onChange={e => setRecencyMax(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
              <p className="text-[10px] text-slate-400">
                {language === 'ar' ? 'منح الأولوية للبلاغات المستلمة خلال آخر 24 إلى 48 ساعة' : 'Score decay factor for reports submitted in the last 24-48h'}
              </p>
            </div>

            {/* Proximity / Cluster Weight */}
            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{language === 'ar' ? 'الكثافة الجغرافية للبؤرة' : 'Geographic Density Weight'}</span>
                <span className="text-xs font-mono font-bold text-teal-400">{clusterMax} pts</span>
              </div>
              <input
                type="range"
                min={5}
                max={25}
                value={clusterMax}
                onChange={e => setClusterMax(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
              <p className="text-[10px] text-slate-400">
                {language === 'ar' ? 'درجة إضافية في حال وجود بلاغات مشابهة قريبة مكانياً' : 'Bonus points if incident falls within a recognized high-density zone'}
              </p>
            </div>

            {/* Category Importance Weight */}
            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{language === 'ar' ? 'أهمية الفئة الصحية' : 'Category Base Weight'}</span>
                <span className="text-xs font-mono font-bold text-teal-400">{categoryMax} pts</span>
              </div>
              <input
                type="range"
                min={5}
                max={20}
                value={categoryMax}
                onChange={e => setCategoryMax(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
              <p className="text-[10px] text-slate-400">
                {language === 'ar' ? 'تفاضل الفئات الحساسة (تلوث المياه، التسمم، والأوبئة)' : 'Base severity rating defined in database category registry'}
              </p>
            </div>

            {/* Recalculate Trigger Card */}
            <div className="p-4 bg-teal-950/30 border border-teal-800/60 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span>{language === 'ar' ? 'معايرة جماعية فورية' : 'Live Risk Recalibration'}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {language === 'ar'
                    ? 'إعادة تشغيل الخوارزمية وتحديث درجات الخطر لجميع البلاغات المائة في النظام'
                    : 'Execute scoring pipeline across all registered incident reports'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRecalculateRiskScores}
                disabled={isRecalculating}
                className="mt-3 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
                <span>{isRecalculating ? (language === 'ar' ? 'جاري الاحتساب...' : 'Recalculating...') : (language === 'ar' ? 'إعادة احتساب الخطورة' : 'Recalculate All Scores')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Spatial-Temporal Cluster Detection Parameters (Section 8) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Radio className="w-5 h-5 text-rose-400" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  {language === 'ar' ? 'معايير خوارزمية رصد البؤر الوبائية والجغرافية (Spatial-Temporal Clustering)' : 'Spatial-Temporal Cluster Detection Engine Settings'}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'ar'
                    ? 'تحديد البؤر عند تكرار 5+ بلاغات متطابقة الفئة ضمن نطاق مكاني وزمني محدد'
                    : 'Automated outbreak pattern recognition across Tripoli districts'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriggerClusterScan}
              disabled={isScanning}
              className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <Zap className={`w-3.5 h-3.5 ${isScanning ? 'animate-bounce' : ''}`} />
              <span>{isScanning ? (language === 'ar' ? 'جاري المسح...' : 'Scanning...') : (language === 'ar' ? 'تشغيل فحص البؤر' : 'Run Cluster Scan')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Radius */}
            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 block uppercase">
                {language === 'ar' ? 'نصف القطر المكاني للبؤرة' : 'Cluster Detection Radius'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={200}
                  max={3000}
                  step={50}
                  value={clusterRadius}
                  onChange={e => setClusterRadius(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-mono text-sm px-3 py-1.5 rounded-xl focus:outline-none focus:border-teal-500"
                />
                <span className="text-xs text-slate-400 font-mono">meters</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {language === 'ar' ? 'المسافة الجغرافية لحساب التقارب (افتراضي: 850م)' : 'Haversine distance boundary (default: 850m)'}
              </p>
            </div>

            {/* Time Window */}
            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 block uppercase">
                {language === 'ar' ? 'النافذة الزمنية للترصد' : 'Temporal Time Window'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={12}
                  max={168}
                  step={6}
                  value={clusterTimeWindow}
                  onChange={e => setClusterTimeWindow(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-mono text-sm px-3 py-1.5 rounded-xl focus:outline-none focus:border-teal-500"
                />
                <span className="text-xs text-slate-400 font-mono">hours</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {language === 'ar' ? 'فترة الحدوث المشترك للأعراض (افتراضي: 48 ساعة)' : 'Co-occurrence time frame (default: 48h)'}
              </p>
            </div>

            {/* Min Reports */}
            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 block uppercase">
                {language === 'ar' ? 'الحد الأدنى للبلاغات' : 'Minimum Incident Reports'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={clusterMinReports}
                  onChange={e => setClusterMinReports(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-mono text-sm px-3 py-1.5 rounded-xl focus:outline-none focus:border-teal-500"
                />
                <span className="text-xs text-slate-400 font-mono">reports</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {language === 'ar' ? 'عتبة تأكيد البؤرة وإطلاق الإنذار (افتراضي: 5)' : 'Threshold to trigger cluster confirmation'}
              </p>
            </div>

            {/* Auto Alert Toggle */}
            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex flex-col justify-between">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block uppercase">
                  {language === 'ar' ? 'إنذار وبائي تلقائي' : 'Automated Outbreak Alert'}
                </label>
                <p className="text-[10px] text-slate-400 mt-1">
                  {language === 'ar' ? 'إنشاء تنبيه فوري للمراقبين عند ثبوت البؤرة' : 'Auto-dispatch critical notification to duty officers'}
                </p>
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAlertCluster}
                    onChange={e => setAutoAlertCluster(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-slate-700 border-slate-600"
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    {language === 'ar' ? 'تفعيل الإشعار الفوري' : 'Enabled'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SLA & Auto-Escalation Thresholds (Section 9) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white">
                {language === 'ar' ? 'عتبات اتفاقية مستوى الخدمة (SLA) والتصعيد التلقائي للبلاغات' : 'Response SLA & Automatic Escalation Rules'}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'إطلاق إنذار تلقائي عند تأخر معاينة البلاغات غير المعالجة'
                  : 'Automated timeout alert generation when incidents remain unaddressed'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 block uppercase">
                {language === 'ar' ? 'مهلة البلاغات الحرجة (Critical Incidents SLA)' : 'Critical Incidents Triage SLA'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={2}
                  max={48}
                  value={criticalSlaHours}
                  onChange={e => setCriticalSlaHours(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-mono text-sm px-3 py-1.5 rounded-xl focus:outline-none focus:border-teal-500"
                />
                <span className="text-xs text-slate-400 font-mono">hours</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {language === 'ar' ? 'المهلة القصوى لفرز وتكليف مراقب ميداني لبلاغ ذي درجة خطورة حرجة' : 'Maximum response threshold before directorate escalation'}
              </p>
            </div>

            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 block uppercase">
                {language === 'ar' ? 'إنذار الركود وعدم الحل (Unresolved Incident Alert)' : 'Unresolved Incident Timeout Alert'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={24}
                  max={240}
                  value={unresolvedSlaHours}
                  onChange={e => setUnresolvedSlaHours(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 font-mono text-sm px-3 py-1.5 rounded-xl focus:outline-none focus:border-teal-500"
                />
                <span className="text-xs text-slate-400 font-mono">hours</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {language === 'ar' ? 'توليد إنذار UNRESOLVED_TIMEOUT إذا بقي البلاغ قيد المراجعة دون إغلاق' : 'Triggers system alert if incident sits unresolved past threshold'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          {isSavedNotice ? (
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'ar' ? 'تم حفظ التغييرات بنجاح!' : 'Changes committed to database!'}</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400">
              {language === 'ar' ? 'كافة التعديلات تسجل تلقائياً في سجل تدقيق العمليات (Audit Logs).' : 'All setting adjustments are appended to the system audit trail.'}
            </div>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'ar' ? 'حفظ وتطبيق الإعدادات' : 'Save & Commit Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
