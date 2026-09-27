import React, { useState, useMemo, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";
import { useData } from "../../context/DataContext";
import { reportService } from "../../services/reportService";
import { calculateReportRisk } from "../../utils/riskEngine";
import { TRIPOLI_DISTRICTS, TRIPOLI_COORDINATES } from "../../utils/APIConst";
import { TripoliMap } from "./TripoliMap";
import {
  X,
  Send,
  MapPin,
  AlertCircle,
  Info,
  ShieldAlert,
  CheckCircle,
  Camera,
} from "lucide-react";
import { getRiskColor } from "../../utils/helper";

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useNotifications();
  const {
    t,
    translateCategory,
    translateDistrict,
    translateSeverity,
    translateRisk,
    translateExplanation,
    language,
    isRtl,
  } = useLanguage();

  const { categories, reports, refresh } = useData();

  // Form State
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState("Al-Tal");
  const [address, setAddress] = useState("Near Clock Tower Square");
  const [lat, setLat] = useState(34.4367);
  const [lng, setLng] = useState(35.8497);
  const [affectedCount, setAffectedCount] = useState(1);
  const [initialSeverity, setInitialSeverity] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  >("MEDIUM");
  const [additionalComments, setAdditionalComments] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedCategoryObj =
    categories.find((c) => c.id === categoryId) || categories[0];

  // Dynamic Real-Time Smart Risk Engine Calculation
  const liveRiskEstimate = useMemo(() => {
    const draft = {
      category: selectedCategoryObj,
      initialSeverity,
      affectedCount,
      incidentDate: new Date().toISOString(),
      location: { lat, lng, district, address },
    };
    return calculateReportRisk(draft, reports);
  }, [
    reports,
    selectedCategoryObj,
    initialSeverity,
    affectedCount,
    lat,
    lng,
    district,
    address,
  ]);

  // Close modal when pressing Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAffectedCount(1);
    setInitialSeverity("MEDIUM");
    setAdditionalComments("");
    setImageUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg(
        language === "ar"
          ? "يرجى إدخال عنوان واضح للبلاغ الصحي."
          : "Please provide an incident title.",
      );
      return;
    }
    if (!description.trim() || description.length < 15) {
      setErrorMsg(
        language === "ar"
          ? "يرجى كتابة تفاصيل كافية عن المشكلة (15 حرفاً على الأقل)."
          : "Please provide a detailed description (minimum 15 characters).",
      );
      return;
    }

    if (!selectedCategoryObj) {
      setErrorMsg(
        language === "ar" ? "يرجى اختيار فئة البلاغ." : "Please select a category.",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const created = await reportService.createReport({
          category: {
            name: selectedCategoryObj.name,
            code: selectedCategoryObj.code,
          },
          title,
          description,
          incidentDate: new Date().toISOString(),
          location: {
            address,
            district,
            lat,
            lng,
          },
          affectedCount,
          initialSeverity,
          imageUrl: imageUrl || undefined,
          additionalComments,
      });

      showToast(
        language === "ar"
          ? `تم تسجيل البلاغ بنجاح #${created.reportNumber}! تقييم الخطورة: ${created.riskScore} (${translateRisk(created.riskLevel)})`
          : `Incident #${created.reportNumber} registered! Risk Score: ${created.riskScore} (${created.riskLevel})`,
      );
      await refresh();
      if (onSuccess) onSuccess();
      resetForm();
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          (language === "ar"
            ? "فشل في إرسال البلاغ."
            : "Failed to submit report."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const riskVisual = getRiskColor(liveRiskEstimate.riskLevel);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {t("submitModalTitle")}
              </h2>
              <p className="text-xs text-slate-400">
                {t("submitModalSubtitle")}
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

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form id="report-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Category & Initial Severity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {t("categoryCol")} *
                </label>
                <select
                  value={selectedCategoryObj?.id || ""}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {translateCategory(c.name)}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedCategoryObj.description}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {t("initialSeverity")} *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map(
                    (sev) => (
                      <button
                        type="button"
                        key={sev}
                        onClick={() => setInitialSeverity(sev)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                          initialSeverity === sev
                            ? sev === "CRITICAL"
                              ? "bg-rose-600 border-rose-500 text-white"
                              : sev === "HIGH"
                                ? "bg-orange-600 border-orange-500 text-white"
                                : sev === "MEDIUM"
                                  ? "bg-amber-600 border-amber-500 text-white"
                                  : "bg-emerald-600 border-emerald-500 text-white"
                            : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        {translateRisk(sev)}
                      </button>
                    ),
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {translateSeverity(initialSeverity)}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t("incidentTitle")} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  language === "ar"
                    ? "مثال: مياه صنبور عكرة برائحة غريبة في مبنى سكني"
                    : "e.g., Brown water coming from residential faucets in Syria Street"
                }
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t("detailedDescription")} *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  language === "ar"
                    ? "صف ما لاحظته بدقة: الرائحة، اللون، متى بدأت المشكلة، هل أصيب أفراد من العائلة أو الجيران؟"
                    : "Describe the problem clearly: color, smell, when it started, health symptoms observed in residents or family..."
                }
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-3 rounded-xl text-xs focus:outline-none focus:border-teal-500 leading-relaxed"
                required
              />
            </div>

            {/* District & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
                  {t("tripoliDistrict")} *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500"
                >
                  {TRIPOLI_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {translateDistrict(d)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
                  {t("streetAddress")} *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    language === "ar"
                      ? "اسم الشارع، رقم البناء أو أقرب معلم"
                      : "Street name, landmark, or building number"
                  }
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500"
                  required
                />
              </div>
            </div>

            {/* Affected People & Pinpoint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {t("affectedPeople")}
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={affectedCount}
                  onChange={(e) =>
                    setAffectedCount(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  {language === "ar"
                    ? "العدد التقريبي للأشخاص المتأثرين في المبنى أو الحي"
                    : "Approximate count of residents or patrons experiencing symptoms"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {language === "ar"
                    ? "الإحداثيات الجغرافية (GPS)"
                    : "Geographic GPS Pinpoint"}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-800/80 border border-slate-700 px-3 py-2 rounded-xl text-xs font-mono text-teal-300">
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMiniMap(!showMiniMap)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    <span>
                      {showMiniMap ? t("hidePinpoint") : t("mapPinpoint")}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Location Picker Map */}
            {showMiniMap && (
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    {language === "ar"
                      ? "انقر على خريطة طرابلس لتحديد الموقع الدقيق"
                      : "Click anywhere on the Tripoli map to drop a pin"}
                  </span>
                  <span className="text-teal-400 text-[11px] font-mono">
                    {district}
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden">
                  <TripoliMap
                    reports={[]}
                    isPickerMode={true}
                    heightClass="h-64"
                    onLocationPicked={(loc) => {
                      setLat(loc.lat);
                      setLng(loc.lng);
                      setDistrict(loc.district);
                      setAddress(loc.address);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Real-Time Intelligent Risk Engine Calculation */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-teal-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold text-white">
                    {t("realTimeRiskScore")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white">
                    {liveRiskEstimate.riskScore}/100
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${riskVisual.badge}`}
                  >
                    {translateRisk(liveRiskEstimate.riskLevel)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block">
                    {t("severityScoreLabel")}
                  </span>
                  <span className="font-bold text-white text-xs">
                    +{liveRiskEstimate.factors.severityScore}
                  </span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block">
                    {t("affectedPopLabel")}
                  </span>
                  <span className="font-bold text-white text-xs">
                    +{liveRiskEstimate.factors.affectedPeopleScore}
                  </span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block">
                    {t("recencyWeightLabel")}
                  </span>
                  <span className="font-bold text-white text-xs">
                    +{liveRiskEstimate.factors.recentReportsScore}
                  </span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block">
                    {t("geoClusterLabel")}
                  </span>
                  <span className="font-bold text-white text-xs">
                    +{liveRiskEstimate.factors.geographicClusterScore}
                  </span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="text-slate-400 block">
                    {t("categoryPriorityLabel")}
                  </span>
                  <span className="font-bold text-white text-xs">
                    +{liveRiskEstimate.factors.categoryScore}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-0.5">
                {liveRiskEstimate.factors.explanations.map(
                  (exp: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                      <span>{translateExplanation(exp)}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Evidence Photo URL (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t("evidencePhoto")}
              </label>
              <div className="relative">
                <Camera
                  className={`w-4 h-4 text-slate-400 absolute ${isRtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`}
                />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/photo-proof.jpg"
                  className={`w-full ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"} py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-teal-500`}
                />
              </div>
            </div>

            {/* Additional Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t("additionalRemarks")}
              </label>
              <input
                type="text"
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                placeholder={
                  language === "ar"
                    ? "أي أوقات مفضلة للاتصال أو توضيحات إضافية"
                    : "Any preferred contact hours or details for the visiting inspector"
                }
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </form>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-800/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            form="report-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isSubmitting
                ? language === "ar"
                  ? "جاري الإرسال..."
                  : "Submitting..."
                : t("submit")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
