import React, { useState, useEffect } from 'react';
import { auditService } from '../../services/notificationService';
import { AuditLog } from '../../utils/sampleData';
import { formatDateTime } from '../../utils/helper';
import { useLanguage } from '../../context/LanguageContext';
import { History, Shield, Search, Lock, UserCheck, RefreshCw } from 'lucide-react';
import { SkeletonAuditLogRow } from './common/Skeleton';

export const AuditLogsView: React.FC = () => {
  const {
    t,
    translateAuditAction,
    translateAuditDetails,
    translateRole,
    language,
    isRtl
  } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadError, setLoadError] = useState('');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      setLogs(await auditService.getLogs());
      setLoadError('');
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleRefresh = () => {
    loadLogs();
  };

  const filtered = logs.filter(l => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.resource.toLowerCase().includes(q) || l.details.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{t('auditLogsTitle')}</h1>
            <p className="text-xs text-slate-400">{t('auditLogsDesc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            title={language === 'ar' ? 'تحديث سجل التدقيق' : 'Refresh Audit Logs'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
          <div className="relative min-w-[240px]">
            <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('searchAudit')}
              className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-teal-500`}
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left rtl:text-right text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-3.5">{language === 'ar' ? 'الوقت والتاريخ' : 'Timestamp'}</th>
                <th className="py-3 px-3.5">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                <th className="py-3 px-3.5">{language === 'ar' ? 'نوع الإجراء' : 'Action'}</th>
                <th className="py-3 px-3.5">{language === 'ar' ? 'السجل المستهدف' : 'Target Resource'}</th>
                <th className="py-3 px-3.5">{language === 'ar' ? 'التفاصيل والملاحظات' : 'Details'}</th>
                <th className="py-3 px-3.5 text-right rtl:text-left">{language === 'ar' ? 'عنوان IP' : 'IP Address'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <>
                  <SkeletonAuditLogRow />
                  <SkeletonAuditLogRow />
                  <SkeletonAuditLogRow />
                  <SkeletonAuditLogRow />
                  <SkeletonAuditLogRow />
                  <SkeletonAuditLogRow />
                </>
              ) : loadError || filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`py-8 text-center text-xs ${loadError ? 'text-rose-400' : 'text-slate-400'}`}>
                    {loadError || (language === 'ar' ? 'لا توجد سجلات تدقيق' : 'No audit log entries')}
                  </td>
                </tr>
              ) : (
                filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                      {formatDateTime(log.time)}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="font-bold text-white block">{log.user}</span>
                      <span className="text-[10px] text-teal-400">{translateRole(log.role)}</span>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[10px] font-bold text-slate-300 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {translateAuditAction(log.action)}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-teal-300 font-mono text-[11px] whitespace-nowrap">
                      {log.resource}
                    </td>
                    <td className="py-3 px-3.5 text-slate-300 text-xs max-w-md">
                      {translateAuditDetails(log.details)}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400 text-right rtl:text-left">
                      {log.ip}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
