import React from 'react';

interface SkeletonProps {
  className?: string;
  rounded?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Core pulsing element with Tailwind animations and realistic shimmer sweep
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  rounded = 'rounded-xl',
  style,
  children
}) => {
  return (
    <div
      style={style}
      className={`relative overflow-hidden bg-slate-800/80 border border-slate-700/40 animate-pulse ${rounded} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-700/30 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lineClassName?: string;
}> = ({ lines = 3, className = 'space-y-2', lineClassName = 'h-3.5 bg-slate-800/80 rounded' }) => {
  const widths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4', 'w-2/3'];
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`${lineClassName} ${widths[i % widths.length]}`}
          rounded="rounded"
        />
      ))}
    </div>
  );
};

/**
 * Metric KPI Box Skeleton (Dashboards, Analytics, Public Portal)
 */
export const SkeletonMetricCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-700/20 to-transparent pointer-events-none" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 bg-slate-800" rounded="rounded" />
        <Skeleton className="w-6 h-6 rounded-lg bg-slate-800" />
      </div>
      <div className="mt-3">
        <Skeleton className="h-8 w-20 bg-slate-800" rounded="rounded-lg" />
      </div>
      <div className="mt-2.5">
        <Skeleton className="h-2.5 w-32 bg-slate-800" rounded="rounded" />
      </div>
    </div>
  );
};

/**
 * Table Row Skeleton for Reports Management
 */
export const SkeletonTableRow: React.FC<{ index?: number }> = () => {
  return (
    <tr className="border-b border-slate-800/60 bg-slate-900/40">
      <td className="py-3 px-4">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28 bg-slate-800" rounded="rounded" />
          <Skeleton className="h-2.5 w-20 bg-slate-800/70" rounded="rounded" />
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-44 bg-slate-800" rounded="rounded" />
          <Skeleton className="h-2.5 w-32 bg-slate-800/60" rounded="rounded" />
        </div>
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-6 w-24 bg-slate-800" rounded="rounded-md" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-6 w-20 bg-slate-800" rounded="rounded-md" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-6 w-16 bg-slate-800" rounded="rounded-md" />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-12 bg-slate-800" rounded="rounded" />
          <Skeleton className="h-2 w-8 bg-slate-800" rounded="rounded" />
        </div>
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-6 w-20 bg-slate-800" rounded="rounded-md" />
      </td>
      <td className="py-3 px-4 text-center">
        <Skeleton className="h-8 w-16 bg-slate-800 inline-block" rounded="rounded-lg" />
      </td>
    </tr>
  );
};

/**
 * Report Card Skeleton for Mobile and Triage Lists
 */
export const SkeletonReportCard: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-700/20 to-transparent pointer-events-none" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24 bg-slate-800" rounded="rounded" />
          <Skeleton className="h-5 w-16 bg-slate-800" rounded="rounded-md" />
        </div>
        <Skeleton className="h-5 w-20 bg-slate-800" rounded="rounded-md" />
      </div>
      <div>
        <Skeleton className="h-4 w-3/4 bg-slate-800 mb-1.5" rounded="rounded" />
        <Skeleton className="h-3 w-5/6 bg-slate-800/60" rounded="rounded" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <Skeleton className="h-3 w-28 bg-slate-800/70" rounded="rounded" />
        <Skeleton className="h-6 w-14 bg-slate-800" rounded="rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Investigation Card Skeleton for Investigations View & Dashboard
 */
export const SkeletonInvestigationCard: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-700/20 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl bg-slate-800" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32 bg-slate-800" rounded="rounded" />
            <Skeleton className="h-3 w-24 bg-slate-800/70" rounded="rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24 bg-slate-800" rounded="rounded-md" />
          <Skeleton className="h-6 w-20 bg-slate-800" rounded="rounded-md" />
        </div>
      </div>

      {/* Findings Box */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40 space-y-2">
        <Skeleton className="h-3.5 w-28 bg-slate-700" rounded="rounded" />
        <Skeleton className="h-3 w-full bg-slate-800" rounded="rounded" />
        <Skeleton className="h-3 w-4/5 bg-slate-800" rounded="rounded" />
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/30 space-y-1.5">
          <Skeleton className="h-3 w-24 bg-slate-700" rounded="rounded" />
          <Skeleton className="h-3 w-5/6 bg-slate-800" rounded="rounded" />
        </div>
        <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/30 space-y-1.5">
          <Skeleton className="h-3 w-28 bg-slate-700" rounded="rounded" />
          <Skeleton className="h-3 w-4/5 bg-slate-800" rounded="rounded" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-32 bg-slate-800" rounded="rounded" />
        </div>
        <Skeleton className="h-8 w-28 bg-slate-800" rounded="rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Cluster Surveillance Card Skeleton
 */
export const SkeletonClusterCard: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-700/20 to-transparent pointer-events-none" />
      
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full bg-slate-800" />
          <Skeleton className="h-4 w-32 bg-slate-800" rounded="rounded" />
        </div>
        <Skeleton className="h-6 w-20 bg-slate-800" rounded="rounded-md" />
      </div>

      {/* Subtitle / Category */}
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-48 bg-slate-800" rounded="rounded" />
        <Skeleton className="h-3 w-64 bg-slate-800/70" rounded="rounded" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
        <div className="space-y-1">
          <Skeleton className="h-2.5 w-16 bg-slate-700" rounded="rounded" />
          <Skeleton className="h-5 w-10 bg-slate-800" rounded="rounded" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-2.5 w-16 bg-slate-700" rounded="rounded" />
          <Skeleton className="h-5 w-12 bg-slate-800" rounded="rounded" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-2.5 w-16 bg-slate-700" rounded="rounded" />
          <Skeleton className="h-5 w-10 bg-slate-800" rounded="rounded" />
        </div>
      </div>

      {/* Linked reports pills */}
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-5 w-20 bg-slate-800" rounded="rounded" />
        <Skeleton className="h-5 w-20 bg-slate-800" rounded="rounded" />
        <Skeleton className="h-5 w-20 bg-slate-800" rounded="rounded" />
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
        <Skeleton className="h-3 w-36 bg-slate-800" rounded="rounded" />
        <Skeleton className="h-7 w-24 bg-slate-800" rounded="rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Alert Item Skeleton
 */
export const SkeletonAlertItem: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-700/20 to-transparent pointer-events-none" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-8 h-8 rounded-lg bg-slate-800" />
          <Skeleton className="h-4 w-28 bg-slate-800" rounded="rounded" />
        </div>
        <Skeleton className="h-5 w-16 bg-slate-800" rounded="rounded-md" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-3/4 bg-slate-800" rounded="rounded" />
        <Skeleton className="h-3 w-full bg-slate-800/60" rounded="rounded" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24 bg-slate-800" rounded="rounded" />
          <Skeleton className="h-3 w-28 bg-slate-800" rounded="rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-20 bg-slate-800" rounded="rounded-lg" />
          <Skeleton className="h-7 w-20 bg-slate-800" rounded="rounded-lg" />
        </div>
      </div>
    </div>
  );
};

/**
 * Chart Card Skeleton with simulated chart axes and bars/pie
 */
export const SkeletonChartCard: React.FC<{ type?: 'bar' | 'pie' }> = ({ type = 'bar' }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-700/20 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40 bg-slate-800" rounded="rounded" />
          <Skeleton className="h-3 w-60 bg-slate-800/70" rounded="rounded" />
        </div>
        <Skeleton className="w-8 h-8 rounded-lg bg-slate-800" />
      </div>

      {/* Chart Canvas Placeholder */}
      <div className="h-64 w-full bg-slate-950/60 rounded-xl p-4 flex flex-col justify-end border border-slate-800/80">
        {type === 'bar' ? (
          <div className="flex items-end justify-between h-48 px-4 gap-3">
            {[45, 75, 30, 90, 60, 40, 85].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <Skeleton
                  className="w-full bg-slate-800/90"
                  style={{ height: `${height}%` }}
                  rounded="rounded-t-md"
                />
                <Skeleton className="h-2 w-full max-w-[36px] bg-slate-800/60" rounded="rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center gap-6">
            <div className="w-40 h-40 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
              <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-slate-800/80" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 bg-slate-800" rounded="rounded" />
              <Skeleton className="h-3 w-28 bg-slate-800" rounded="rounded" />
              <Skeleton className="h-3 w-20 bg-slate-800" rounded="rounded" />
              <Skeleton className="h-3 w-26 bg-slate-800" rounded="rounded" />
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-1">
        <Skeleton className="h-3 w-16 bg-slate-800" rounded="rounded" />
        <Skeleton className="h-3 w-20 bg-slate-800" rounded="rounded" />
        <Skeleton className="h-3 w-16 bg-slate-800" rounded="rounded" />
      </div>
    </div>
  );
};

/**
 * Tripoli Interactive Map Skeleton
 */
export const SkeletonMap: React.FC<{ height?: string; className?: string }> = ({
  height = 'h-[500px]',
  className = ''
}) => {
  return (
    <div className={`relative w-full ${height} bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-700/15 to-transparent pointer-events-none z-10" />

      {/* Map Grid Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* Simulated radar pulse rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-teal-500/20 animate-ping pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-teal-500/30" />

      {/* Top Map Controls Placeholder */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800">
          <Skeleton className="w-4 h-4 rounded-full bg-slate-700" />
          <Skeleton className="h-3 w-36 bg-slate-700" rounded="rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 bg-slate-900/90 rounded-lg border border-slate-800" />
          <Skeleton className="h-8 w-8 bg-slate-900/90 rounded-lg border border-slate-800" />
        </div>
      </div>

      {/* Simulated Tripoli Cluster Hotspots */}
      <div className="absolute top-1/3 left-1/3 w-6 h-6 rounded-full bg-teal-500/20 border border-teal-400 flex items-center justify-center animate-pulse">
        <div className="w-2 h-2 rounded-full bg-teal-400" />
      </div>
      <div className="absolute top-1/2 left-2/3 w-6 h-6 rounded-full bg-rose-500/20 border border-rose-400 flex items-center justify-center animate-pulse">
        <div className="w-2 h-2 rounded-full bg-rose-400" />
      </div>
      <div className="absolute top-2/3 left-1/2 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center animate-pulse">
        <div className="w-2 h-2 rounded-full bg-amber-400" />
      </div>

      {/* Bottom GIS Status Banner */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2.5 z-20">
        <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
        <Skeleton className="h-3 w-56 bg-slate-700" rounded="rounded" />
      </div>
    </div>
  );
};

/**
 * User Row Skeleton for Admin Users Management
 */
export const SkeletonUserRow: React.FC = () => {
  return (
    <tr className="border-b border-slate-800 bg-slate-900/40">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full bg-slate-800" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32 bg-slate-800" rounded="rounded" />
            <Skeleton className="h-2.5 w-40 bg-slate-800/60" rounded="rounded" />
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-3.5 w-24 bg-slate-800" rounded="rounded" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-6 w-24 bg-slate-800" rounded="rounded-md" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-3 w-28 bg-slate-800" rounded="rounded" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-8 w-32 bg-slate-800" rounded="rounded-lg" />
      </td>
    </tr>
  );
};

/**
 * Category Card Skeleton for Admin Category Management
 */
export const SkeletonCategoryCard: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-700/20 to-transparent pointer-events-none" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-lg bg-slate-800" />
          <Skeleton className="h-4 w-28 bg-slate-800" rounded="rounded" />
        </div>
        <Skeleton className="h-5 w-16 bg-slate-800" rounded="rounded-md" />
      </div>
      <Skeleton className="h-3 w-full bg-slate-800/60" rounded="rounded" />
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
        <Skeleton className="h-3 w-24 bg-slate-800" rounded="rounded" />
        <Skeleton className="h-6 w-16 bg-slate-800" rounded="rounded-md" />
      </div>
    </div>
  );
};

/**
 * Audit Log Row Skeleton
 */
export const SkeletonAuditLogRow: React.FC = () => {
  return (
    <tr className="border-b border-slate-800 bg-slate-900/40">
      <td className="py-3 px-4">
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-24 bg-slate-800" rounded="rounded" />
          <Skeleton className="h-2.5 w-16 bg-slate-800/60" rounded="rounded" />
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-full bg-slate-800" />
          <Skeleton className="h-3.5 w-28 bg-slate-800" rounded="rounded" />
        </div>
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-5 w-20 bg-slate-800" rounded="rounded-md" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-5 w-28 bg-slate-800" rounded="rounded-md" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-3.5 w-32 bg-slate-800" rounded="rounded" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-3 w-56 bg-slate-800/80" rounded="rounded" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-3 w-20 bg-slate-800/60" rounded="rounded" />
      </td>
    </tr>
  );
};
