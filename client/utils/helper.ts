import { RiskLevel, ReportStatus } from './APIConst';

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDateTime(dateStr: string | Date | undefined): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDate(dateStr: string | Date | undefined): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getRiskColor(level: RiskLevel | string): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  pinColor: string;
} {
  switch (level?.toUpperCase()) {
    case 'CRITICAL':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        text: 'text-rose-700',
        border: 'border-rose-400',
        badge: 'bg-rose-100 text-rose-800 border border-rose-200',
        pinColor: '#e11d48'
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-50 text-orange-700 border-orange-200',
        text: 'text-orange-700',
        border: 'border-orange-400',
        badge: 'bg-orange-100 text-orange-800 border border-orange-200',
        pinColor: '#ea580c'
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        text: 'text-amber-700',
        border: 'border-amber-400',
        badge: 'bg-amber-100 text-amber-800 border border-amber-200',
        pinColor: '#d97706'
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: 'text-emerald-700',
        border: 'border-emerald-400',
        badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        pinColor: '#059669'
      };
  }
}

export function getStatusBadge(status: ReportStatus | string): {
  badge: string;
  label: string;
  dotColor: string;
} {
  switch (status?.toUpperCase()) {
    case 'SUBMITTED':
      return { badge: 'bg-blue-50 text-blue-700 border border-blue-200', label: 'Submitted', dotColor: 'bg-blue-500' };
    case 'UNDER_REVIEW':
      return { badge: 'bg-purple-50 text-purple-700 border border-purple-200', label: 'Under Review', dotColor: 'bg-purple-500' };
    case 'VERIFIED':
      return { badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200', label: 'Verified', dotColor: 'bg-indigo-500' };
    case 'IN_INVESTIGATION':
      return { badge: 'bg-amber-50 text-amber-800 border border-amber-300 font-semibold', label: 'In Investigation', dotColor: 'bg-amber-500' };
    case 'RESOLVED':
      return { badge: 'bg-teal-50 text-teal-700 border border-teal-200 font-semibold', label: 'Resolved', dotColor: 'bg-teal-500' };
    case 'CLOSED':
      return { badge: 'bg-slate-100 text-slate-700 border border-slate-300', label: 'Closed', dotColor: 'bg-slate-400' };
    case 'REJECTED':
      return { badge: 'bg-rose-50 text-rose-700 border border-rose-200', label: 'Rejected', dotColor: 'bg-rose-500' };
    default:
      return { badge: 'bg-slate-100 text-slate-700', label: status, dotColor: 'bg-slate-400' };
  }
}
