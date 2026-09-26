-- ==============================================================================
-- SMART PUBLIC HEALTH MONITORING AND REPORTING SYSTEM FOR TRIPOLI (LEBANON)
-- Relational Database DDL Schema (Oracle Database & PostgreSQL Compatible)
-- University Senior Architecture Project
-- ==============================================================================

-- 1. ROLES TABLE
CREATE TABLE ROLES (
    role_id VARCHAR2(32) PRIMARY KEY,
    role_name VARCHAR2(64) NOT NULL UNIQUE,
    description VARCHAR2(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. USERS TABLE
CREATE TABLE USERS (
    user_id VARCHAR2(64) PRIMARY KEY,
    full_name VARCHAR2(128) NOT NULL,
    email VARCHAR2(128) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    phone VARCHAR2(32),
    district VARCHAR2(64) DEFAULT 'Al-Tal' NOT NULL,
    badge_number VARCHAR2(32),
    role_id VARCHAR2(32) NOT NULL,
    professional_title VARCHAR2(128),
    avatar_url VARCHAR2(512),
    bio VARCHAR2(1000),
    is_active NUMBER(1) DEFAULT 1 NOT NULL CHECK (is_active IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES ROLES(role_id)
);

CREATE INDEX idx_users_email ON USERS(email);
CREATE INDEX idx_users_district ON USERS(district);
CREATE INDEX idx_users_role ON USERS(role_id);

-- 3. REPORT_CATEGORIES TABLE
CREATE TABLE REPORT_CATEGORIES (
    category_id VARCHAR2(64) PRIMARY KEY,
    name VARCHAR2(128) NOT NULL UNIQUE,
    code VARCHAR2(64) NOT NULL UNIQUE,
    base_weight NUMBER(4, 1) DEFAULT 10.0 NOT NULL CHECK (base_weight >= 1 AND base_weight <= 30),
    icon_name VARCHAR2(64) DEFAULT 'AlertTriangle',
    description VARCHAR2(500),
    is_active NUMBER(1) DEFAULT 1 NOT NULL CHECK (is_active IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. LOCATIONS TABLE
CREATE TABLE LOCATIONS (
    location_id VARCHAR2(64) PRIMARY KEY,
    district VARCHAR2(64) NOT NULL,
    street_address VARCHAR2(255) NOT NULL,
    city VARCHAR2(64) DEFAULT 'Tripoli' NOT NULL,
    country VARCHAR2(64) DEFAULT 'Lebanon' NOT NULL,
    latitude NUMBER(10, 6) NOT NULL CHECK (latitude BETWEEN 34.35 AND 34.55),
    longitude NUMBER(10, 6) NOT NULL CHECK (longitude BETWEEN 35.75 AND 35.95),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_locations_district ON LOCATIONS(district);
CREATE INDEX idx_locations_coords ON LOCATIONS(latitude, longitude);

-- 5. REPORTS TABLE
CREATE TABLE REPORTS (
    report_id VARCHAR2(64) PRIMARY KEY,
    report_number VARCHAR2(32) NOT NULL UNIQUE,
    citizen_id VARCHAR2(64) NOT NULL,
    category_id VARCHAR2(64) NOT NULL,
    location_id VARCHAR2(64) NOT NULL,
    title VARCHAR2(255) NOT NULL,
    description CLOB NOT NULL,
    incident_date TIMESTAMP NOT NULL,
    affected_count NUMBER(6) DEFAULT 1 NOT NULL CHECK (affected_count >= 1),
    initial_severity VARCHAR2(16) NOT NULL CHECK (initial_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    current_status VARCHAR2(24) DEFAULT 'SUBMITTED' NOT NULL CHECK (
        current_status IN ('SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'IN_INVESTIGATION', 'RESOLVED', 'CLOSED', 'REJECTED')
    ),
    assigned_officer_id VARCHAR2(64),
    risk_score NUMBER(5, 2) DEFAULT 0.0 NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level VARCHAR2(16) DEFAULT 'LOW' NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    additional_comments VARCHAR2(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_reports_citizen FOREIGN KEY (citizen_id) REFERENCES USERS(user_id),
    CONSTRAINT fk_reports_category FOREIGN KEY (category_id) REFERENCES REPORT_CATEGORIES(category_id),
    CONSTRAINT fk_reports_location FOREIGN KEY (location_id) REFERENCES LOCATIONS(location_id),
    CONSTRAINT fk_reports_officer FOREIGN KEY (assigned_officer_id) REFERENCES USERS(user_id)
);

CREATE INDEX idx_reports_status ON REPORTS(current_status);
CREATE INDEX idx_reports_risk_level ON REPORTS(risk_level);
CREATE INDEX idx_reports_incident_date ON REPORTS(incident_date);
CREATE INDEX idx_reports_category ON REPORTS(category_id);
CREATE INDEX idx_reports_officer ON REPORTS(assigned_officer_id);

-- 6. REPORT_IMAGES TABLE
CREATE TABLE REPORT_IMAGES (
    image_id VARCHAR2(64) PRIMARY KEY,
    report_id VARCHAR2(64) NOT NULL,
    image_url VARCHAR2(1024) NOT NULL,
    caption VARCHAR2(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_images_report FOREIGN KEY (report_id) REFERENCES REPORTS(report_id) ON DELETE CASCADE
);

-- 7. REPORT_STATUS_HISTORY TABLE (Audit Trail & Workflow History)
CREATE TABLE REPORT_STATUS_HISTORY (
    history_id VARCHAR2(64) PRIMARY KEY,
    report_id VARCHAR2(64) NOT NULL,
    old_status VARCHAR2(24) NOT NULL,
    new_status VARCHAR2(24) NOT NULL,
    changed_by_user_id VARCHAR2(64) NOT NULL,
    role_name VARCHAR2(32) NOT NULL,
    comment_text VARCHAR2(1000),
    transition_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_history_report FOREIGN KEY (report_id) REFERENCES REPORTS(report_id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by_user_id) REFERENCES USERS(user_id)
);

CREATE INDEX idx_history_report ON REPORT_STATUS_HISTORY(report_id);
CREATE INDEX idx_history_time ON REPORT_STATUS_HISTORY(transition_timestamp);

-- 8. RISK_ASSESSMENTS TABLE (Breakdown Vectors of Rule Engine)
CREATE TABLE RISK_ASSESSMENTS (
    assessment_id VARCHAR2(64) PRIMARY KEY,
    report_id VARCHAR2(64) NOT NULL UNIQUE,
    severity_score NUMBER(5, 2) NOT NULL,
    affected_people_score NUMBER(5, 2) NOT NULL,
    recent_reports_score NUMBER(5, 2) NOT NULL,
    geographic_cluster_score NUMBER(5, 2) NOT NULL,
    category_score NUMBER(5, 2) NOT NULL,
    total_risk_score NUMBER(5, 2) NOT NULL CHECK (total_risk_score BETWEEN 0 AND 100),
    calculated_risk_level VARCHAR2(16) NOT NULL CHECK (calculated_risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    explanation_notes CLOB,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_risk_report FOREIGN KEY (report_id) REFERENCES REPORTS(report_id) ON DELETE CASCADE
);

-- 9. INVESTIGATIONS TABLE
CREATE TABLE INVESTIGATIONS (
    investigation_id VARCHAR2(64) PRIMARY KEY,
    investigation_code VARCHAR2(32) NOT NULL UNIQUE,
    report_id VARCHAR2(64) NOT NULL,
    officer_id VARCHAR2(64) NOT NULL,
    investigation_date TIMESTAMP NOT NULL,
    field_findings CLOB NOT NULL,
    actions_taken CLOB NOT NULL,
    recommendations CLOB NOT NULL,
    investigation_result VARCHAR2(32) DEFAULT 'Inconclusive' NOT NULL CHECK (
        investigation_result IN ('Confirmed', 'Not Confirmed', 'Inconclusive', 'Resolved')
    ),
    samples_collected VARCHAR2(500),
    internal_notes CLOB,
    investigation_status VARCHAR2(24) DEFAULT 'IN_PROGRESS' NOT NULL CHECK (
        investigation_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_investigations_report FOREIGN KEY (report_id) REFERENCES REPORTS(report_id),
    CONSTRAINT fk_investigations_officer FOREIGN KEY (officer_id) REFERENCES USERS(user_id)
);

CREATE INDEX idx_investigations_report ON INVESTIGATIONS(report_id);
CREATE INDEX idx_investigations_officer ON INVESTIGATIONS(officer_id);

-- 10. CLUSTERS TABLE (Spatial-Temporal Outbreaks)
CREATE TABLE CLUSTERS (
    cluster_id VARCHAR2(64) PRIMARY KEY,
    cluster_code VARCHAR2(32) NOT NULL UNIQUE,
    category_id VARCHAR2(64) NOT NULL,
    district VARCHAR2(64) NOT NULL,
    centroid_lat NUMBER(10, 6) NOT NULL,
    centroid_lng NUMBER(10, 6) NOT NULL,
    radius_meters NUMBER(8, 2) DEFAULT 800.0 NOT NULL,
    report_count NUMBER(6) NOT NULL,
    total_affected NUMBER(8) NOT NULL,
    risk_level VARCHAR2(16) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    time_window_hours NUMBER(4) DEFAULT 48 NOT NULL,
    cluster_status VARCHAR2(24) DEFAULT 'ACTIVE' NOT NULL CHECK (
        cluster_status IN ('ACTIVE', 'INVESTIGATING', 'CONTAINED', 'RESOLVED')
    ),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    CONSTRAINT fk_clusters_category FOREIGN KEY (category_id) REFERENCES REPORT_CATEGORIES(category_id)
);

CREATE INDEX idx_clusters_status ON CLUSTERS(cluster_status);
CREATE INDEX idx_clusters_district ON CLUSTERS(district);

-- 11. ALERTS TABLE
CREATE TABLE ALERTS (
    alert_id VARCHAR2(64) PRIMARY KEY,
    alert_code VARCHAR2(32) NOT NULL UNIQUE,
    alert_type VARCHAR2(32) NOT NULL CHECK (
        alert_type IN ('CRITICAL_INCIDENT', 'CLUSTER_DETECTED', 'GEOGRAPHIC_SPIKE', 'CATEGORY_SURGE', 'UNRESOLVED_TIMEOUT')
    ),
    title VARCHAR2(255) NOT NULL,
    description CLOB NOT NULL,
    related_report_id VARCHAR2(64),
    related_cluster_id VARCHAR2(64),
    risk_level VARCHAR2(16) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    area VARCHAR2(64) NOT NULL,
    alert_status VARCHAR2(24) DEFAULT 'ACTIVE' NOT NULL CHECK (
        alert_status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')
    ),
    assigned_officer_id VARCHAR2(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    CONSTRAINT fk_alerts_report FOREIGN KEY (related_report_id) REFERENCES REPORTS(report_id) ON DELETE SET NULL,
    CONSTRAINT fk_alerts_cluster FOREIGN KEY (related_cluster_id) REFERENCES CLUSTERS(cluster_id) ON DELETE SET NULL,
    CONSTRAINT fk_alerts_officer FOREIGN KEY (assigned_officer_id) REFERENCES USERS(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_alerts_status ON ALERTS(alert_status);
CREATE INDEX idx_alerts_type ON ALERTS(alert_type);
CREATE INDEX idx_alerts_area ON ALERTS(area);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE NOTIFICATIONS (
    notification_id VARCHAR2(64) PRIMARY KEY,
    user_id VARCHAR2(64) NOT NULL,
    title VARCHAR2(255) NOT NULL,
    message CLOB NOT NULL,
    notification_type VARCHAR2(32) DEFAULT 'SYSTEM' NOT NULL CHECK (
        notification_type IN ('STATUS_UPDATE', 'CRITICAL_ALERT', 'CLUSTER_ALERT', 'ASSIGNMENT', 'SYSTEM')
    ),
    is_read NUMBER(1) DEFAULT 0 NOT NULL CHECK (is_read IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON NOTIFICATIONS(user_id, is_read);

-- 13. AUDIT_LOGS TABLE
CREATE TABLE AUDIT_LOGS (
    log_id VARCHAR2(64) PRIMARY KEY,
    user_id VARCHAR2(64),
    user_name VARCHAR2(128),
    user_role VARCHAR2(32),
    action_type VARCHAR2(64) NOT NULL,
    target_entity VARCHAR2(64) NOT NULL,
    entity_id VARCHAR2(64),
    details CLOB,
    ip_address VARCHAR2(64),
    user_agent VARCHAR2(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_time ON AUDIT_LOGS(created_at);
CREATE INDEX idx_audit_action ON AUDIT_LOGS(action_type);
CREATE INDEX idx_audit_user ON AUDIT_LOGS(user_id);
