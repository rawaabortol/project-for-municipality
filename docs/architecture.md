# Smart Public Health Monitoring and Reporting System for Tripoli (Lebanon)
## System Architecture & Technical Specifications Document

---

### 1. Project Overview & Problem Statement
The city of **Tripoli, Lebanon** (Lebanon's second-largest city, home to over 500,000 residents across historical and dense districts such as Al-Tal, Bab Al-Tabbaneh, Jabal Mohsen, Al-Mina, Abu Samra, Al-Qobbeh, and Beddawi) faces frequent municipal, environmental, and public-health challenges. These include drinking water contamination, sewage overflows into the Mediterranean and Abu Ali River, uncollected waste accumulation, foodborne illnesses in commercial markets, and seasonal pest/vector outbreaks.

The **Smart Public Health Monitoring and Reporting System for Tripoli ("Tripoli HealthPulse")** bridges the gap between citizens on the ground, field health inspectors, and regional municipal health directorates. The system moves away from passive, disconnected paper reporting into a proactive, intelligent pipeline:
$$\text{REPORT} \longrightarrow \text{ANALYZE} \longrightarrow \text{DETECT} \longrightarrow \text{PRIORITIZE} \longrightarrow \text{ALERT} \longrightarrow \text{INVESTIGATE} \longrightarrow \text{RESOLVE} \longrightarrow \text{REPORT}$$

---

### 2. User Roles & Permission Matrix

| Feature / Capability | Citizen | Health Officer | Administrator |
| :--- | :---: | :---: | :---: |
| Self-Register & Authentication | Yes | Yes | Yes |
| Submit Public Health Incident Report | Yes | Yes | Yes |
| Pinpoint Incident on Tripoli Map | Yes | Yes | Yes |
| View Own Submitted Reports & Status Timeline | Yes | Yes | Yes |
| View In-App Status & Alert Notifications | Yes | Yes | Yes |
| View Public Health Bulletins & Public Stats | Yes | Yes | Yes |
| Access Authority Operational Dashboard | No | **Yes** | **Yes** |
| Interactive Tripoli Surveillance Map (All Reports) | No | **Yes** | **Yes** |
| Verify or Reject Citizen Reports | No | **Yes** | **Yes** |
| Modify Priority & Assign Investigating Officer | No | **Yes** | **Yes** |
| Initiate Field Investigation & Record Lab Findings | No | **Yes** | **Yes** |
| Review Transparent Risk Assessment Breakdown | No | **Yes** | **Yes** |
| Trigger Manual or Automated Cluster Detection | No | **Yes** | **Yes** |
| Acknowledge & Manage Health Alerts | No | **Yes** | **Yes** |
| Generate Official Health Directorate PDF/Reports | No | **Yes** | **Yes** |
| Manage System Users & Roles | No | No | **Yes** |
| Manage Dynamic Report Categories & Weights | No | No | **Yes** |
| Adjust Risk Algorithm Weights & Cluster Thresholds | No | No | **Yes** |
| View System-Wide Audit Logs & Security Trails | No | No | **Yes** |

---

### 3. Report Lifecycle Workflow State Machine

```
   [SUBMITTED]
        |
        v (Health Officer Triage)
   [UNDER REVIEW]
      /         \
(Verified)    (Rejected with reason)
    /             \
   v               v
[VERIFIED]     [REJECTED] (Closed)
   |
   v (Officer Field Assignment)
[IN INVESTIGATION]
   |
   v (Actions Taken & Remediation Verified)
[RESOLVED]
   |
   v (Directorate Sign-off)
[CLOSED]
```

Every status transition creates an immutable record in `REPORT_STATUS_HISTORY` containing:
- `reportId`
- `oldStatus`
- `newStatus`
- `changedBy` (User reference)
- `timestamp`
- `comment` / remediation notes

---

### 4. Smart Rule-Based Risk Assessment Engine

The risk engine computes an objective, normalized **0–100 Risk Score** rather than relying on subjective manual input.

$$\text{RiskScore} = \text{Clamp}_{0}^{100} \left( S_{\text{severity}} + S_{\text{affected}} + S_{\text{recency}} + S_{\text{geoDensity}} + S_{\text{category}} \right)$$

#### Score Components:
1. **Severity Score ($S_{\text{severity}}$: 0–25 points):**
   - Critical: 25 points
   - High: 18 points
   - Medium: 10 points
   - Low: 4 points

2. **Affected Population Score ($S_{\text{affected}}$: 0–25 points):**
   - $> 50$ people: 25 points
   - $20 - 50$ people: 20 points
   - $10 - 19$ people: 15 points
   - $4 - 9$ people: 10 points
   - $1 - 3$ people: 5 points

3. **Recency Score ($S_{\text{recency}}$: 0–15 points):**
   - Reported within last 6 hours: 15 points
   - Reported within last 24 hours: 10 points
   - Reported within last 48 hours: 5 points
   - Older: 2 points

4. **Geographical Concentration ($S_{\text{geoDensity}}$: 0–20 points):**
   - Calculated using the Haversine distance formula against all reports within a $1.5\text{ km}$ radius in the last 72 hours:
   - $\ge 5$ nearby reports: 20 points
   - $3 - 4$ nearby reports: 14 points
   - $1 - 2$ nearby reports: 7 points
   - Isolated: 0 points

5. **Category Weight ($S_{\text{category}}$: 0–15 points):**
   - Water Contamination / Unsafe Drinking Water: 15 points (high epidemic potential)
   - Suspected Food Poisoning / Outbreak: 14 points
   - Sewage Overflow: 12 points
   - Rodent / Pest Infestation: 9 points
   - Garbage Accumulation / Air Pollution: 8 points
   - Other: 5 points

#### Risk Tiers:
- **0 – 25:** LOW (Green)
- **26 – 50:** MEDIUM (Yellow/Amber)
- **51 – 75:** HIGH (Orange)
- **76 – 100:** CRITICAL (Red, triggers immediate automated alert)

---

### 5. Spatial-Temporal Cluster Detection Algorithm

The system periodically scans recent reports using a spatial-temporal window:
1. **Distance Metric:** Haversine formula
   $$d = 2R \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos\phi_1 \cos\phi_2 \sin^2\left(\frac{\Delta \lambda}{2}\right)} \right)$$
   Where $R = 6,371\text{ km}$.
2. **Thresholds:**
   - Spatial Radius: $R \le 1.2\text{ km}$
   - Time Window: $T \le 48\text{ hours}$ (or configurable per category)
   - Minimum Density: $N \ge 4$ related reports in the same or linked health categories.
3. **Cluster Generation:**
   When triggered, a new record is generated in the `CLUSTERS` collection with:
   - Cluster centroid $(\text{lat}, \text{lng})$
   - Neighborhood name (e.g., *Bab Al-Tabbaneh*, *Al-Mina Port*, *Al-Tal Central*)
   - Primary category & correlated subcategories
   - Total affected population
   - An automated **HIGH** or **CRITICAL** Alert broadcast to Health Officers.

---

### 6. Database Collections & Schema (MongoDB & Mongoose)

1. **`users`**: `_id`, `name`, `email`, `passwordHash`, `role` (citizen|officer|admin), `phone`, `district`, `badgeNumber`, `createdAt`.
2. **`roles`**: `name`, `description`, `permissions` array.
3. **`report_categories`**: `name`, `code`, `icon`, `baseWeight`, `description`, `isActive`.
4. **`reports`**: `reportNumber`, `citizenId`, `categoryId`, `title`, `description`, `incidentDate`, `location` ({address, district, lat, lng}), `affectedCount`, `severity`, `imageUrl`, `status`, `assignedOfficerId`, `riskScore`, `riskLevel`, `riskFactors`, `createdAt`.
5. **`report_status_history`**: `reportId`, `oldStatus`, `newStatus`, `changedBy`, `comment`, `createdAt`.
6. **`investigations`**: `reportId`, `officerId`, `inspectionDate`, `findings`, `actionsTaken`, `recommendations`, `result` (Confirmed|Not Confirmed|Inconclusive|Resolved), `samplesCollected`, `notes`, `status`, `updatedAt`.
7. **`risk_assessments`**: `reportId`, `score`, `level`, `factorsBreakdown`, `calculatedAt`.
8. **`clusters`**: `clusterCode`, `category`, `district`, `centroid`, `radiusMeters`, `reportIds`, `reportCount`, `totalAffected`, `riskLevel`, `detectedAt`, `status`.
9. **`alerts`**: `alertType`, `title`, `description`, `relatedReportId`, `relatedClusterId`, `riskLevel`, `area`, `status` (Active|Acknowledged|Resolved), `assignedOfficerId`, `createdAt`.
10. **`notifications`**: `userId`, `title`, `message`, `type`, `link`, `isRead`, `createdAt`.
11. **`audit_logs`**: `userId`, `userRole`, `action`, `resource`, `details`, `ip`, `timestamp`.
