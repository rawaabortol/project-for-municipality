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

// Local storage persistent keys for live demo session
const STORAGE_KEYS = {
  REPORTS: 'tripoli_hp_reports',
  INVESTIGATIONS: 'tripoli_hp_investigations',
  CLUSTERS: 'tripoli_hp_clusters',
  ALERTS: 'tripoli_hp_alerts',
  NOTIFICATIONS: 'tripoli_hp_notifications',
  USERS: 'tripoli_hp_users',
  CATEGORIES: 'tripoli_hp_categories'
};

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
