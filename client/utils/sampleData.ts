/**
 * Tripoli Public Health Monitoring System - Comprehensive Fictional Sample Dataset
 * Fully satisfies requirement: 30+ users, 100+ realistic reports, clusters, alerts, investigations
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

// 1. 30+ Realistic Users (Citizens, Field Inspectors, Epidemiologists, Admins)
export const initialUsers: User[] = [
  // Administrators
  { id: 'usr-admin-1', name: 'Dr. Nabil Sabbagh', email: 'admin.sabbagh@tripoli-health.gov.lb', role: 'ADMINISTRATOR', phone: '+961 3 410291', district: 'Dam w Farez', badgeNumber: 'TRP-ADM-01', title: 'Director of Municipal Health Surveillance' },
  { id: 'usr-admin-2', name: 'Mona Kabbani', email: 'admin.kabbani@tripoli-health.gov.lb', role: 'ADMINISTRATOR', phone: '+961 3 881204', district: 'Al-Tal', badgeNumber: 'TRP-ADM-02', title: 'Senior Public Health Systems Administrator' },
  { id: 'usr-admin-3', name: 'Karim Arnaout', email: 'admin.arnaout@tripoli-health.gov.lb', role: 'ADMINISTRATOR', phone: '+961 70 334912', district: 'Maarad', badgeNumber: 'TRP-ADM-03', title: 'Tripoli Municipal Operations Supervisor' },

  // Health Officers & Inspectors
  { id: 'usr-off-1', name: 'Dr. Tariq Al-Hajj', email: 'officer.hajj@tripoli-health.gov.lb', role: 'HEALTH_OFFICER', phone: '+961 3 204918', district: 'Al-Mina', badgeNumber: 'TRP-OFF-01', title: 'Chief Epidemiologist & Water Quality Lead' },
  { id: 'usr-off-2', name: 'Inspector Layla Khoury', email: 'officer.khoury@tripoli-health.gov.lb', role: 'HEALTH_OFFICER', phone: '+961 70 192834', district: 'Dam w Farez', badgeNumber: 'TRP-OFF-02', title: 'Senior Food Safety Inspector' },
  { id: 'usr-off-3', name: 'Eng. Ziad Kabbara', email: 'officer.kabbara@tripoli-health.gov.lb', role: 'HEALTH_OFFICER', phone: '+961 3 726154', district: 'Bab Al-Tabbaneh', badgeNumber: 'TRP-OFF-03', title: 'Sanitation & Sewage Infrastructure Specialist' },
  { id: 'usr-off-4', name: 'Dr. Rania Dabbousi', email: 'officer.dabbousi@tripoli-health.gov.lb', role: 'HEALTH_OFFICER', phone: '+961 71 884729', district: 'Abu Samra', badgeNumber: 'TRP-OFF-04', title: 'Infectious Disease Surveillance Officer' },
  { id: 'usr-off-5', name: 'Inspector Bassam Chami', email: 'officer.chami@tripoli-health.gov.lb', role: 'HEALTH_OFFICER', phone: '+961 3 993821', district: 'Beddawi', badgeNumber: 'TRP-OFF-05', title: 'Environmental Hygiene & Vector Control Officer' },
  { id: 'usr-off-6', name: 'Hala Rifai', email: 'officer.rifai@tripoli-health.gov.lb', role: 'HEALTH_OFFICER', phone: '+961 70 664918', district: 'Al-Qobbeh', badgeNumber: 'TRP-OFF-06', title: 'Field Triage & Lab Sampling Coordinator' },
  { id: 'usr-off-7', name: 'Dr. Omar Masri', email: 'officer.masri@tripoli-health.gov.lb', role: 'HEALTH_OFFICER', phone: '+961 3 552190', district: 'Zahrieh', badgeNumber: 'TRP-OFF-07', title: 'Public Health Investigation Physician' },

  // Citizens (Tripoli Residents Across Various Districts)
  { id: 'usr-cit-1', name: 'Rami Haddad', email: 'rami.haddad@gmail.com', role: 'CITIZEN', phone: '+961 70 491823', district: 'Al-Tal' },
  { id: 'usr-cit-2', name: 'Maya Barakat', email: 'maya.barakat@hotmail.com', role: 'CITIZEN', phone: '+961 3 192837', district: 'Al-Mina' },
  { id: 'usr-cit-3', name: 'Nour Al-Ali', email: 'nour.ali@gmail.com', role: 'CITIZEN', phone: '+961 71 837462', district: 'Bab Al-Tabbaneh' },
  { id: 'usr-cit-4', name: 'Fadi Merhebi', email: 'fadi.merhebi@yahoo.com', role: 'CITIZEN', phone: '+961 76 543210', district: 'Abu Samra' },
  { id: 'usr-cit-5', name: 'Sarah Traboulsi', email: 'sarah.traboulsi@gmail.com', role: 'CITIZEN', phone: '+961 3 928374', district: 'Dam w Farez' },
  { id: 'usr-cit-6', name: 'Wassim Fattal', email: 'wassim.fattal@gmail.com', role: 'CITIZEN', phone: '+961 70 293847', district: 'Beddawi' },
  { id: 'usr-cit-7', name: 'Reem Chehab', email: 'reem.chehab@outlook.com', role: 'CITIZEN', phone: '+961 71 908172', district: 'Al-Qobbeh' },
  { id: 'usr-cit-8', name: 'Ahmad Sinno', email: 'ahmad.sinno@gmail.com', role: 'CITIZEN', phone: '+961 3 384729', district: 'Jabal Mohsen' },
  { id: 'usr-cit-9', name: 'Jad Mikati', email: 'jad.mikati@gmail.com', role: 'CITIZEN', phone: '+961 70 119283', district: 'Maarad' },
  { id: 'usr-cit-10', name: 'Dina Ghandour', email: 'dina.ghandour@gmail.com', role: 'CITIZEN', phone: '+961 76 837461', district: 'Zahrieh' },
  { id: 'usr-cit-11', name: 'Khaled Zaatar', email: 'khaled.zaatar@hotmail.com', role: 'CITIZEN', phone: '+961 3 718293', district: 'Mina Port' },
  { id: 'usr-cit-12', name: 'Yasmin Hallak', email: 'yasmin.hallak@gmail.com', role: 'CITIZEN', phone: '+961 71 472910', district: 'Azmi Street' },
  { id: 'usr-cit-13', name: 'Tarek Basha', email: 'tarek.basha@gmail.com', role: 'CITIZEN', phone: '+961 70 382910', district: 'Bab Al-Ramel' },
  { id: 'usr-cit-14', name: 'Lina Mouzannar', email: 'lina.mouzannar@gmail.com', role: 'CITIZEN', phone: '+961 3 645129', district: 'Haddadine' },
  { id: 'usr-cit-15', name: 'Hassan Darwich', email: 'hassan.darwich@gmail.com', role: 'CITIZEN', phone: '+961 71 182736', district: 'Swayqa' },
  { id: 'usr-cit-16', name: 'Zeina Karameh', email: 'zeina.karameh@gmail.com', role: 'CITIZEN', phone: '+961 76 991827', district: 'Dam w Farez' },
  { id: 'usr-cit-17', name: 'Bilal Chahine', email: 'bilal.chahine@gmail.com', role: 'CITIZEN', phone: '+961 3 847261', district: 'Bab Al-Tabbaneh' },
  { id: 'usr-cit-18', name: 'Samira Najjar', email: 'samira.najjar@outlook.com', role: 'CITIZEN', phone: '+961 70 551928', district: 'Abu Samra' },
  { id: 'usr-cit-19', name: 'Ibrahim Raad', email: 'ibrahim.raad@gmail.com', role: 'CITIZEN', phone: '+961 71 663829', district: 'Al-Tal' },
  { id: 'usr-cit-20', name: 'Ghina Assaf', email: 'ghina.assaf@gmail.com', role: 'CITIZEN', phone: '+961 3 228391', district: 'Al-Mina' }
];

// 2. Categories with Base Weights & Icons
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

// Tripoli Reference Coordinates
const TRIPOLI_HOTSPOTS = [
  { district: 'Bab Al-Tabbaneh', address: 'Syria Street near Al-Omari Mosque', lat: 34.4442, lng: 35.8504 },
  { district: 'Bab Al-Tabbaneh', address: 'Souk Al-Qameh Alley', lat: 34.4455, lng: 35.8518 },
  { district: 'Bab Al-Tabbaneh', address: 'Abu Ali Riverbank crossing', lat: 34.4431, lng: 35.8492 },
  { district: 'Al-Mina', address: 'Corniche waterfront promenade', lat: 34.4518, lng: 35.8198 },
  { district: 'Al-Mina', address: 'Rue Al-Mina Old Port neighborhood', lat: 34.4491, lng: 35.8242 },
  { district: 'Al-Mina', address: 'Near Tripoli Port Customs gate', lat: 34.4542, lng: 35.8267 },
  { district: 'Al-Tal', address: 'Al-Tal Clock Tower Square', lat: 34.4362, lng: 35.8441 },
  { district: 'Al-Tal', address: 'Azmi Street intersection', lat: 34.4379, lng: 35.8398 },
  { district: 'Al-Tal', address: 'Old Serail market perimeter', lat: 34.4350, lng: 35.8465 },
  { district: 'Dam w Farez', address: 'Main Boulevard near Olympic Stadium avenue', lat: 34.4285, lng: 35.8324 },
  { district: 'Dam w Farez', address: 'Commercial Plaza food court', lat: 34.4302, lng: 35.8349 },
  { district: 'Abu Samra', address: 'Al-Islah Street near Jinan University', lat: 34.4221, lng: 35.8482 },
  { district: 'Abu Samra', address: 'Haret Al-Jadideh residential block', lat: 34.4258, lng: 35.8531 },
  { district: 'Al-Qobbeh', address: 'Lebanese University Faculty of Sciences perimeter', lat: 34.4389, lng: 35.8624 },
  { district: 'Al-Qobbeh', address: 'Al-Rifai Quarter junction', lat: 34.4412, lng: 35.8660 },
  { district: 'Beddawi', address: 'Beddawi Main Highway near refinery road', lat: 34.4612, lng: 35.8640 },
  { district: 'Beddawi', address: 'Wadi Al-Nahleh residential sector', lat: 34.4589, lng: 35.8590 },
  { district: 'Jabal Mohsen', address: 'Sikkat Al-Shamal ridge', lat: 34.4468, lng: 35.8562 },
  { district: 'Zahrieh', address: 'Zahrieh Main Street bakeries row', lat: 34.4398, lng: 35.8471 },
  { district: 'Maarad', address: 'Rachid Karami International Fairgrounds west gate', lat: 34.4312, lng: 35.8265 }
];

// Helper to generate 105 realistic reports with varied statuses and risk levels
function generateInitialReports(): Report[] {
  const reports: Report[] = [];
  const citizens = initialUsers.filter(u => u.role === 'CITIZEN');
  const officers = initialUsers.filter(u => u.role === 'HEALTH_OFFICER');

  const reportScenarios = [
    // 1. Water Cluster in Bab Al-Tabbaneh
    {
      cat: 'Water Contamination',
      district: 'Bab Al-Tabbaneh',
      lat: 34.4442,
      lng: 35.8504,
      title: 'Brown contaminated tap water with foul petroleum smell',
      desc: 'Residents in 4 adjacent residential buildings in Syria Street noticed turbid brown tap water with a foul chemical smell. 12 children developed acute vomiting and diarrhea.',
      aff: 28,
      sev: 'CRITICAL',
      status: 'IN_INVESTIGATION',
      score: 88,
      risk: 'CRITICAL',
      off: 'Dr. Tariq Al-Hajj'
    },
    {
      cat: 'Unsafe Drinking Water',
      district: 'Bab Al-Tabbaneh',
      lat: 34.4449,
      lng: 35.8511,
      title: 'Gallon refill kiosk dispensing cloudy, bacterially suspected water',
      desc: 'Neighborhood water filtration dispensary filter has ruptured; customers report abdominal cramps and nausea after drinking filtered gallons.',
      aff: 19,
      sev: 'HIGH',
      status: 'VERIFIED',
      score: 79,
      risk: 'CRITICAL',
      off: 'Dr. Tariq Al-Hajj'
    },
    {
      cat: 'Water Contamination',
      district: 'Bab Al-Tabbaneh',
      lat: 34.4438,
      lng: 35.8498,
      title: 'Underground municipal water pipe breached by adjacent sewage line',
      desc: 'Visible seepage where a broken 6-inch sewage pipe leaks into an unpressurized freshwater main pipe.',
      aff: 42,
      sev: 'CRITICAL',
      status: 'IN_INVESTIGATION',
      score: 92,
      risk: 'CRITICAL',
      off: 'Eng. Ziad Kabbara'
    },
    {
      cat: 'Suspected Disease/Outbreak',
      district: 'Bab Al-Tabbaneh',
      lat: 34.4452,
      lng: 35.8519,
      title: 'Cluster of 7 pediatric jaundice & hepatitis A cases in Syria Street',
      desc: 'Local dispensary reported 7 children under 10 with scleral icterus and elevated liver enzymes within 48 hours.',
      aff: 14,
      sev: 'CRITICAL',
      status: 'IN_INVESTIGATION',
      score: 94,
      risk: 'CRITICAL',
      off: 'Dr. Rania Dabbousi'
    },
    {
      cat: 'Sewage Problem',
      district: 'Bab Al-Tabbaneh',
      lat: 34.4431,
      lng: 35.8492,
      title: 'Sewage collector overflowing into vegetable souk near Abu Ali bridge',
      desc: 'Blackwater overflow covering the pedestrian entrance of vegetable stalls. Merchants walking through contaminated sludge.',
      aff: 35,
      sev: 'HIGH',
      status: 'VERIFIED',
      score: 82,
      risk: 'CRITICAL',
      off: 'Eng. Ziad Kabbara'
    },

    // 2. Food Poisoning Incident in Al-Tal
    {
      cat: 'Suspected Food Poisoning',
      district: 'Al-Tal',
      lat: 34.4362,
      lng: 35.8441,
      title: 'Multiple patrons poisoned after eating shawarma at central fast-food shop',
      desc: 'At least 16 college students hospitalized at Islamic Hospital with high fever, vomiting, and bloody stool after eating garlic mayonnaise shawarma.',
      aff: 22,
      sev: 'CRITICAL',
      status: 'IN_INVESTIGATION',
      score: 91,
      risk: 'CRITICAL',
      off: 'Inspector Layla Khoury'
    },
    {
      cat: 'Food Safety',
      district: 'Al-Tal',
      lat: 34.4371,
      lng: 35.8435,
      title: 'Raw meat display without refrigeration during 8-hour blackout',
      desc: 'Butcher shop on Clock Tower street keeping minced meat outside without chillers due to neighborhood generator outage.',
      aff: 8,
      sev: 'HIGH',
      status: 'VERIFIED',
      score: 68,
      risk: 'HIGH',
      off: 'Inspector Layla Khoury'
    },
    {
      cat: 'Food Safety',
      district: 'Al-Tal',
      lat: 34.4350,
      lng: 35.8465,
      title: 'Unlicensed street pastry cart with visible mold and fly swarms',
      desc: 'Cart selling cream sweets (Halawet el Jibn) exposed to open sunlight and dust with no sanitary covers.',
      aff: 6,
      sev: 'MEDIUM',
      status: 'UNDER_REVIEW',
      score: 48,
      risk: 'MEDIUM',
      off: 'Inspector Layla Khoury'
    },

    // 3. Marine and Port Pollution in Al-Mina
    {
      cat: 'Environmental Hazard',
      district: 'Al-Mina',
      lat: 34.4542,
      lng: 35.8267,
      title: 'Oily chemical slick and dead fish washed ashore near port dock',
      desc: 'Bunkering vessel discharged oily ballast water into the fishing harbor. Thousands of small fish floating dead; foul chemical fumes.',
      aff: 50,
      sev: 'CRITICAL',
      status: 'IN_INVESTIGATION',
      score: 89,
      risk: 'CRITICAL',
      off: 'Inspector Bassam Chami'
    },
    {
      cat: 'Sewage Problem',
      district: 'Al-Mina',
      lat: 34.4518,
      lng: 35.8198,
      title: 'Direct raw sewage pipe discharging onto public Corniche rocks',
      desc: 'A 12-inch private commercial line is dumping untreated toilet water directly on rocks where families fish and walk.',
      aff: 30,
      sev: 'HIGH',
      status: 'VERIFIED',
      score: 74,
      risk: 'HIGH',
      off: 'Eng. Ziad Kabbara'
    },
    {
      cat: 'Garbage Accumulation',
      district: 'Al-Mina',
      lat: 34.4491,
      lng: 35.8242,
      title: 'Massive uncollected fish market refuse rotting in the heat',
      desc: 'Three municipal dumpsters overflowing with rotting fish offal, generating severe putrid odor and attracting stray dogs.',
      aff: 25,
      sev: 'HIGH',
      status: 'RESOLVED',
      score: 63,
      risk: 'HIGH',
      off: 'Inspector Bassam Chami'
    },

    // 4. Waste & Rodent Problem in Beddawi
    {
      cat: 'Garbage Accumulation',
      district: 'Beddawi',
      lat: 34.4612,
      lng: 35.8640,
      title: 'Wild burning of electronic cables and garbage piles near schools',
      desc: 'Black acrid smoke billowing from an illegal waste burning lot adjacent to the public secondary school. Children complaining of coughing and asthma.',
      aff: 45,
      sev: 'HIGH',
      status: 'IN_INVESTIGATION',
      score: 83,
      risk: 'CRITICAL',
      off: 'Inspector Bassam Chami'
    },
    {
      cat: 'Rodent/Pest Problem',
      district: 'Beddawi',
      lat: 34.4589,
      lng: 35.8590,
      title: 'Heavy Norway rat infestation spreading into ground-floor apartments',
      desc: 'Rats nesting in accumulated building rubble; 3 residents suffered rodent bites and required tetanus shots.',
      aff: 18,
      sev: 'HIGH',
      status: 'VERIFIED',
      score: 72,
      risk: 'HIGH',
      off: 'Inspector Bassam Chami'
    },

    // 5. Mosquito & Vector in Abu Samra
    {
      cat: 'Mosquito Infestation',
      district: 'Abu Samra',
      lat: 34.4221,
      lng: 35.8482,
      title: 'Abandoned excavation pit filled with stagnant rainwater and Culex mosquitoes',
      desc: 'A 4-meter foundation hole has become a green swamp. Clouds of aggressive mosquitoes biting residents day and night.',
      aff: 35,
      sev: 'HIGH',
      status: 'RESOLVED',
      score: 66,
      risk: 'HIGH',
      off: 'Hala Rifai'
    },
    {
      cat: 'Sewage Problem',
      district: 'Abu Samra',
      lat: 34.4258,
      lng: 35.8531,
      title: 'Sewer backflow flooding basement bakery and grocery storage',
      desc: 'Municipal sewer line blocked with grease; raw effluent rose 10cm inside food warehouse on Al-Islah Street.',
      aff: 12,
      sev: 'HIGH',
      status: 'RESOLVED',
      score: 71,
      risk: 'HIGH',
      off: 'Eng. Ziad Kabbara'
    }
  ];

  // Populate first 15 curated high-fidelity scenarios
  reportScenarios.forEach((sc, idx) => {
    const reportNum = `TRP-2026-${String(idx + 1).padStart(4, '0')}`;
    const cit = citizens[idx % citizens.length];
    const off = officers.find(o => o.name === sc.off) || officers[0];
    const date = new Date(Date.now() - (idx * 3600000 * 5) - 3600000).toISOString();

    reports.push({
      id: `rep-${idx + 1}`,
      reportNumber: reportNum,
      citizen: {
        userId: cit.id,
        name: cit.name,
        phone: cit.phone,
        email: cit.email
      },
      category: {
        name: sc.cat,
        code: sc.cat.toUpperCase().replace(/[^A-Z]/g, '_')
      },
      title: sc.title,
      description: sc.desc,
      incidentDate: date,
      location: {
        address: `${sc.district}, Tripoli, Lebanon`,
        district: sc.district,
        lat: sc.lat,
        lng: sc.lng
      },
      affectedCount: sc.aff,
      initialSeverity: sc.sev as any,
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&auto=format&fit=crop&q=60',
      additionalComments: 'Citizen verified location on map. Immediate inspection requested.',
      status: sc.status as any,
      assignedOfficer: {
        id: off.id,
        name: off.name,
        badgeNumber: off.badgeNumber || 'TRP-OFF-01'
      },
      riskScore: sc.score,
      riskLevel: sc.risk as any,
      riskFactors: {
        severityScore: sc.sev === 'CRITICAL' ? 25 : sc.sev === 'HIGH' ? 18 : 10,
        affectedPeopleScore: sc.aff > 20 ? 20 : 15,
        recentReportsScore: 12,
        geographicClusterScore: 18,
        categoryScore: 15,
        explanations: [
          `${sc.sev} initial severity classification`,
          `${sc.aff} estimated affected population in immediate perimeter`,
          'High spatial density of related municipal complaints within 1.2km radius',
          'High priority epidemiological risk category'
        ]
      },
      statusHistory: [
        {
          oldStatus: 'NONE',
          newStatus: 'SUBMITTED',
          changedBy: cit.name,
          role: 'CITIZEN',
          timestamp: new Date(new Date(date).getTime() - 7200000).toISOString(),
          comment: 'Report submitted by citizen via mobile web interface.'
        },
        {
          oldStatus: 'SUBMITTED',
          newStatus: 'UNDER_REVIEW',
          changedBy: 'Inspector Layla Khoury',
          role: 'HEALTH_OFFICER',
          timestamp: new Date(new Date(date).getTime() - 3600000).toISOString(),
          comment: 'Automated triage alert reviewed. Triage officer dispatched.'
        },
        {
          oldStatus: 'UNDER_REVIEW',
          newStatus: sc.status,
          changedBy: off.name,
          role: 'HEALTH_OFFICER',
          timestamp: date,
          comment: `Case transitioned to ${sc.status} following initial field verification.`
        }
      ],
      createdAt: date
    });
  });

  // Generate additional 90 realistic reports to reach 105 total across Tripoli
  const categoriesList = initialCategories;
  const statusesList: Array<'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'IN_INVESTIGATION' | 'RESOLVED' | 'CLOSED' | 'REJECTED'> = [
    'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'IN_INVESTIGATION', 'RESOLVED', 'CLOSED', 'REJECTED'
  ];

  for (let i = 16; i <= 105; i++) {
    const reportNum = `TRP-2026-${String(i).padStart(4, '0')}`;
    const cit = citizens[i % citizens.length];
    const off = officers[i % officers.length];
    const cat = categoriesList[i % categoriesList.length];
    const spot = TRIPOLI_HOTSPOTS[i % TRIPOLI_HOTSPOTS.length];

    // Jitter coordinates slightly within real Tripoli urban grid
    const latJitter = (Math.sin(i * 99) * 0.004);
    const lngJitter = (Math.cos(i * 77) * 0.005);
    const lat = Number((spot.lat + latJitter).toFixed(5));
    const lng = Number((spot.lng + lngJitter).toFixed(5));

    // Realistic time spread across last 14 days
    const hoursAgo = Math.floor(i * 3.1) + 2;
    const incidentDate = new Date(Date.now() - (hoursAgo * 3600000)).toISOString();

    const affected = ((i * 7) % 29) + 1;
    let initialSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    if (i % 7 === 0) initialSeverity = 'CRITICAL';
    else if (i % 3 === 0) initialSeverity = 'HIGH';
    else if (i % 5 === 0) initialSeverity = 'LOW';

    // Status distribution
    const status = statusesList[i % statusesList.length];

    // Calculate score
    const sevScore = initialSeverity === 'CRITICAL' ? 25 : initialSeverity === 'HIGH' ? 18 : initialSeverity === 'MEDIUM' ? 10 : 4;
    const affScore = affected >= 20 ? 20 : affected >= 10 ? 15 : affected >= 4 ? 10 : 5;
    const recScore = hoursAgo <= 24 ? 15 : hoursAgo <= 72 ? 10 : 5;
    const catScore = cat.baseWeight;
    const geoScore = (i % 4 === 0) ? 18 : 8;

    const rawScore = Math.min(100, Math.max(15, sevScore + affScore + recScore + catScore + geoScore));
    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' =
      rawScore >= 76 ? 'CRITICAL' : rawScore >= 51 ? 'HIGH' : rawScore >= 26 ? 'MEDIUM' : 'LOW';

    reports.push({
      id: `rep-${i}`,
      reportNumber: reportNum,
      citizen: {
        userId: cit.id,
        name: cit.name,
        phone: cit.phone,
        email: cit.email
      },
      category: {
        name: cat.name,
        code: cat.code
      },
      title: `${cat.name} issue reported near ${spot.address}`,
      description: `Citizen notice regarding ${cat.name.toLowerCase()} in ${spot.district}. Impacting local apartment blocks and passing pedestrians. Severity assessed as ${initialSeverity}.`,
      incidentDate,
      location: {
        address: `${spot.address}, ${spot.district}`,
        district: spot.district,
        lat,
        lng
      },
      affectedCount: affected,
      initialSeverity,
      imageUrl: (i % 3 === 0) ? 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&auto=format&fit=crop&q=60' : undefined,
      additionalComments: 'Report logged through Tripoli citizen public health surveillance terminal.',
      status,
      assignedOfficer: status !== 'SUBMITTED' ? {
        id: off.id,
        name: off.name,
        badgeNumber: off.badgeNumber || 'TRP-OFF-01'
      } : undefined,
      riskScore: rawScore,
      riskLevel,
      riskFactors: {
        severityScore: sevScore,
        affectedPeopleScore: affScore,
        recentReportsScore: recScore,
        geographicClusterScore: geoScore,
        categoryScore: catScore,
        explanations: [
          `Base severity rating: ${initialSeverity} (${sevScore} pts)`,
          `${affected} exposed citizens reported in perimeter (${affScore} pts)`,
          `Recency factor: reported ${Math.round(hoursAgo)}h ago (${recScore} pts)`,
          `Category epidemiologic weight for ${cat.name} (${catScore} pts)`
        ]
      },
      statusHistory: [
        {
          oldStatus: 'NONE',
          newStatus: 'SUBMITTED',
          changedBy: cit.name,
          role: 'CITIZEN',
          timestamp: incidentDate,
          comment: 'Citizen incident submission.'
        }
      ],
      createdAt: incidentDate
    });
  }

  return reports;
}

export const initialReports: Report[] = generateInitialReports();

// 3. Pre-configured Investigations for Verified & In-Investigation Incidents
export const initialInvestigations: Investigation[] = [
  {
    id: 'inv-1',
    investigationCode: 'INV-2026-0101',
    reportId: 'rep-1',
    reportNumber: 'TRP-2026-0001',
    officer: {
      id: 'usr-off-1',
      name: 'Dr. Tariq Al-Hajj',
      badgeNumber: 'TRP-OFF-01'
    },
    investigationDate: new Date(Date.now() - 86400000).toISOString(),
    findings: 'Physical inspection of Syria Street main junction confirmed a ruptured municipal water delivery line running parallel to an open brick sewage canal. Chemical testing revealed free chlorine < 0.02 mg/L, fecal coliform count > 1,800 CFU/100ml. High biological pathogen load.',
    actionsTaken: '1. Isolated municipal valve feeding Syria Street block 4. 2. Provided 45 families with emergency chlorinated potable water tanker trucks. 3. Mobilized Municipal Public Works excavation crew for pipe replacement.',
    recommendations: 'Complete replacement of 200 meters of degraded cast-iron freshwater pipes with high-density polyethylene (HDPE). Issue boil-water mandate for Bab Al-Tabbaneh zone 2 until 3 consecutive negative culture tests.',
    result: 'Confirmed',
    samplesCollected: 'Water Sample #TRP-W-402 (Syria St), Sewage Effluent #TRP-S-88',
    notes: 'Urgent coordination with North Lebanon Water Establishment (EBML) completed.',
    status: 'IN_PROGRESS'
  },
  {
    id: 'inv-2',
    investigationCode: 'INV-2026-0102',
    reportId: 'rep-6',
    reportNumber: 'TRP-2026-0006',
    officer: {
      id: 'usr-off-2',
      name: 'Inspector Layla Khoury',
      badgeNumber: 'TRP-OFF-02'
    },
    investigationDate: new Date(Date.now() - 43200000).toISOString(),
    findings: 'Inspected Al-Tal fast-food kitchen. Refrigeration temperature recorded at 14.5°C (legal maximum 4°C). Garlic sauce prepared with raw unpasteurized eggs left in ambient 28°C kitchen temperature. Salmonella enterica confirmed in leftover chicken marinade.',
    actionsTaken: '1. Immediate administrative closure of restaurant premises. 2. Confiscation and destruction of 65 kg of spoiled chicken and egg batches. 3. Issued judicial summons to restaurant proprietor.',
    recommendations: 'Mandatory hygiene re-certification of all kitchen food handlers. Minimum 14-day closure pending deep sanitation and laboratory clearance.',
    result: 'Confirmed',
    samplesCollected: 'Food Sample #F-771 (Garlic paste), Swab #SW-22 (Prep counter)',
    notes: 'Case referred to Tripoli Public Prosecutor for food safety violations.',
    status: 'IN_PROGRESS'
  },
  {
    id: 'inv-3',
    investigationCode: 'INV-2026-0103',
    reportId: 'rep-9',
    reportNumber: 'TRP-2026-0009',
    officer: {
      id: 'usr-off-5',
      name: 'Inspector Bassam Chami',
      badgeNumber: 'TRP-OFF-05'
    },
    investigationDate: new Date(Date.now() - 172800000).toISOString(),
    findings: 'Surveillance conducted along Al-Mina port basin. Marine diesel oil sheen originated from an unlicensed commercial fishing trawler undergoing unauthorized bilge cleaning.',
    actionsTaken: 'Deployed absorbent oil booms across 150 meters of shoreline. Vessel detained in port by Maritime Police.',
    recommendations: 'Environmental remediation fine levied on vessel owner. Daily testing of dissolved oxygen levels along fishing wharf.',
    result: 'Confirmed',
    samplesCollected: 'Seawater Sample #SEA-901, Hydrocarbon Index #HC-44',
    notes: 'Collaboration with Ministry of Public Works & Transport completed.',
    status: 'COMPLETED'
  },
  {
    id: 'inv-4',
    investigationCode: 'INV-2026-0104',
    reportId: 'rep-14',
    reportNumber: 'TRP-2026-0014',
    officer: {
      id: 'usr-off-6',
      name: 'Hala Rifai',
      badgeNumber: 'TRP-OFF-06'
    },
    investigationDate: new Date(Date.now() - 259200000).toISOString(),
    findings: 'Inspected abandoned construction site in Abu Samra. Stagnant rainwater pond covering ~400 square meters. Larval sampling confirmed Culex pipiens larvae count of ~25 larvae per dip.',
    actionsTaken: '1. Drained 80% of accumulated ponding using municipal suction truck. 2. Applied eco-friendly bacterial larvicide (Bacillus thuringiensis israelensis - BTI).',
    recommendations: 'Site owner mandated to backfill excavation with clean earth within 10 days.',
    result: 'Resolved',
    samplesCollected: 'Larval Dipper Sample #L-19',
    notes: 'Follow-up vector inspection scheduled in 7 days.',
    status: 'COMPLETED'
  }
];

// 4. Detected Clusters in Tripoli
export const initialClusters: Cluster[] = [
  {
    id: 'cls-1',
    clusterCode: 'CLS-BAB-001',
    categoryName: 'Water Contamination & Waterborne Illness',
    district: 'Bab Al-Tabbaneh',
    centroid: { lat: 34.4442, lng: 35.8504 },
    radiusMeters: 850,
    reportNumbers: ['TRP-2026-0001', 'TRP-2026-0002', 'TRP-2026-0003', 'TRP-2026-0004', 'TRP-2026-0005'],
    reportCount: 5,
    totalAffected: 138,
    riskLevel: 'CRITICAL',
    timeWindowHours: 48,
    detectedAt: new Date(Date.now() - 36000000).toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'cls-2',
    clusterCode: 'CLS-TAL-002',
    categoryName: 'Food Safety & Gastrointestinal Intoxication',
    district: 'Al-Tal',
    centroid: { lat: 34.4362, lng: 35.8441 },
    radiusMeters: 600,
    reportNumbers: ['TRP-2026-0006', 'TRP-2026-0007', 'TRP-2026-0008'],
    reportCount: 3,
    totalAffected: 36,
    riskLevel: 'HIGH',
    timeWindowHours: 48,
    detectedAt: new Date(Date.now() - 72000000).toISOString(),
    status: 'INVESTIGATING'
  },
  {
    id: 'cls-3',
    clusterCode: 'CLS-MIN-003',
    categoryName: 'Marine & Waterfront Environmental Hazard',
    district: 'Al-Mina',
    centroid: { lat: 34.4520, lng: 35.8230 },
    radiusMeters: 950,
    reportNumbers: ['TRP-2026-0009', 'TRP-2026-0010', 'TRP-2026-0011'],
    reportCount: 3,
    totalAffected: 105,
    riskLevel: 'HIGH',
    timeWindowHours: 72,
    detectedAt: new Date(Date.now() - 120000000).toISOString(),
    status: 'CONTAINED'
  }
];

// 5. Public Health Alerts
export const initialAlerts: Alert[] = [
  {
    id: 'alt-1',
    alertCode: 'ALT-CRIT-2026-001',
    alertType: 'CRITICAL_INCIDENT',
    title: 'CRITICAL WATER CONTAMINATION BREACH - BAB AL-TABBANEH',
    description: 'Sewerage line infiltration into primary municipal drinking main detected along Syria Street. Risk score calculated at 94/100 with multiple pediatric hospitalizations. Immediate valve cutoff and boil-water mandate issued.',
    relatedReportId: 'rep-1',
    relatedClusterId: 'CLS-BAB-001',
    riskLevel: 'CRITICAL',
    area: 'Bab Al-Tabbaneh',
    status: 'ACTIVE',
    assignedOfficer: {
      name: 'Dr. Tariq Al-Hajj',
      badgeNumber: 'TRP-OFF-01'
    },
    createdAt: new Date(Date.now() - 36000000).toISOString()
  },
  {
    id: 'alt-2',
    alertCode: 'ALT-CLS-2026-002',
    alertType: 'CLUSTER_DETECTED',
    title: 'POTENTIAL PUBLIC HEALTH CLUSTER DETECTED: WATERBORNE ILLNESS',
    description: 'Automated cluster engine detected 5 correlated incidents within an 850m radius over the last 48 hours in Bab Al-Tabbaneh. Total estimated affected population: 138.',
    relatedClusterId: 'CLS-BAB-001',
    riskLevel: 'CRITICAL',
    area: 'Bab Al-Tabbaneh',
    status: 'ACTIVE',
    assignedOfficer: {
      name: 'Dr. Tariq Al-Hajj',
      badgeNumber: 'TRP-OFF-01'
    },
    createdAt: new Date(Date.now() - 35000000).toISOString()
  },
  {
    id: 'alt-3',
    alertCode: 'ALT-FOOD-2026-003',
    alertType: 'CRITICAL_INCIDENT',
    title: 'ACUTE FOOD POISONING OUTBREAK - AL-TAL COMMERCIAL DISTRICT',
    description: '22 patrons hospitalized with severe salmonellosis symptoms following meals at Clock Tower Square. Restaurant ordered shut pending microbial confirmation.',
    relatedReportId: 'rep-6',
    relatedClusterId: 'CLS-TAL-002',
    riskLevel: 'CRITICAL',
    area: 'Al-Tal',
    status: 'ACKNOWLEDGED',
    assignedOfficer: {
      name: 'Inspector Layla Khoury',
      badgeNumber: 'TRP-OFF-02'
    },
    createdAt: new Date(Date.now() - 72000000).toISOString()
  },
  {
    id: 'alt-4',
    alertCode: 'ALT-ENV-2026-004',
    alertType: 'GEOGRAPHIC_SPIKE',
    title: 'UNREGULATED WASTE INCINERATION TOXIC SPIKE - BEDDAWI',
    description: 'Multiple simultaneous reports of toxic wire and plastic burning causing respiratory distress at Beddawi schools. Civil Defense and Environmental Police notified.',
    riskLevel: 'HIGH',
    area: 'Beddawi',
    status: 'ACTIVE',
    assignedOfficer: {
      name: 'Inspector Bassam Chami',
      badgeNumber: 'TRP-OFF-05'
    },
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'alt-5',
    alertCode: 'ALT-TIME-2026-005',
    alertType: 'UNRESOLVED_TIMEOUT',
    title: 'UNRESOLVED STAGNANT REPORTS ALERT (> 6 DAYS)',
    description: 'System audit identified 7 unassigned reports in Zahrieh and Qobbeh exceeding municipal 5-day triage SLA.',
    riskLevel: 'MEDIUM',
    area: 'City-Wide Tripoli',
    status: 'ACKNOWLEDGED',
    assignedOfficer: {
      name: 'Dr. Nabil Sabbagh',
      badgeNumber: 'TRP-ADM-01'
    },
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

// 6. In-App Notifications
export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-cit-1',
    title: 'Report Status Updated',
    message: 'Your report #TRP-2026-0001 has been verified and an investigation was launched by Dr. Tariq Al-Hajj.',
    type: 'STATUS_UPDATE',
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'notif-2',
    userId: 'usr-off-1',
    title: 'New Critical Cluster Detected',
    message: 'Tripoli Surveillance Engine flagged a CRITICAL waterborne cluster in Bab Al-Tabbaneh (138 people affected).',
    type: 'CLUSTER_ALERT',
    isRead: false,
    createdAt: new Date(Date.now() - 36000000).toISOString()
  },
  {
    id: 'notif-3',
    userId: 'usr-off-2',
    title: 'Field Investigation Assigned',
    message: 'You have been assigned to lead the investigation on food poisoning incident #TRP-2026-0006 in Al-Tal.',
    type: 'ASSIGNMENT',
    isRead: true,
    createdAt: new Date(Date.now() - 72000000).toISOString()
  },
  {
    id: 'notif-4',
    userId: 'usr-admin-1',
    title: 'Automated Epidemiological Briefing Ready',
    message: 'Weekly public health surveillance summary for Greater Tripoli is available for export and signature.',
    type: 'SYSTEM',
    isRead: false,
    createdAt: new Date(Date.now() - 14400000).toISOString()
  }
];
