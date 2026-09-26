import { authStorage } from './authStorage.js';
import {
  initialUsers,
  initialCategories,
  initialReports,
  initialInvestigations,
  initialClusters,
  initialAlerts,
  initialNotifications
} from './sampleData.js';

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

try {
  if (typeof window !== 'undefined' && window.localStorage) {
    [
      'tripoli_hp_reports',
      'tripoli_hp_investigations',
      'tripoli_hp_clusters',
      'tripoli_hp_alerts',
      'tripoli_hp_notifications'
    ].forEach(k => localStorage.removeItem(k));
  }
} catch {
  // Ignore
}

function loadOrInit(key, initialData) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  } catch {
    return initialData;
  }
}

class MockDatabase {
  constructor() {
    this.reports = loadOrInit(STORAGE_KEYS.REPORTS, [...initialReports]);
    this.investigations = loadOrInit(STORAGE_KEYS.INVESTIGATIONS, [...initialInvestigations]);
    this.clusters = loadOrInit(STORAGE_KEYS.CLUSTERS, [...initialClusters]);
    this.alerts = loadOrInit(STORAGE_KEYS.ALERTS, [...initialAlerts]);
    this.notifications = loadOrInit(STORAGE_KEYS.NOTIFICATIONS, [...initialNotifications]);
    this.users = loadOrInit(STORAGE_KEYS.USERS, [...initialUsers]);
    this.categories = loadOrInit(STORAGE_KEYS.CATEGORIES, [...initialCategories]);
  }
}

export const dbInstance = new MockDatabase();

const apiClient = {
  get: async (url) => ({ data: { success: true } }),
  post: async (url, data) => ({ data: { success: true, ...data } })
};

export default apiClient;
