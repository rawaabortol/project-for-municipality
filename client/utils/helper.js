export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
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

export function formatDateTime(dateStr) {
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

export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getRiskColor(level) {
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
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        text: 'text-teal-700',
        border: 'border-teal-400',
        badge: 'bg-teal-100 text-teal-800 border border-teal-200',
        pinColor: '#0d9488'
      };
  }
}

export function getStatusBadge(status) {
  switch (status) {
    case 'RESOLVED':
    case 'CLOSED':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    case 'IN_INVESTIGATION':
      return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30';
    case 'VERIFIED':
      return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
    case 'UNDER_REVIEW':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    case 'REJECTED':
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    case 'SUBMITTED':
    default:
      return 'bg-teal-500/10 text-teal-400 border border-teal-500/30';
  }
}
