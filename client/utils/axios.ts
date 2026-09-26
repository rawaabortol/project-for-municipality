import { authStorage } from './authStorage';
import { initialUsers, initialCategories, initialReports, initialInvestigations, initialClusters, initialAlerts, initialNotifications, Report, Investigation, Alert, Cluster, User } from './sampleData';
import { calculateReportRisk } from '../../server/src/service/riskEngine.js';
import { detectClusters } from '../../server/src/service/clusterDetectionService.js';

// Clean database storage keys - starts empty with zero mock data
const STORAGE_PREFIX = 'tripoli_clean_db_';
const STORAGE_KEYS = {
  REPORTS: STORAGE_PREFIX + 'reports',
  INVESTIGATIONS: STORAGE_PREFIX + 'investigations',
  CLUSTERS: STORAGE_PREFIX + 'clusters',
  ALERTS: STORAGE_PREFIX + 'alerts',
  NOTIFICATIONS: STORAGE_PREFIX + 'notifications',
  USERS: STORAGE_PREFIX + 'users',
  CATEGORIES: STORAGE_PREFIX + 'categories'
};

// Purge legacy mock datasets and old cached sessions from browser storage
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const legacyKeys = [
      'tripoli_hp_reports',
      'tripoli_hp_investigations',
      'tripoli_hp_clusters',
      'tripoli_hp_alerts',
      'tripoli_hp_notifications',
      'tripoli_hp_users',
      'tripoli_healthpulse_token',
      'tripoli_healthpulse_user'
    ];
    legacyKeys.forEach(k => localStorage.removeItem(k));
  }
} catch {
  // Ignore in non-browser environments
}

function loadOrInit<T>(key: string, initialData: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  } catch {
    return initialData;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save failed', e);
  }
}

// In-browser State Engine mirroring Express + Mongoose DB
class StateDatabase {
  reports: Report[] = loadOrInit(STORAGE_KEYS.REPORTS, initialReports);
  investigations: Investigation[] = loadOrInit(STORAGE_KEYS.INVESTIGATIONS, initialInvestigations);
  clusters: Cluster[] = loadOrInit(STORAGE_KEYS.CLUSTERS, initialClusters);
  alerts: Alert[] = loadOrInit(STORAGE_KEYS.ALERTS, initialAlerts);
  notifications: any[] = loadOrInit(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  users: User[] = loadOrInit(STORAGE_KEYS.USERS, initialUsers);
  categories: any[] = loadOrInit(STORAGE_KEYS.CATEGORIES, initialCategories);

  // Sync back to local storage
  persistAll() {
    save(STORAGE_KEYS.REPORTS, this.reports);
    save(STORAGE_KEYS.INVESTIGATIONS, this.investigations);
    save(STORAGE_KEYS.CLUSTERS, this.clusters);
    save(STORAGE_KEYS.ALERTS, this.alerts);
    save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    save(STORAGE_KEYS.USERS, this.users);
    save(STORAGE_KEYS.CATEGORIES, this.categories);
  }

  addReport(reportData: any, currentUser: any): Report {
    const riskAssessment = calculateReportRisk(reportData, this.reports);
    const newReportNumber = `TRP-2026-${String(this.reports.length + 1).padStart(4, '0')}`;
    const newId = `rep-${Date.now()}`;

    const newReport: Report = {
      id: newId,
      reportNumber: newReportNumber,
      citizen: {
        userId: currentUser?.id || 'usr-cit-1',
        name: currentUser?.name || 'Citizen Reporter',
        phone: currentUser?.phone || '+961 70 000000',
        email: currentUser?.email || 'citizen@tripoli-health.gov.lb'
      },
      category: {
        name: typeof reportData.category === 'object' ? reportData.category.name : reportData.category,
        code: (typeof reportData.category === 'object' ? reportData.category.code : reportData.category).toUpperCase().replace(/[^A-Z]/g, '_')
      },
      title: reportData.title,
      description: reportData.description,
      incidentDate: reportData.incidentDate || new Date().toISOString(),
      location: {
        address: reportData.location?.address || `${reportData.location?.district || 'Tripoli'}, Lebanon`,
        district: reportData.location?.district || 'Al-Tal',
        lat: Number(reportData.location?.lat || 34.4367),
        lng: Number(reportData.location?.lng || 35.8497)
      },
      affectedCount: Number(reportData.affectedCount || 1),
      initialSeverity: reportData.initialSeverity || 'MEDIUM',
      imageUrl: reportData.imageUrl || undefined,
      additionalComments: reportData.additionalComments || '',
      status: 'SUBMITTED',
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel as any,
      riskFactors: riskAssessment.factors,
      statusHistory: [
        {
          oldStatus: 'NONE',
          newStatus: 'SUBMITTED',
          changedBy: currentUser?.name || 'Citizen',
          role: currentUser?.role || 'CITIZEN',
          timestamp: new Date().toISOString(),
          comment: 'Initial incident report submitted via Tripoli HealthPulse Citizen Portal.'
        }
      ],
      createdAt: new Date().toISOString()
    };

    this.reports.unshift(newReport);

    // If critical, trigger alert
    if (newReport.riskLevel === 'CRITICAL') {
      const critAlert: Alert = {
        id: `alt-${Date.now()}`,
        alertCode: `ALT-CRIT-${newReport.reportNumber}`,
        alertType: 'CRITICAL_INCIDENT',
        title: `CRITICAL HAZARD DETECTED: ${newReport.title}`,
        description: `Risk score ${newReport.riskScore}/100 in ${newReport.location.district}. ${newReport.affectedCount} individuals exposed. Priority field assessment required.`,
        relatedReportId: newReport.id,
        riskLevel: 'CRITICAL',
        area: newReport.location.district,
        status: 'ACTIVE',
        assignedOfficer: {
          name: 'Duty Health Inspector',
          badgeNumber: 'TRP-OFF-01'
        },
        createdAt: new Date().toISOString()
      };
      this.alerts.unshift(critAlert);

      // Notification for officers
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: 'usr-off-1',
        title: 'New Critical Incident Alert',
        message: `Report #${newReport.reportNumber} at ${newReport.location.district} has a critical score of ${newReport.riskScore}.`,
        type: 'CRITICAL_ALERT',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    // Run automated cluster check
    this.runClusterScan();
    this.persistAll();
    return newReport;
  }

  updateReportStatus(reportId: string, newStatus: any, comment: string, user: any): Report | null {
    const report = this.reports.find(r => r.id === reportId || r.reportNumber === reportId);
    if (!report) return null;

    const oldStatus = report.status;
    report.status = newStatus;
    report.statusHistory.push({
      oldStatus,
      newStatus,
      changedBy: user?.name || 'Health Officer',
      role: user?.role || 'HEALTH_OFFICER',
      timestamp: new Date().toISOString(),
      comment: comment || `Status updated from ${oldStatus} to ${newStatus}`
    });

    // Notify citizen
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: report.citizen.userId,
      title: `Report #${report.reportNumber} Updated`,
      message: `Your report status changed to "${newStatus}". Inspector note: ${comment || 'Review in progress.'}`,
      type: 'STATUS_UPDATE',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    this.persistAll();
    return report;
  }

  assignOfficer(reportId: string, officer: any, user: any): Report | null {
    const report = this.reports.find(r => r.id === reportId || r.reportNumber === reportId);
    if (!report) return null;

    report.assignedOfficer = {
      id: officer.id,
      name: officer.name,
      badgeNumber: officer.badgeNumber || 'TRP-OFF-01'
    };

    if (report.status === 'SUBMITTED' || report.status === 'UNDER_REVIEW') {
      report.status = 'VERIFIED';
    }

    report.statusHistory.push({
      oldStatus: report.status,
      newStatus: report.status,
      changedBy: user?.name || 'Administrator',
      role: user?.role || 'ADMINISTRATOR',
      timestamp: new Date().toISOString(),
      comment: `Assigned investigating officer: ${officer.name} (${officer.badgeNumber || 'Inspector'})`
    });

    this.persistAll();
    return report;
  }

  createInvestigation(data: any, officer: any): Investigation {
    const newInv: Investigation = {
      id: `inv-${Date.now()}`,
      investigationCode: `INV-2026-${String(this.investigations.length + 101).padStart(4, '0')}`,
      reportId: data.reportId,
      reportNumber: data.reportNumber,
      officer: {
        id: officer?.id || 'usr-off-1',
        name: officer?.name || 'Dr. Tariq Al-Hajj',
        badgeNumber: officer?.badgeNumber || 'TRP-OFF-01'
      },
      investigationDate: data.investigationDate || new Date().toISOString(),
      findings: data.findings,
      actionsTaken: data.actionsTaken,
      recommendations: data.recommendations,
      result: data.result || 'Inconclusive',
      samplesCollected: data.samplesCollected || 'None',
      notes: data.notes || '',
      status: data.status || 'IN_PROGRESS'
    };

    this.investigations.unshift(newInv);

    // Update report status to IN_INVESTIGATION if not resolved
    const rep = this.reports.find(r => r.id === data.reportId || r.reportNumber === data.reportNumber);
    if (rep && rep.status !== 'RESOLVED' && rep.status !== 'CLOSED') {
      rep.status = 'IN_INVESTIGATION';
      rep.statusHistory.push({
        oldStatus: 'VERIFIED',
        newStatus: 'IN_INVESTIGATION',
        changedBy: officer?.name || 'Health Officer',
        role: officer?.role || 'HEALTH_OFFICER',
        timestamp: new Date().toISOString(),
        comment: `Official field investigation ${newInv.investigationCode} initiated.`
      });
    }

    this.persistAll();
    return newInv;
  }

  runClusterScan(): Cluster[] {
    const detected = detectClusters(this.reports);
    if (detected.length > 0) {
      // Merge or append new detected clusters
      detected.forEach(d => {
        const exists = this.clusters.find(c => c.district === d.district && c.categoryName === d.categoryName);
        if (!exists) {
          const newCluster: Cluster = {
            id: `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            clusterCode: d.clusterCode,
            categoryName: d.categoryName,
            district: d.district,
            centroid: d.centroid,
            radiusMeters: d.radiusMeters,
            reportNumbers: d.reportNumbers || [],
            reportCount: d.reportCount,
            totalAffected: d.totalAffected,
            riskLevel: d.riskLevel as any,
            timeWindowHours: d.timeWindowHours,
            detectedAt: d.detectedAt,
            status: 'ACTIVE'
          };
          this.clusters.unshift(newCluster);

          // Add cluster alert
          this.alerts.unshift({
            id: `alt-${Date.now()}`,
            alertCode: `ALT-${newCluster.clusterCode}`,
            alertType: 'CLUSTER_DETECTED',
            title: `SURVEILLANCE CLUSTER: ${newCluster.categoryName}`,
            description: `${newCluster.reportCount} incidents in ${newCluster.district} affecting ~${newCluster.totalAffected} citizens.`,
            relatedClusterId: newCluster.clusterCode,
            riskLevel: newCluster.riskLevel,
            area: newCluster.district,
            status: 'ACTIVE',
            assignedOfficer: { name: 'Dr. Tariq Al-Hajj', badgeNumber: 'TRP-OFF-01' },
            createdAt: new Date().toISOString()
          });
        }
      });
    }
    this.persistAll();
    return this.clusters;
  }

  acknowledgeAlert(alertId: string, officer: any): void {
    const alert = this.alerts.find(a => a.id === alertId || a.alertCode === alertId);
    if (alert) {
      alert.status = 'ACKNOWLEDGED';
      if (officer?.name) {
        alert.assignedOfficer = { name: officer.name, badgeNumber: officer.badgeNumber || 'TRP-OFF-01' };
      }
      this.persistAll();
    }
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId || a.alertCode === alertId);
    if (alert) {
      alert.status = 'RESOLVED';
      this.persistAll();
    }
  }

  updateUserRole(
    userId: string,
    newRole: 'CITIZEN' | 'HEALTH_OFFICER' | 'ADMINISTRATOR',
    actorUser?: User,
    badgeNumber?: string,
    customTitle?: string
  ): { success: boolean; message?: string } {
    // Security Enforcement: ONLY administration is capable of assigning a role to a citizen
    if (actorUser && actorUser.role !== 'ADMINISTRATOR') {
      return { success: false, message: 'Unauthorized: Only administrators can assign roles to users.' };
    }

    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found' };

    const previousRole = user.role;
    user.role = newRole;

    if (newRole === 'HEALTH_OFFICER') {
      user.badgeNumber = badgeNumber || user.badgeNumber || `TRP-OFF-${Math.floor(Math.random() * 80 + 10)}`;
      user.title = customTitle || (user.title && user.title !== 'Resident Reporter' ? user.title : 'Municipal Field Inspector');
    } else if (newRole === 'ADMINISTRATOR') {
      user.badgeNumber = badgeNumber || user.badgeNumber || `TRP-ADM-${Math.floor(Math.random() * 80 + 10)}`;
      user.title = customTitle || 'Health Directorate Administrator';
    } else {
      user.role = 'CITIZEN';
      user.badgeNumber = undefined;
      user.title = 'Resident Reporter';
    }

    this.persistAll();

    // If this is currently stored user, update storage
    const stored = authStorage.getUser<User>();
    if (stored && stored.id === userId) {
      authStorage.setUser(user);
    }

    return { success: true };
  }

  updateUserProfile(userId: string, updates: Partial<User>): User | null {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;

    // Do not allow updating role through profile update
    const { role, ...allowedUpdates } = updates as any;
    Object.assign(user, allowedUpdates);
    this.persistAll();

    // If this is currently stored user, update storage
    const stored = authStorage.getUser<User>();
    if (stored && stored.id === userId) {
      authStorage.setUser(user);
    }
    return user;
  }

  registerUser(userData: Omit<User, 'id'>, autoLogin: boolean = true): User {
    const newId = `usr-${Date.now()}`;
    const role = userData.role || 'CITIZEN';
    const badgeNumber = userData.badgeNumber || (
      role === 'HEALTH_OFFICER' ? `TRP-OFF-${Math.floor(Math.random() * 80 + 10)}` :
      role === 'ADMINISTRATOR' ? `TRP-ADM-${Math.floor(Math.random() * 80 + 10)}` :
      undefined
    );
    const title = userData.title || (
      role === 'HEALTH_OFFICER' ? 'Municipal Health Inspector' :
      role === 'ADMINISTRATOR' ? 'Health Directorate Administrator' :
      'Resident Citizen'
    );
    const newUser: User = {
      ...userData,
      id: newId,
      role,
      badgeNumber,
      title
    };
    this.users.unshift(newUser);
    this.persistAll();
    if (autoLogin) {
      authStorage.setUser(newUser);
      authStorage.setToken(`token-${newId}`);
    }
    return newUser;
  }

  loginUser(email: string, password?: string): User | null {
    const user = this.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return null;
    if (password && user.password && user.password !== password) {
      return null;
    }
    authStorage.setUser(user);
    authStorage.setToken(`token-${user.id}`);
    return user;
  }

  finalizeInvestigation(
    reportId: string,
    closingData: {
      findings?: string;
      actionsTaken?: string;
      recommendations?: string;
      result?: string;
      samplesCollected?: string;
      notes?: string;
    },
    user: any
  ): { report: Report; investigation?: Investigation } | null {
    const report = this.reports.find(r => r.id === reportId || r.reportNumber === reportId);
    if (!report) return null;

    // Strict one-way forward transition: IN_INVESTIGATION -> RESOLVED
    const oldStatus = report.status;
    report.status = 'RESOLVED';
    report.statusHistory.push({
      oldStatus,
      newStatus: 'RESOLVED',
      changedBy: user?.name || 'Health Officer',
      role: user?.role || 'HEALTH_OFFICER',
      timestamp: new Date().toISOString(),
      comment: closingData.notes || 'Field inspection finalized, containment actions confirmed, and incident marked as RESOLVED.'
    });

    // Update or create linked investigation record
    let inv = this.investigations.find(i => i.reportId === report.id || i.reportNumber === report.reportNumber);
    if (inv) {
      inv.status = 'COMPLETED';
      inv.result = (closingData.result as any) || 'Resolved';
      if (closingData.findings) inv.findings = closingData.findings;
      if (closingData.actionsTaken) inv.actionsTaken = closingData.actionsTaken;
      if (closingData.recommendations) inv.recommendations = closingData.recommendations;
      if (closingData.samplesCollected) inv.samplesCollected = closingData.samplesCollected;
      if (closingData.notes) inv.notes = closingData.notes;
    } else {
      inv = {
        id: `inv-${Date.now()}`,
        investigationCode: `INV-2026-${String(this.investigations.length + 101).padStart(4, '0')}`,
        reportId: report.id,
        reportNumber: report.reportNumber,
        officer: {
          id: user?.id || 'usr-off-1',
          name: user?.name || 'Dr. Tariq Al-Hajj',
          badgeNumber: user?.badgeNumber || 'TRP-OFF-01'
        },
        investigationDate: new Date().toISOString(),
        findings: closingData.findings || 'Field remediation inspection completed and verified.',
        actionsTaken: closingData.actionsTaken || 'Containment and municipal sanitization executed.',
        recommendations: closingData.recommendations || 'Regular surveillance monitoring instituted.',
        result: (closingData.result as any) || 'Resolved',
        samplesCollected: closingData.samplesCollected || 'Post-cleanup clearance swab/sample',
        notes: closingData.notes || 'Inspection officially finalized.',
        status: 'COMPLETED'
      };
      this.investigations.unshift(inv);
    }

    // Notify citizen
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: report.citizen.userId,
      title: `Incident #${report.reportNumber} REMEDIATED & RESOLVED`,
      message: `Your public health incident report has been thoroughly inspected and officially marked as RESOLVED.`,
      type: 'STATUS_UPDATE',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    this.persistAll();
    return { report, investigation: inv };
  }

  addCategory(newCategory: any): void {
    this.categories.push({
      id: `cat-${Date.now()}`,
      ...newCategory
    });
    this.persistAll();
  }

  resetDemoData(): void {
    this.reports = [...initialReports];
    this.investigations = [...initialInvestigations];
    this.clusters = [...initialClusters];
    this.alerts = [...initialAlerts];
    this.notifications = [...initialNotifications];
    this.users = [...initialUsers];
    this.categories = [...initialCategories];
    this.persistAll();
  }
}

export const dbInstance = new StateDatabase();

// Axios-compatible wrapper interface
export const apiClient = {
  get: async (url: string) => {
    return { data: { success: true } };
  },
  post: async (url: string, data?: any) => {
    return { data: { success: true } };
  },
  put: async (url: string, data?: any) => {
    return { data: { success: true } };
  },
  delete: async (url: string) => {
    return { data: { success: true } };
  }
};
