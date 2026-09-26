/**
 * API Constants and System Definitions
 */

export const API_BASE_URL = '/api';

export const USER_ROLES = {
  CITIZEN: 'CITIZEN',
  HEALTH_OFFICER: 'HEALTH_OFFICER',
  ADMINISTRATOR: 'ADMINISTRATOR'
} as const;

export type UserRole = keyof typeof USER_ROLES;

export const REPORT_STATUSES = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  IN_INVESTIGATION: 'IN_INVESTIGATION',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED'
} as const;

export type ReportStatus = keyof typeof REPORT_STATUSES;

export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const;

export type RiskLevel = keyof typeof RISK_LEVELS;

export const SEVERITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const;

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

export const TRIPOLI_COORDINATES = {
  lat: 34.4367,
  lng: 35.8497,
  zoom: 13
};
