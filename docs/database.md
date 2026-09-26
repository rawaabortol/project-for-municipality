# Tripoli HealthPulse - Database Architecture & Mongoose Schema Specification

## 1. Database Overview
- **Database Engine**: MongoDB
- **Object Data Modeling (ODM)**: Mongoose 8.x
- **Geospatial Support**: 2dsphere indexing for latitude/longitude coordinate filtering
- **Design Pattern**: Normalized document referencing with embedded audit sub-documents for status histories and calculated risk breakdown vectors.

---

## 2. Collections & Relationships

```
                     ┌──────────────────────┐
                     │   REPORT_CATEGORIES  │
                     └──────────┬───────────┘
                                │ (1 : N)
 ┌─────────────┐     ┌──────────▼───────────┐     ┌─────────────────────┐
 │    USERS    │────▶│       REPORTS        │◀────│   RISK_ASSESSMENTS  │
 └─────────────┘     └──────────┬───────────┘     └─────────────────────┘
        │                       │
        │                       │ (1 : 1..N)
        │                       ▼
        │            ┌──────────────────────┐
        └───────────▶│    INVESTIGATIONS    │
                     └──────────────────────┘
                                │
                                ▼
                     ┌──────────────────────┐
                     │       CLUSTERS       │
                     └──────────┬───────────┘
                                │
                                ▼
                     ┌──────────────────────┐
                     │        ALERTS        │
                     └──────────────────────┘
```

---

## 3. Mongoose Schemas

### 3.1 Users Collection (`users`)
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['CITIZEN', 'HEALTH_OFFICER', 'ADMINISTRATOR'], default: 'CITIZEN' },
  phone: { type: String },
  district: { type: String, default: 'Al-Tal' },
  badgeNumber: { type: String },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

### 3.2 Report Categories (`report_categories`)
```javascript
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String },
  baseWeight: { type: Number, required: true, default: 10, min: 1, max: 25 },
  icon: { type: String, default: 'AlertCircle' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

### 3.3 Public Health Reports (`reports`)
```javascript
const reportSchema = new mongoose.Schema({
  reportNumber: { type: String, required: true, unique: true, index: true },
  citizen: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    phone: String,
    email: String
  },
  category: {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    name: { type: String, required: true },
    code: { type: String, required: true }
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  incidentDate: { type: Date, default: Date.now },
  location: {
    address: { type: String, required: true },
    district: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  affectedCount: { type: Number, default: 1, min: 1 },
  initialSeverity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  imageUrl: String,
  additionalComments: String,
  status: {
    type: String,
    enum: ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'IN_INVESTIGATION', 'RESOLVED', 'CLOSED', 'REJECTED'],
    default: 'SUBMITTED',
    index: true
  },
  assignedOfficer: {
    officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    badgeNumber: String
  },
  riskScore: { type: Number, min: 0, max: 100, default: 0 },
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW', index: true },
  riskFactors: {
    severityScore: Number,
    affectedPeopleScore: Number,
    recentReportsScore: Number,
    geographicClusterScore: Number,
    categoryScore: Number,
    explanations: [String]
  },
  statusHistory: [{
    oldStatus: String,
    newStatus: String,
    changedBy: { name: String, role: String },
    timestamp: { type: Date, default: Date.now },
    comment: String
  }]
}, { timestamps: true });

reportSchema.index({ 'location.lat': 1, 'location.lng': 1 });
reportSchema.index({ createdAt: -1 });
```

### 3.4 Investigations (`investigations`)
```javascript
const investigationSchema = new mongoose.Schema({
  investigationCode: { type: String, required: true, unique: true },
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true, index: true },
  reportNumber: { type: String, required: true },
  officer: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    badgeNumber: String
  },
  investigationDate: { type: Date, default: Date.now },
  findings: { type: String, required: true },
  actionsTaken: { type: String, required: true },
  recommendations: { type: String, required: true },
  result: { type: String, enum: ['Confirmed', 'Not Confirmed', 'Inconclusive', 'Resolved'], default: 'Inconclusive' },
  samplesCollected: { type: String, default: 'None' },
  notes: String,
  status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'IN_PROGRESS' }
}, { timestamps: true });
```

### 3.5 Outbreak Clusters (`clusters`)
```javascript
const clusterSchema = new mongoose.Schema({
  clusterCode: { type: String, required: true, unique: true },
  categoryName: { type: String, required: true },
  district: { type: String, required: true },
  centroid: { lat: Number, lng: Number },
  radiusMeters: { type: Number, default: 1000 },
  reportIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
  reportCount: { type: Number, required: true },
  totalAffected: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'HIGH' },
  timeWindowHours: { type: Number, default: 48 },
  detectedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['ACTIVE', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'], default: 'ACTIVE' }
}, { timestamps: true });
```

### 3.6 Alerts (`alerts`)
```javascript
const alertSchema = new mongoose.Schema({
  alertCode: { type: String, required: true, unique: true },
  alertType: { type: String, enum: ['CRITICAL_INCIDENT', 'CLUSTER_DETECTED', 'GEOGRAPHIC_SPIKE', 'CATEGORY_SURGE', 'UNRESOLVED_TIMEOUT'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  relatedReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  relatedClusterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cluster' },
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'HIGH' },
  area: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'], default: 'ACTIVE' },
  assignedOfficer: { userId: mongoose.Schema.Types.ObjectId, name: String }
}, { timestamps: true });
```
