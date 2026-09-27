import type {
  Alert,
  AppNotification,
  AuditLog,
  Category,
  Cluster,
  Investigation,
  Report,
  User,
} from "./sampleData";

/** Server documents use `_id` and may carry populated references (objects) instead of ids. */
const idOf = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id ?? value.id ?? "");
};

export const toUser = (u: any): User => ({
  id: idOf(u),
  name: u.name ?? "",
  email: u.email ?? "",
  role: u.role,
  phone: u.phone ?? "",
  district: u.district ?? "Al-Tal",
  badgeNumber: u.badgeNumber || undefined,
  title: u.title || undefined,
  avatarUrl: u.avatar || u.avatarUrl || undefined,
  bio: u.bio || undefined,
  isActive: u.isActive,
  createdAt: u.createdAt,
});

export const toReport = (r: any): Report => ({
  id: idOf(r),
  reportNumber: r.reportNumber,
  citizen: {
    userId: idOf(r.citizen?.userId),
    name: r.citizen?.name ?? "",
    phone: r.citizen?.phone ?? "",
    email: r.citizen?.email ?? "",
  },
  category: { name: r.category?.name ?? "", code: r.category?.code ?? "" },
  title: r.title,
  description: r.description,
  incidentDate: r.incidentDate,
  location: {
    address: r.location?.address ?? "",
    district: r.location?.district ?? "Tripoli",
    lat: Number(r.location?.lat),
    lng: Number(r.location?.lng),
  },
  affectedCount: r.affectedCount ?? 0,
  initialSeverity: r.initialSeverity,
  imageUrl: r.imageUrl || undefined,
  additionalComments: r.additionalComments || "",
  status: r.status,
  assignedOfficer: r.assignedOfficer?.name
    ? {
        id: idOf(r.assignedOfficer.officerId),
        name: r.assignedOfficer.name,
        badgeNumber: r.assignedOfficer.badgeNumber ?? "",
      }
    : undefined,
  riskScore: r.riskScore ?? 0,
  riskLevel: r.riskLevel,
  riskFactors: {
    severityScore: r.riskFactors?.severityScore ?? 0,
    affectedPeopleScore: r.riskFactors?.affectedPeopleScore ?? 0,
    recentReportsScore: r.riskFactors?.recentReportsScore ?? 0,
    geographicClusterScore: r.riskFactors?.geographicClusterScore ?? 0,
    categoryScore: r.riskFactors?.categoryScore ?? 0,
    explanations: r.riskFactors?.explanations ?? [],
  },
  statusHistory: (r.statusHistory ?? []).map((h: any) => ({
    oldStatus: h.oldStatus,
    newStatus: h.newStatus,
    changedBy: typeof h.changedBy === "object" ? h.changedBy?.name ?? "" : h.changedBy ?? "",
    role: typeof h.changedBy === "object" ? h.changedBy?.role ?? "" : h.role ?? "",
    timestamp: h.timestamp,
    comment: h.comment ?? "",
  })),
  createdAt: r.createdAt,
});

export const toInvestigation = (i: any): Investigation => ({
  id: idOf(i),
  investigationCode: i.investigationCode,
  reportId: idOf(i.reportId),
  reportNumber: i.reportNumber ?? i.reportId?.reportNumber ?? "",
  officer: {
    id: idOf(i.officer?.userId),
    name: i.officer?.name ?? "",
    badgeNumber: i.officer?.badgeNumber ?? "",
  },
  investigationDate: i.investigationDate,
  findings: i.findings ?? "",
  actionsTaken: i.actionsTaken ?? "",
  recommendations: i.recommendations ?? "",
  result: i.result,
  samplesCollected: i.samplesCollected ?? "",
  notes: i.notes ?? "",
  status: i.status,
});

export const toCluster = (c: any): Cluster => ({
  id: idOf(c),
  clusterCode: c.clusterCode,
  categoryName: c.categoryName,
  district: c.district,
  centroid: { lat: Number(c.centroid?.lat), lng: Number(c.centroid?.lng) },
  radiusMeters: c.radiusMeters ?? 1000,
  reportNumbers: (c.reportIds ?? [])
    .map((r: any) => (typeof r === "object" ? r.reportNumber : undefined))
    .filter(Boolean),
  reportCount: c.reportCount ?? 0,
  totalAffected: c.totalAffected ?? 0,
  riskLevel: c.riskLevel,
  timeWindowHours: c.timeWindowHours ?? 72,
  detectedAt: c.detectedAt,
  status: c.status,
});

export const toAlert = (a: any): Alert => ({
  id: idOf(a),
  alertCode: a.alertCode,
  alertType: a.alertType,
  title: a.title,
  description: a.description,
  relatedReportId: idOf(a.relatedReportId) || undefined,
  relatedClusterId: idOf(a.relatedClusterId) || undefined,
  riskLevel: a.riskLevel,
  area: a.area,
  status: a.status,
  assignedOfficer: a.assignedOfficer?.name ? { name: a.assignedOfficer.name } : undefined,
  createdAt: a.createdAt,
});

export const toNotification = (n: any): AppNotification => ({
  id: idOf(n),
  userId: idOf(n.userId),
  title: n.title,
  message: n.message,
  type: n.type,
  isRead: !!n.isRead,
  createdAt: n.createdAt,
});

export const toCategory = (c: any): Category => ({
  id: idOf(c),
  name: c.name,
  code: c.code,
  description: c.description ?? "",
  baseWeight: c.baseWeight ?? 10,
  icon: c.icon ?? "AlertCircle",
  isActive: c.isActive !== false,
});

export const toAuditLog = (l: any): AuditLog => ({
  id: idOf(l),
  user: l.userName ?? "",
  role: l.userRole ?? "",
  action: l.action ?? "",
  resource: l.resource ?? "",
  details: l.details ?? "",
  ip: l.ipAddress ?? "",
  time: l.createdAt,
});
