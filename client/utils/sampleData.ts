/**
 * Tripoli Public Health Monitoring System - shared data types.
 * These mirror the server's Mongoose models after normalization (see utils/normalize.ts):
 * every document exposes `id` (from `_id`) and populated references are flattened.
 */

export type UserRole = "CITIZEN" | "HEALTH_OFFICER" | "ADMINISTRATOR";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ReportStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "IN_INVESTIGATION"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  district: string;
  badgeNumber?: string;
  title?: string;
  avatarUrl?: string;
  bio?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Report {
  id: string;
  reportNumber: string;
  citizen: {
    userId: string;
    name: string;
    phone: string;
    email: string;
  };
  category: {
    name: string;
    code: string;
  };
  title: string;
  description: string;
  incidentDate: string;
  location: {
    address: string;
    district: string;
    lat: number;
    lng: number;
  };
  affectedCount: number;
  initialSeverity: RiskLevel;
  imageUrl?: string;
  additionalComments?: string;
  status: ReportStatus;
  assignedOfficer?: {
    id: string;
    name: string;
    badgeNumber: string;
  };
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: {
    severityScore: number;
    affectedPeopleScore: number;
    recentReportsScore: number;
    geographicClusterScore: number;
    categoryScore: number;
    explanations: string[];
  };
  statusHistory: Array<{
    oldStatus: string;
    newStatus: string;
    changedBy: string;
    role: string;
    timestamp: string;
    comment: string;
  }>;
  createdAt: string;
}

export interface Investigation {
  id: string;
  investigationCode: string;
  reportId: string;
  reportNumber: string;
  officer: {
    id: string;
    name: string;
    badgeNumber: string;
  };
  investigationDate: string;
  findings: string;
  actionsTaken: string;
  recommendations: string;
  result: "Confirmed" | "Not Confirmed" | "Inconclusive" | "Resolved";
  samplesCollected: string;
  notes: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

export interface Cluster {
  id: string;
  clusterCode: string;
  categoryName: string;
  district: string;
  centroid: {
    lat: number;
    lng: number;
  };
  radiusMeters: number;
  reportNumbers: string[];
  reportCount: number;
  totalAffected: number;
  riskLevel: RiskLevel;
  timeWindowHours: number;
  detectedAt: string;
  status: "ACTIVE" | "INVESTIGATING" | "CONTAINED" | "RESOLVED";
}

export interface Alert {
  id: string;
  alertCode: string;
  alertType:
    | "CRITICAL_INCIDENT"
    | "CLUSTER_DETECTED"
    | "GEOGRAPHIC_SPIKE"
    | "CATEGORY_SURGE"
    | "UNRESOLVED_TIMEOUT";
  title: string;
  description: string;
  relatedReportId?: string;
  relatedClusterId?: string;
  riskLevel: RiskLevel;
  area: string;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  assignedOfficer?: {
    name: string;
    badgeNumber?: string;
  };
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "STATUS_UPDATE" | "CRITICAL_ALERT" | "CLUSTER_ALERT" | "ASSIGNMENT" | "SYSTEM";
  isRead: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
  baseWeight: number;
  icon: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  time: string;
}

export interface DashboardStats {
  totalReports: number;
  reportsToday: number;
  reportsThisWeek: number;
  reportsThisMonth: number;
  criticalCount: number;
  highCount: number;
  underInvestigationCount: number;
  resolvedCount: number;
  resolutionRate: number;
  activeAlerts: number;
  activeClusters: number;
  totalInvestigations: number;
  categoryData: Array<{ name: string; count: number }>;
  statusData: Array<{ status: string; count: number }>;
  districtData: Array<{ district: string; count: number }>;
  riskData: Array<{ level: string; count: number }>;
}

export const EMPTY_STATS: DashboardStats = {
  totalReports: 0,
  reportsToday: 0,
  reportsThisWeek: 0,
  reportsThisMonth: 0,
  criticalCount: 0,
  highCount: 0,
  underInvestigationCount: 0,
  resolvedCount: 0,
  resolutionRate: 0,
  activeAlerts: 0,
  activeClusters: 0,
  totalInvestigations: 0,
  categoryData: [],
  statusData: [],
  districtData: [],
  riskData: [],
};
