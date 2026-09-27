import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Report } from '../../utils/sampleData';
import { getRiskColor, getStatusBadge, formatDateTime } from '../../utils/helper';
import { TRIPOLI_DISTRICTS } from '../../utils/APIConst';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  Filter,
  FileSpreadsheet,
  MapPin,
  Users,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Plus
} from 'lucide-react';
import { SkeletonTableRow, SkeletonText } from './common/Skeleton';

interface ReportsManagementProps {
  onSelectReport: (report: Report) => void;
  onOpenNewReport: () => void;
}

export const ReportsManagement: React.FC<ReportsManagementProps> = ({ onSelectReport, onOpenNewReport }) => {
  const {
    t,
    translateCategory,
    translateDistrict,
    translateStatus,
    translateRisk,
    translateTitle,
    language,
    isRtl
  } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterDistrict, setFilterDistrict] = useState('ALL');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'risk' | 'date' | 'affected'>('risk');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const { reports: allReports, categories, refresh } = useData();

  const handleRefresh = async () => {
    setIsLoading(true);
    await refresh();
    setIsLoading(false);
  };

  // Filter & Search Logic
  const filtered = allReports.filter(r => {
    if (filterCategory !== 'ALL' && r.category.name !== filterCategory) return false;
    if (filterDistrict !== 'ALL' && r.location.district !== filterDistrict) return false;
    if (filterRisk !== 'ALL' && r.riskLevel !== filterRisk) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNum = r.reportNumber.toLowerCase().includes(q);
      const matchTitle = r.title.toLowerCase().includes(q) || translateTitle(r.title).toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchCit = r.citizen.name.toLowerCase().includes(q);
      const matchDist = r.location.district.toLowerCase().includes(q) || translateDistrict(r.location.district).toLowerCase().includes(q);
      return matchNum || matchTitle || matchDesc || matchCit || matchDist;
    }
    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'risk') return b.riskScore - a.riskScore;
    if (sortBy === 'affected') return b.affectedCount - a.affectedCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-400" />
            <h1 className="text-lg font-bold text-white">
              {language === 'ar' ? 'سجل بلاغات الصحة العامة في طرابلس' : 'Tripoli Public Health Incident Records'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'ar'
              ? `عرض ${filtered.length} من أصل ${allReports.length} بلاغاً مسجلاً في كافة أحياء طرابلس`
              : `Showing ${filtered.length} of ${allReports.length} incidents across Tripoli`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            title={language === 'ar' ? 'تحديث السجلات' : 'Refresh Records'}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
          <button
            onClick={onOpenNewReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('submitIncident')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Ribbon */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder={t('searchPlaceholderReports')}
              className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500`}
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
            className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">{t('allCategories')}</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{translateCategory(c.name)}</option>
            ))}
          </select>

          {/* District Filter */}
          <select
            value={filterDistrict}
            onChange={e => { setFilterDistrict(e.target.value); setCurrentPage(1); }}
            className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">{t('allDistricts')}</option>
            {TRIPOLI_DISTRICTS.map(d => (
              <option key={d} value={d}>{translateDistrict(d)}</option>
            ))}
          </select>

          {/* Risk Filter */}
          <select
            value={filterRisk}
            onChange={e => { setFilterRisk(e.target.value); setCurrentPage(1); }}
            className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">{t('allRisks')}</option>
            <option value="CRITICAL">{translateRisk('CRITICAL')} (76-100)</option>
            <option value="HIGH">{translateRisk('HIGH')} (51-75)</option>
            <option value="MEDIUM">{translateRisk('MEDIUM')} (26-50)</option>
            <option value="LOW">{translateRisk('LOW')} (0-25)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">{t('allStatuses')}</option>
            <option value="SUBMITTED">{translateStatus('SUBMITTED')}</option>
            <option value="UNDER_REVIEW">{translateStatus('UNDER_REVIEW')}</option>
            <option value="VERIFIED">{translateStatus('VERIFIED')}</option>
            <option value="IN_INVESTIGATION">{translateStatus('IN_INVESTIGATION')}</option>
            <option value="RESOLVED">{translateStatus('RESOLVED')}</option>
            <option value="CLOSED">{translateStatus('CLOSED')}</option>
            <option value="REJECTED">{translateStatus('REJECTED')}</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{t('sortBy')}</span>
            <button
              onClick={() => setSortBy('risk')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                sortBy === 'risk' ? 'bg-teal-600 text-white' : 'hover:text-white bg-slate-800/80'
              }`}
            >
              {t('highestRiskScore')}
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                sortBy === 'date' ? 'bg-teal-600 text-white' : 'hover:text-white bg-slate-800/80'
              }`}
            >
              {t('mostRecent')}
            </button>
            <button
              onClick={() => setSortBy('affected')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                sortBy === 'affected' ? 'bg-teal-600 text-white' : 'hover:text-white bg-slate-800/80'
              }`}
            >
              {t('mostAffected')}
            </button>
          </div>

          <div className="font-mono">
            {t('pageOf')} {currentPage} {t('ofWord')} {totalPages}
          </div>
        </div>
      </div>

      {/* Reports Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-xs text-left rtl:text-right">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-3.5">{t('reportNumberCol')}</th>
                <th className="py-3 px-3.5">{t('categoryCol')}</th>
                <th className="py-3 px-3.5">{t('titleLocationCol')}</th>
                <th className="py-3 px-3.5">{t('riskScoreCol')}</th>
                <th className="py-3 px-3.5">{t('affectedCol')}</th>
                <th className="py-3 px-3.5">{t('statusCol')}</th>
                <th className="py-3 px-3.5">{t('assignedOfficerCol')}</th>
                <th className="py-3 px-3.5 text-right rtl:text-left">{t('actionCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <>
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                </>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    {t('noMatchingReports')}
                  </td>
                </tr>
              ) : (
                paginated.map(rep => {
                  const colors = getRiskColor(rep.riskLevel);
                  const statusColors = getStatusBadge(rep.status);

                  return (
                    <tr key={rep.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-bold text-teal-300 whitespace-nowrap">
                        {rep.reportNumber}
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-slate-200">
                        {translateCategory(rep.category.name)}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-white max-w-sm truncate">
                          {translateTitle(rep.title, rep.category.name, rep.location.district)}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                          <span>{translateDistrict(rep.location.district)}</span>
                          <span>• {formatDateTime(rep.incidentDate)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`font-black px-2 py-0.5 rounded text-[11px] ${colors.badge}`}>
                          {rep.riskScore} ({translateRisk(rep.riskLevel)})
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-slate-300 whitespace-nowrap">
                        ~{rep.affectedCount} {t('people')}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColors.badge}`}>
                          {translateStatus(rep.status)}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-300 text-[11px]">
                        {rep.assignedOfficer?.name || <span className="text-slate-400 italic">{t('unassigned')}</span>}
                      </td>
                      <td className="py-3 px-3.5 text-right rtl:text-left">
                        <button
                          onClick={() => onSelectReport(rep)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-teal-600 hover:text-white text-teal-300 border border-slate-700 rounded-lg font-semibold text-xs transition-all inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('inspect')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
            <div>
              {language === 'ar'
                ? `عرض ${(currentPage - 1) * pageSize + 1} إلى ${Math.min(currentPage * pageSize, filtered.length)} من إجمالي ${filtered.length} بلاغاً`
                : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length} entries`}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                {t('previous')}
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                const p = idx + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg font-bold transition-colors ${
                      currentPage === p ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                {t('next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
