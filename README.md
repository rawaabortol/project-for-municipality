# Tripoli HealthPulse - Smart Public Health Monitoring System
Municipality of Tripoli (Lebanon)

A full-stack, smart public health incident surveillance, risk assessment, epidemiological cluster detection, and municipal reporting platform.

## Architecture & Technology Stack

### Database & Backend
- **Database Engine**: MongoDB with Mongoose ODM (pure NoSQL document-based schema; No SQL)
- **Runtime & Server**: Node.js, Express.js, WebSocket (Socket.io)
- **Schemas & Models**:
  - `User`: Citizens, Public Health Officers, Municipal Admins, Investigators with roles, districts, and credentials.
  - `Role`: System permissions, role hierarchies, and capabilities.
  - `Category`: Health and environmental hazard categories with baseline risk weights.
  - `Report`: Incident reports with geo-coordinates, affected counts, severity levels, and audit trail.
  - `RiskAssessment`: Dynamic risk calculation scores, level classification, and contributing factor weights.
  - `Cluster`: Outbreak and spatial clustering algorithms identifying emergent hot-spots across Tripoli districts.
  - `Investigation`: Official field investigations, laboratory sample logs, regulatory actions, and findings.
  - `Alert`: Real-time municipal alerts for health officers, emergencies, and citizen advisories.
  - `Notification`: In-app and push notifications for status updates and warnings.
  - `AuditLog`: Immutable audit trail for all municipal and administrative actions.

### Client Frontend
- **Framework**: React SPA (Vite)
- **Interactive Maps**: Leaflet / OpenStreetMap with high-resolution Tripoli municipal districts and geofences
- **Styling**: Tailwind CSS with RTL/LTR Arabic and English support
- **State & Context**: AuthContext, NotificationContext, LanguageContext

## Directory Structure
```
├── client/
│   ├── context/
│   ├── public/
│   │   └── assets/
│   ├── services/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── utils/
│   │   ├── APIConst.js
│   │   ├── authStorage.js
│   │   ├── axios.js
│   │   ├── helper.js
│   │   └── supabaseClient.js
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vercel.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── constant/
│   │   ├── controller/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── service/
│   │   └── socket/
│   ├── .env
│   ├── index.js
│   └── package.json
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── README.md
└── styles.css
```

## Running the Application
1. **Frontend**: `npm run dev` (starts on port 3000)
2. **Server**: `cd server && npm run dev` (starts on port 5000)
