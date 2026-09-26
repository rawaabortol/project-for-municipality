/**
 * Tripoli Public Health Monitoring System - Data Types & Database Seed Contracts
 * All static mock data has been removed. Data is sourced exclusively from the live database.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CITIZEN' | 'HEALTH_OFFICER' | 'ADMINISTRATOR';
  phone: string;
  district: string;
  badgeNumber?: string;
  title?: string;
  avatarUrl?: string;
  bio?: string;
  password?: string;
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
  initialSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  imageUrl?: string;
  additionalComments?: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'IN_INVESTIGATION' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
  assignedOfficer?: {
    id: string;
    name: string;
    badgeNumber: string;
  };
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
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
  result: 'Confirmed' | 'Not Confirmed' | 'Inconclusive' | 'Resolved';
  samplesCollected: string;
  notes: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
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
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timeWindowHours: number;
  detectedAt: string;
  status: 'ACTIVE' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
}

export interface Alert {
  id: string;
  alertCode: string;
  alertType: 'CRITICAL_INCIDENT' | 'CLUSTER_DETECTED' | 'GEOGRAPHIC_SPIKE' | 'CATEGORY_SURGE' | 'UNRESOLVED_TIMEOUT';
  title: string;
  description: string;
  relatedReportId?: string;
  relatedClusterId?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  area: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  assignedOfficer: {
    name: string;
    badgeNumber: string;
  };
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'STATUS_UPDATE' | 'CRITICAL_ALERT' | 'CLUSTER_ALERT' | 'ASSIGNMENT' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

// Pure database state: Zero test users
export const initialUsers: User[] = [];

// Public Health Surveillance Categories (Reference Lookup Data)
export const initialCategories = [
  { id: 'cat-1', name: 'Food Safety', code: 'FOOD_SAFETY', baseWeight: 10, icon: 'Utensils', description: 'Restaurant hygiene, expired produce, and unregulated food vendors.' },
  { id: 'cat-2', name: 'Suspected Food Poisoning', code: 'FOOD_POISONING', baseWeight: 14, icon: 'AlertTriangle', description: 'Acute gastrointestinal clusters following consumption from local eateries or banquets.' },
  { id: 'cat-3', name: 'Water Contamination', code: 'WATER_CONTAMINATION', baseWeight: 15, icon: 'Droplets', description: 'Turbidity, chemical odors, or discolored municipal or tanker water supply.' },
  { id: 'cat-4', name: 'Unsafe Drinking Water', code: 'UNSAFE_DRINKING_WATER', baseWeight: 15, icon: 'GlassWater', description: 'Bacteriological suspicion in bottled water refill stations or domestic reservoirs.' },
  { id: 'cat-5', name: 'Sewage Problem', code: 'SEWAGE_PROBLEM', baseWeight: 12, icon: 'Waves', description: 'Ruptured sewer lines, street overflow, and drainage backups.' },
  { id: 'cat-6', name: 'Garbage Accumulation', code: 'GARBAGE_ACCUMULATION', baseWeight: 8, icon: 'Trash2', description: 'Uncollected municipal refuse piles obstructing pedestrian areas and attracting pests.' },
  { id: 'cat-7', name: 'Air Pollution', code: 'AIR_POLLUTION', baseWeight: 8, icon: 'Wind', description: 'Toxic generator exhaust emissions, tire burnings, or industrial fumes.' },
  { id: 'cat-8', name: 'Mosquito Infestation', code: 'MOSQUITO_INFESTATION', baseWeight: 9, icon: 'Bug', description: 'Stagnant wastewater pooling fostering aggressive mosquito breeding vectors.' },
  { id: 'cat-9', name: 'Rodent/Pest Problem', code: 'RODENT_PEST', baseWeight: 9, icon: 'Rat', description: 'Heavy rat or rodent presence near residential basements and food stalls.' },
  { id: 'cat-10', name: 'Suspected Disease/Outbreak', code: 'DISEASE_OUTBREAK', baseWeight: 15, icon: 'Biohazard', description: 'Unusual clusters of jaundice, acute watery diarrhea, or rash.' },
  { id: 'cat-11', name: 'Environmental Hazard', code: 'ENV_HAZARD', baseWeight: 11, icon: 'ShieldAlert', description: 'Chemical spills, medical waste dumping, or construction dust contamination.' },
  { id: 'cat-12', name: 'Other', code: 'OTHER', baseWeight: 5, icon: 'HelpCircle', description: 'Unspecified public health or sanitation grievance.' }
];

// Pure database states: Zero mock reports, investigations, clusters, alerts, or notifications
export const initialReports: Report[] = [];
export const initialInvestigations: Investigation[] = [];
export const initialClusters: Cluster[] = [];
export const initialAlerts: Alert[] = [];
export const initialNotifications: AppNotification[] = [];
