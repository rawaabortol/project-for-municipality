import mongoose from 'mongoose';
import { ALERT_TYPES, RISK_LEVELS } from '../constant/index.js';

const alertSchema = new mongoose.Schema(
  {
    alertCode: {
      type: String,
      required: true,
      unique: true
    },
    alertType: {
      type: String,
      enum: Object.values(ALERT_TYPES),
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    relatedReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report'
    },
    relatedClusterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cluster'
    },
    riskLevel: {
      type: String,
      enum: Object.values(RISK_LEVELS),
      default: RISK_LEVELS.HIGH
    },
    area: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
      default: 'ACTIVE'
    },
    assignedOfficer: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Alert || mongoose.model('Alert', alertSchema);
