import mongoose from 'mongoose';
import { RISK_LEVELS } from '../constant/index.js';

const clusterSchema = new mongoose.Schema(
  {
    clusterCode: {
      type: String,
      required: true,
      unique: true
    },
    categoryName: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    centroid: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    radiusMeters: {
      type: Number,
      default: 1000
    },
    reportIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report'
    }],
    reportCount: {
      type: Number,
      required: true
    },
    totalAffected: {
      type: Number,
      default: 0
    },
    riskLevel: {
      type: String,
      enum: Object.values(RISK_LEVELS),
      default: RISK_LEVELS.HIGH
    },
    timeWindowHours: {
      type: Number,
      default: 48
    },
    detectedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Cluster || mongoose.model('Cluster', clusterSchema);
