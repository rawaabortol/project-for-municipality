import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, ShieldAlert, CheckCircle2, MapPin, RefreshCw } from 'lucide-react';
import { SkeletonMetricCard, SkeletonChartCard } from './common/Skeleton';

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#e11d48',
  HIGH: '#ea580c',
  MEDIUM: '#d97706',
  LOW: '#059669'
};

export const AnalyticsCharts: React.FC = () => {
  const { t, translateCategory, translateDistrict, translateStatus, translateRisk, language } = useLanguage();
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


  // Localized chart datasets
  const localizedCategoryData = stats.categoryData.slice(0, 7).map(item => ({
    name: translateCategory(item.name),
    count: item.count
  }));

  const localizedRiskData = stats.riskData.map(item => ({
    level: translateRisk(item.level),
    rawLevel: item.level,
    count: item.count
  }));

  const localizedDistrictData = stats.districtData.slice(0, 8).map(item => ({
    district: translateDistrict(item.district),
    count: item.count
  }));

  const localizedStatusData = stats.statusData.map(item => ({
    status: translateStatus(item.status),
    count: item.count
  }));

  return (
    <div className="space-y-6">
      {/* Top Stat Ribbon */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative">
            <span className="text-xs text-slate-400 block font-medium">{t('totalRegisteredReports')}</span>
            <div className="text-2xl font-black text-white mt-1">{stats.totalReports}</div>
            <span className="text-[11px] text-teal-400 mt-1 block">{t('cityJurisdiction')}</span>
            <button
              onClick={handleRefresh}
              title={language === 'ar' ? 'تحديث البيانات' : 'Refresh Analytics'}
              className="absolute top-4 ltr:right-4 rtl:left-4 p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 block font-medium">{t('resolutionContainmentRate')}</span>
            <div className="text-2xl font-black text-teal-400 mt-1">{stats.resolutionRate}%</div>
            <span className="text-[11px] text-slate-400 mt-1 block">{stats.resolvedCount} {t('closedResolved')}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 block font-medium">{t('criticalRisk')}</span>
            <div className="text-2xl font-black text-rose-500 mt-1">{stats.criticalCount}</div>
            <span className="text-[11px] text-rose-400/80 mt-1 block">{language === 'ar' ? 'درجة الخطورة ≥ 76/100' : 'Score ≥ 76/100'}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 block font-medium">{t('underInspection')}</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{stats.underInvestigationCount}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">{t('activeFieldTeams')}</span>
          </div>
        </div>
      )}

      {/* Row 1: Categories & Risk Level Pie */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonChartCard type="bar" />
          </div>
          <div>
            <SkeletonChartCard type="pie" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Breakdown (2 Cols) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-400" />
                {t('incidentDistributionByCategory')}
              </h3>
              <span className="text-[11px] text-slate-400">{t('topReportedHazards')}</span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={localizedCategoryData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Level Distribution (1 Col) */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                {t('riskLevelDistribution')}
              </h3>
              <span className="text-[11px] text-slate-400">{t('algorithmicAssessment')}</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={localizedRiskData}
                    dataKey="count"
                    nameKey="level"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {localizedRiskData.map((entry) => (
                      <Cell key={entry.level} fill={RISK_COLORS[entry.rawLevel] || '#0d9488'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-3">
              {localizedRiskData.map(r => (
                <div key={r.level} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_COLORS[r.rawLevel] }}></span>
                  <span className="text-slate-300 text-[11px] font-medium">{r.level}: <strong>{r.count}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Row 2: Neighborhood Distribution & Lifecycle Status */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChartCard type="bar" />
          <SkeletonChartCard type="bar" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Density */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              {t('incidentsByTripoliDistrict')}
            </h3>
            <span className="text-[11px] text-slate-400">{t('geographicSpread')}</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={localizedDistrictData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis
                  dataKey="district"
                  stroke="#94a3b8"
                  fontSize={10}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Lifecycle */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              {t('investigationLifecycleStatus')}
            </h3>
            <span className="text-[11px] text-slate-400">{t('pipeline')}</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={localizedStatusData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 45, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="status" type="category" stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
