# Tripoli HealthPulse - REST API Specification

## Base URL
`/api`

## Authentication
Bearer token passed in `Authorization: Bearer <token>` header.

---

### Endpoints

#### 1. Authentication
- `POST /api/auth/register`
  - Body: `{ name, email, password, phone, district }`
  - Response: `{ success: true, user, token }`
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ success: true, user, token }`

#### 2. Public Health Reports
- `GET /api/reports`
  - Query Params: `category, district, status, riskLevel, page, limit`
  - Response: `{ success: true, count, reports: [...] }`
- `POST /api/reports`
  - Auth: Required (Citizen, Officer, Admin)
  - Body: `{ category, title, description, incidentDate, location: { address, district, lat, lng }, affectedCount, initialSeverity, imageUrl, additionalComments }`
  - Note: Evaluates automated risk calculation engine before persistence.
  - Response: `201 Created` with computed `riskScore`, `riskLevel`, and `riskFactors`.
- `GET /api/reports/:id`
  - Response: Detailed report with populated citizen, category, status history timeline, and risk factors.
- `PUT /api/reports/:id/status`
  - Auth: Officer or Admin
  - Body: `{ newStatus, comment }`
  - Response: Updated report and created status-history audit log.
- `PUT /api/reports/:id/assign`
  - Auth: Officer or Admin
  - Body: `{ officerId }`
  - Response: Updated report assignment.

#### 3. Field Investigations
- `GET /api/investigations`
  - Response: List of all ongoing and completed field investigations.
- `POST /api/investigations`
  - Auth: Officer or Admin
  - Body: `{ reportId, reportNumber, findings, actionsTaken, recommendations, result, samplesCollected, notes }`
  - Response: `201 Created` with generated investigation code.
- `PUT /api/investigations/:id`
  - Auth: Officer or Admin
  - Body: Partial update payload.

#### 4. Spatial-Temporal Clusters & Alerts
- `GET /api/clusters`
  - Response: Active detected outbreak clusters in Tripoli.
- `POST /api/clusters/detect`
  - Auth: Officer or Admin
  - Executes Haversine radius scan and sliding temporal correlation algorithm.
- `GET /api/alerts`
  - Response: All surveillance alerts (Critical tiers, cluster detections, unresolved timeouts).
- `PUT /api/alerts/:id/ack`
  - Acknowledges alert with officer identity.
- `PUT /api/alerts/:id/resolve`
  - Marks alert resolved.

#### 5. Epidemiology Dashboard & Metrics
- `GET /api/dashboard/statistics`
  - Returns total reports, today, this week, critical count, resolution rate, category breakdown, district density, and risk distribution.

#### 6. User Management (Admin)
- `GET /api/users`
  - Auth: Admin only
- `PUT /api/users/:id/role`
  - Auth: Admin only
  - Body: `{ role: 'CITIZEN' | 'HEALTH_OFFICER' | 'ADMINISTRATOR' }`
