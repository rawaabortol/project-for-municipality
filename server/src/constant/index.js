/**
 * Constants for Tripoli Smart Public Health Monitoring System
 */

export const USER_ROLES = {
  CITIZEN: 'CITIZEN',
  HEALTH_OFFICER: 'HEALTH_OFFICER',
  ADMINISTRATOR: 'ADMINISTRATOR'
};

export const REPORT_STATUSES = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  IN_INVESTIGATION: 'IN_INVESTIGATION',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED'
};

export const SEVERITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export const INVESTIGATION_RESULTS = {
  CONFIRMED: 'Confirmed',
  NOT_CONFIRMED: 'Not Confirmed',
  INCONCLUSIVE: 'Inconclusive',
  RESOLVED: 'Resolved'
};

export const INVESTIGATION_STATUSES = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

export const ALERT_TYPES = {
  CRITICAL_INCIDENT: 'CRITICAL_INCIDENT',
  CLUSTER_DETECTED: 'CLUSTER_DETECTED',
  GEOGRAPHIC_SPIKE: 'GEOGRAPHIC_SPIKE',
  CATEGORY_SURGE: 'CATEGORY_SURGE',
  UNRESOLVED_TIMEOUT: 'UNRESOLVED_TIMEOUT'
};

export const TRIPOLI_DISTRICTS = [
  'Al-Tal',
  'Al-Mina',
  'Bab Al-Tabbaneh',
  'Jabal Mohsen',
  'Abu Samra',
  'Al-Qobbeh',
  'Dam w Farez',
  'Beddawi',
  'Zahrieh',
  'Maarad',
  'Mina Port',
  'Haddadine',
  'Swayqa',
  'Azmi Street',
  'Bab Al-Ramel'
];

export const DEFAULT_CATEGORIES = [
  { name: 'Food Safety', code: 'FOOD_SAFETY', baseWeight: 10, icon: 'Utensils' },
  { name: 'Suspected Food Poisoning', code: 'FOOD_POISONING', baseWeight: 14, icon: 'AlertTriangle' },
  { name: 'Water Contamination', code: 'WATER_CONTAMINATION', baseWeight: 15, icon: 'Droplets' },
  { name: 'Unsafe Drinking Water', code: 'UNSAFE_DRINKING_WATER', baseWeight: 15, icon: 'GlassWater' },
  { name: 'Sewage Problem', code: 'SEWAGE_PROBLEM', baseWeight: 12, icon: 'Waves' },
  { name: 'Garbage Accumulation', code: 'GARBAGE_ACCUMULATION', baseWeight: 8, icon: 'Trash2' },
  { name: 'Air Pollution', code: 'AIR_POLLUTION', baseWeight: 8, icon: 'Wind' },
  { name: 'Mosquito Infestation', code: 'MOSQUITO_INFESTATION', baseWeight: 9, icon: 'Bug' },
  { name: 'Rodent/Pest Problem', code: 'RODENT_PEST', baseWeight: 9, icon: 'Rat' },
  { name: 'Suspected Disease/Outbreak', code: 'DISEASE_OUTBREAK', baseWeight: 15, icon: 'Biohazard' },
  { name: 'Environmental Hazard', code: 'ENV_HAZARD', baseWeight: 11, icon: 'ShieldAlert' },
  { name: 'Other', code: 'OTHER', baseWeight: 5, icon: 'HelpCircle' }
];
