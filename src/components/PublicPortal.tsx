import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Droplets, PhoneCall, AlertTriangle, CheckCircle, Info, HeartPulse } from 'lucide-react';
import { SkeletonMetricCard } from './common/Skeleton';

interface PublicPortalProps {
  onOpenReport: () => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({ onOpenReport }) => {
  const { t, language, isRtl } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const stats = dashboardService.getStats();


  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
          <HeartPulse className="w-4 h-4 text-teal-400" />
          <span>
            {language === 'ar'
              ? 'منظومة نبض طرابلس الصحي • بوابة الحماية المجتمعية'
              : 'Tripoli HealthPulse Community Health Safeguard'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-snug">
          {language === 'ar'
            ? 'المنظومة الذكية للرصد والإبلاغ عن الصحة العامة في طرابلس'
            : 'Smart Public Health Monitoring & Surveillance for Tripoli'}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {language === 'ar'
            ? 'تمكين أهالي وسكان التل، الميناء، باب التبانة، أبي سمراء، القبة، البداوي، وكافة أحياء طرابلس الكبرى من الإبلاغ المباشر عن المخاطر البيئية والصحية ومتابعة التدخلات البلدية.'
            : 'Empowering citizens in Al-Tal, Al-Mina, Bab Al-Tabbaneh, Abu Samra, Beddawi, and across Greater Tripoli with proactive environmental hygiene reporting and epidemiological vigilance.'}
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={onOpenReport}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-500/30 transition-all hover:scale-105 active:scale-95"
          >
            {t('submitIncident')}
          </button>
        </div>
      </div>

      {/* Public Statistics Counters */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center">
            <span className="text-xs text-slate-400 block font-medium">
              {language === 'ar' ? 'البلاغات المسجلة' : 'Logged Incidents'}
            </span>
            <div className="text-3xl font-black text-white mt-1">{stats.totalReports}</div>
            <span className="text-[11px] text-teal-400 mt-1 block">{t('cityJurisdiction')}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center">
            <span className="text-xs text-slate-400 block font-medium">
              {language === 'ar' ? 'تمت معالجتها واحتواؤها' : 'Remediated & Resolved'}
            </span>
            <div className="text-3xl font-black text-teal-400 mt-1">{stats.resolvedCount}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {stats.resolutionRate}% {language === 'ar' ? 'نسبة الإنجاز' : 'success rate'}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center">
            <span className="text-xs text-slate-400 block font-medium">
              {language === 'ar' ? 'المراقبون الميدانيون' : 'Active Health Officers'}
            </span>
            <div className="text-3xl font-black text-cyan-400 mt-1">7</div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {language === 'ar' ? 'مفتش كشف ومختبر بدوام كامل' : 'Full-time field inspectors'}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center">
            <span className="text-xs text-slate-400 block font-medium">
              {language === 'ar' ? 'أحياء طرابلس المغطاة' : 'Monitoring Sectors'}
            </span>
            <div className="text-3xl font-black text-amber-400 mt-1">15</div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {language === 'ar' ? 'منطقة وحي سكني وتجاري' : 'Tripoli districts covered'}
            </span>
          </div>
        </div>
      )}

      {/* Health Advisories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <Droplets className="w-5 h-5" />
            <h3>{language === 'ar' ? 'إرشادات سلامة مياه الشرب والاستخدام المنزلي' : 'Tripoli Drinking Water Safety Directive'}</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === 'ar'
              ? 'بسبب انقطاع التيار الكهربائي المتكرر وتأثيره على مضخات الكلورة في قطاعات من باب التبانة والبداوي:'
              : 'Due to intermittent municipal electricity impacting pumping chlorination in parts of Bab Al-Tabbaneh and Beddawi:'}
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            {language === 'ar' ? (
              <>
                <li>غلي مياه الصنبور بقوة لمدة 3 دقائق كاملة قبل استخدامها للشرب أو إعداد حليب الأطفال.</li>
                <li>فحص وتنظيف خزانات المياه على أسطح المباني كل 30 يوماً للتأكد من خلوها من الرواسب.</li>
                <li>الإبلاغ الفوري عبر المنصة عند ملاحظة أي تغير في لون المياه أو انبعاث روائح مياه مبتذلة.</li>
              </>
            ) : (
              <>
                <li>Boil tap water vigorously for 3 minutes before preparation of baby formula or drinking.</li>
                <li>Inspect household rooftop water storage tanks every 30 days for sediment or organic biofilm.</li>
                <li>Report sudden discolored water or sewer odor immediately via the citizen portal.</li>
              </>
            )}
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <h3>{language === 'ar' ? 'تنبيه الرقابة على المطاعم ومحلات الأغذية' : 'Food Safety & Restaurant Inspection Alert'}</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === 'ar'
              ? 'تعليمات مصلحة الصحة في بلدية طرابلس لمحلات الشاورما والمطاعم وباعة المأكولات:'
              : 'Municipal Health Directorate hygiene guidelines for eateries, shawarma shops, and street vendors:'}
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            {language === 'ar' ? (
              <>
                <li>حفظ اللحوم والدواجن المبردة تحت درجة حرارة 4 مئوية بشكل مستمر وصارم.</li>
                <li>يمنع منعاً باتاً عرض صلصات المايونيز والثوم المصنوعة من بيض نيء غير مبستر في حرارة الغرفة.</li>
                <li>إلزام كافة عمال المنشآت الغذائية بحمل بطاقة صحية سنوية سارية صادرة عن بلدية طرابلس.</li>
              </>
            ) : (
              <>
                <li>Refrigerated meats must remain strictly below 4°C at all times.</li>
                <li>Mayonnaise and garlic pastes containing unpasteurized eggs are prohibited from ambient display.</li>
                <li>All commercial food handlers must carry a valid Tripoli Municipal Health Fitness Certificate.</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Emergency Hotlines in Tripoli */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-teal-400" />
            <span>{language === 'ar' ? 'خطوط الطوارئ الصحية في طرابلس' : 'Municipal Health Emergency Contacts'}</span>
          </h4>
          <p className="text-xs text-slate-400">
            {language === 'ar'
              ? 'مكتب طوارئ الرقابة الصحية: 06-440120 • الدفاع المدني: 125 • الصليب الأحمر اللبناني: 140'
              : 'Directorate Hotline: 06-440120 • Civil Defense: 125 • Lebanese Red Cross: 140'}
          </p>
        </div>

        <button
          onClick={onOpenReport}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors"
        >
          {t('submitIncident')}
        </button>
      </div>
    </div>
  );
};
