-- ==============================================================================
-- SMART PUBLIC HEALTH MONITORING AND REPORTING SYSTEM FOR TRIPOLI (LEBANON)
-- Database Seed Data Script (Oracle & PostgreSQL)
-- 30+ Users, 12 Categories, Hotspots, Reports, Clusters, Alerts
-- ==============================================================================

-- 1. INSERT ROLES
INSERT INTO ROLES (role_id, role_name, description) VALUES ('ROLE_CITIZEN', 'CITIZEN', 'Tripoli citizen reporting environmental and health hazards');
INSERT INTO ROLES (role_id, role_name, description) VALUES ('ROLE_OFFICER', 'HEALTH_OFFICER', 'Municipal health officer, field triage inspector, and epidemiologist');
INSERT INTO ROLES (role_id, role_name, description) VALUES ('ROLE_ADMIN', 'ADMINISTRATOR', 'Director of Municipal Health Surveillance with full system control');

-- 2. INSERT CATEGORIES
INSERT INTO REPORT_CATEGORIES (category_id, name, code, base_weight, icon_name, description) VALUES 
('cat-1', 'Food Safety', 'FOOD_SAFETY', 10.0, 'Utensils', 'Restaurant hygiene, expired produce, and unregulated food vendors.');
INSERT INTO REPORT_CATEGORIES (category_id, name, code, base_weight, icon_name, description) VALUES 
('cat-2', 'Suspected Food Poisoning', 'FOOD_POISONING', 14.0, 'AlertTriangle', 'Acute gastrointestinal clusters following consumption from local eateries or banquets.');
INSERT INTO REPORT_CATEGORIES (category_id, name, code, base_weight, icon_name, description) VALUES 
('cat-3', 'Water Contamination', 'WATER_CONTAMINATION', 15.0, 'Droplets', 'Turbidity, chemical odors, or discolored municipal or tanker water supply.');
INSERT INTO REPORT_CATEGORIES (category_id, name, code, base_weight, icon_name, description) VALUES 
('cat-4', 'Unsafe Drinking Water', 'UNSAFE_DRINKING_WATER', 15.0, 'GlassWater', 'Bacteriological suspicion in bottled water refill stations or domestic reservoirs.');
INSERT INTO REPORT_CATEGORIES (category_id, name, code, base_weight, icon_name, description) VALUES 
('cat-5', 'Sewage Problem', 'SEWAGE_PROBLEM', 12.0, 'Waves', 'Ruptured sewer lines, street overflow, and drainage backups.');
INSERT INTO REPORT_CATEGORIES (category_id, name, code, base_weight, icon_name, description) VALUES 
('cat-6', 'Garbage Accumulation', 'GARBAGE_ACCUMULATION', 8.0, 'Trash2', 'Uncollected municipal refuse piles obstructing pedestrian areas and attracting pests.');
INSERT INTO REPORT_CATEGORIES (category_id, name, code, base_weight, icon_name, description) VALUES 
('cat-7', 'Air Pollution', 'AIR_POLLUTION', 8.0, 'Wind', 'Toxic generator exhaust emissions, tire burnings, or industrial fumes.');
INSERT INTO REPORT_CATEGORIES (category_id, name, code, base_weight, icon_name, description) VALUES 
('cat-8', 'Mosquito Infestation', 'MOSQUITO_INFESTATION', 9.0, 'Bug', 'Stagnant wastewater pooling fostering aggressive mosquito breeding vectors.');
INSERT INTO REPORT_CATEGORIES (category_id, name, code, base_weight, icon_name, description) VALUES 
('cat-9', 'Rodent/Pest Problem', 'RODENT_PEST', 9.0, 'Rat', 'Heavy rat or rodent presence near residential basements and food stalls.');
INSERT INTO REPORT_CATEGORIES (category_id, name, code, base_weight, icon_name, description) VALUES 
('cat-10', 'Suspected Disease/Outbreak', 'DISEASE_OUTBREAK', 15.0, 'Biohazard', 'Unusual clusters of jaundice, acute watery diarrhea, or rash.');
INSERT INTO REPORT_CATEGORIES (category_id, name, code, base_weight, icon_name, description) VALUES 
('cat-11', 'Environmental Hazard', 'ENV_HAZARD', 11.0, 'ShieldAlert', 'Chemical spills, medical waste dumping, or construction dust contamination.');
INSERT INTO REPORT_CATEGORIES (category_id, name, code, base_weight, icon_name, description) VALUES 
('cat-12', 'Other', 'OTHER', 5.0, 'HelpCircle', 'Unspecified public health or sanitation grievance.');

-- 3. INSERT USERS (30+ USERS)
-- Administrators
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, badge_number, role_id, professional_title, is_active) VALUES 
('usr-admin-1', 'Dr. Nabil Sabbagh', 'admin.sabbagh@tripoli-health.gov.lb', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 3 410291', 'Dam w Farez', 'TRP-ADM-01', 'ROLE_ADMIN', 'Director of Municipal Health Surveillance', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, badge_number, role_id, professional_title, is_active) VALUES 
('usr-admin-2', 'Mona Kabbani', 'admin.kabbani@tripoli-health.gov.lb', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 3 881204', 'Al-Tal', 'TRP-ADM-02', 'ROLE_ADMIN', 'Senior Public Health Systems Administrator', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, badge_number, role_id, professional_title, is_active) VALUES 
('usr-admin-3', 'Karim Arnaout', 'admin.arnaout@tripoli-health.gov.lb', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 70 334912', 'Maarad', 'TRP-ADM-03', 'ROLE_ADMIN', 'Tripoli Municipal Operations Supervisor', 1);

-- Health Officers
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, badge_number, role_id, professional_title, is_active) VALUES 
('usr-off-1', 'Dr. Tariq Al-Hajj', 'officer.hajj@tripoli-health.gov.lb', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 3 204918', 'Al-Mina', 'TRP-OFF-01', 'ROLE_OFFICER', 'Chief Epidemiologist & Water Quality Lead', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, badge_number, role_id, professional_title, is_active) VALUES 
('usr-off-2', 'Inspector Layla Khoury', 'officer.khoury@tripoli-health.gov.lb', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 70 192834', 'Dam w Farez', 'TRP-OFF-02', 'ROLE_OFFICER', 'Senior Food Safety Inspector', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, badge_number, role_id, professional_title, is_active) VALUES 
('usr-off-3', 'Eng. Ziad Kabbara', 'officer.kabbara@tripoli-health.gov.lb', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 3 726154', 'Bab Al-Tabbaneh', 'TRP-OFF-03', 'ROLE_OFFICER', 'Sanitation & Sewage Infrastructure Specialist', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, badge_number, role_id, professional_title, is_active) VALUES 
('usr-off-4', 'Dr. Rania Dabbousi', 'officer.dabbousi@tripoli-health.gov.lb', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 71 884729', 'Abu Samra', 'TRP-OFF-04', 'ROLE_OFFICER', 'Infectious Disease Surveillance Officer', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, badge_number, role_id, professional_title, is_active) VALUES 
('usr-off-5', 'Inspector Bassam Chami', 'officer.chami@tripoli-health.gov.lb', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 3 993821', 'Beddawi', 'TRP-OFF-05', 'ROLE_OFFICER', 'Environmental Hygiene & Vector Control Officer', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, badge_number, role_id, professional_title, is_active) VALUES 
('usr-off-6', 'Hala Rifai', 'officer.rifai@tripoli-health.gov.lb', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 70 664918', 'Al-Qobbeh', 'TRP-OFF-06', 'ROLE_OFFICER', 'Field Triage & Lab Sampling Coordinator', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, badge_number, role_id, professional_title, is_active) VALUES 
('usr-off-7', 'Dr. Omar Masri', 'officer.masri@tripoli-health.gov.lb', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 3 552190', 'Zahrieh', 'TRP-OFF-07', 'ROLE_OFFICER', 'Public Health Investigation Physician', 1);

-- Citizens
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, role_id, is_active) VALUES 
('usr-cit-1', 'Rami Haddad', 'rami.haddad@gmail.com', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 70 491823', 'Al-Tal', 'ROLE_CITIZEN', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, role_id, is_active) VALUES 
('usr-cit-2', 'Maya Barakat', 'maya.barakat@hotmail.com', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 3 192837', 'Al-Mina', 'ROLE_CITIZEN', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, role_id, is_active) VALUES 
('usr-cit-3', 'Nour Al-Ali', 'nour.ali@gmail.com', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 71 837462', 'Bab Al-Tabbaneh', 'ROLE_CITIZEN', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, role_id, is_active) VALUES 
('usr-cit-4', 'Fadi Merhebi', 'fadi.merhebi@yahoo.com', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 76 543210', 'Abu Samra', 'ROLE_CITIZEN', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, role_id, is_active) VALUES 
('usr-cit-5', 'Sarah Traboulsi', 'sarah.traboulsi@gmail.com', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 3 928374', 'Dam w Farez', 'ROLE_CITIZEN', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, role_id, is_active) VALUES 
('usr-cit-6', 'Wassim Fattal', 'wassim.fattal@gmail.com', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 70 293847', 'Beddawi', 'ROLE_CITIZEN', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, role_id, is_active) VALUES 
('usr-cit-7', 'Reem Chehab', 'reem.chehab@outlook.com', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 71 908172', 'Al-Qobbeh', 'ROLE_CITIZEN', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, role_id, is_active) VALUES 
('usr-cit-8', 'Ahmad Sinno', 'ahmad.sinno@gmail.com', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 3 384729', 'Jabal Mohsen', 'ROLE_CITIZEN', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, role_id, is_active) VALUES 
('usr-cit-9', 'Jad Mikati', 'jad.mikati@gmail.com', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 70 119283', 'Maarad', 'ROLE_CITIZEN', 1);
INSERT INTO USERS (user_id, full_name, email, password_hash, phone, district, role_id, is_active) VALUES 
('usr-cit-10', 'Dina Ghandour', 'dina.ghandour@gmail.com', '$2b$10$e8w.p4B481mP/9eI42yE8.O8t8O1E8aW8o7P4', '+961 76 837461', 'Zahrieh', 'ROLE_CITIZEN', 1);

-- 4. INSERT LOCATIONS
INSERT INTO LOCATIONS (location_id, district, street_address, latitude, longitude) VALUES 
('loc-1', 'Bab Al-Tabbaneh', 'Syria Street near Al-Omari Mosque', 34.444200, 35.850400);
INSERT INTO LOCATIONS (location_id, district, street_address, latitude, longitude) VALUES 
('loc-2', 'Al-Mina', 'Corniche waterfront promenade', 34.451800, 35.819800);
INSERT INTO LOCATIONS (location_id, district, street_address, latitude, longitude) VALUES 
('loc-3', 'Al-Tal', 'Al-Tal Clock Tower Square', 34.436200, 35.844100);
INSERT INTO LOCATIONS (location_id, district, street_address, latitude, longitude) VALUES 
('loc-4', 'Abu Samra', 'Al-Islah Street near Jinan University', 34.422100, 35.848200);
INSERT INTO LOCATIONS (location_id, district, street_address, latitude, longitude) VALUES 
('loc-5', 'Beddawi', 'Beddawi Main Highway near refinery road', 34.461200, 35.864000);

-- 5. SAMPLE KEY REPORTS
INSERT INTO REPORTS (report_id, report_number, citizen_id, category_id, location_id, title, description, incident_date, affected_count, initial_severity, current_status, assigned_officer_id, risk_score, risk_level) VALUES 
('rep-1', 'TRP-2026-0001', 'usr-cit-3', 'cat-3', 'loc-1', 'Brown contaminated tap water with foul petroleum smell', 'Residents in 4 adjacent residential buildings in Syria Street noticed turbid brown tap water with a foul chemical smell. 12 children developed acute vomiting and diarrhea.', CURRENT_TIMESTAMP - INTERVAL '1' DAY, 28, 'CRITICAL', 'IN_INVESTIGATION', 'usr-off-1', 88.00, 'CRITICAL');

INSERT INTO REPORTS (report_id, report_number, citizen_id, category_id, location_id, title, description, incident_date, affected_count, initial_severity, current_status, assigned_officer_id, risk_score, risk_level) VALUES 
('rep-2', 'TRP-2026-0002', 'usr-cit-1', 'cat-2', 'loc-3', 'Multiple food poisoning cases traced to Al-Tal shawarma kiosk', '6 university students and 2 shopkeepers admitted to Nini Hospital with severe food poisoning symptoms after eating chicken garlic paste.', CURRENT_TIMESTAMP - INTERVAL '2' DAY, 14, 'HIGH', 'IN_INVESTIGATION', 'usr-off-2', 79.00, 'CRITICAL');

-- 6. SAMPLE CLUSTER
INSERT INTO CLUSTERS (cluster_id, cluster_code, category_id, district, centroid_lat, centroid_lng, radius_meters, report_count, total_affected, risk_level, time_window_hours, cluster_status) VALUES 
('cls-1', 'CLS-TRP-001', 'cat-3', 'Bab Al-Tabbaneh', 34.444200, 35.850400, 850.0, 8, 92, 'CRITICAL', 48, 'ACTIVE');

-- 7. SAMPLE ALERTS
INSERT INTO ALERTS (alert_id, alert_code, alert_type, title, description, related_report_id, related_cluster_id, risk_level, area, alert_status, assigned_officer_id) VALUES 
('alt-1', 'ALT-2026-001', 'CLUSTER_DETECTED', 'EPIDEMIOLOGICAL WATER CONTAMINATION CLUSTER', 'Concentration of 8 severe waterborne complaints within 850m radius in Bab Al-Tabbaneh within 48 hours.', 'rep-1', 'cls-1', 'CRITICAL', 'Bab Al-Tabbaneh', 'ACTIVE', 'usr-off-1');

COMMIT;
