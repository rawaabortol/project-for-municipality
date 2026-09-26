import mongoose from 'mongoose';
import { RISK_LEVELS } from '../constant/index.js';

const riskAssessmentSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: true,
      index: true
    },
    reportNumber: {
      type: String,
      required: true
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      enum: Object.values(RISK_LEVELS),
      required: true
    },
    breakdown: {
      severityScore: Number,
      affectedPeopleScore: Number,
      recentReportsScore: Number,
      geographicClusterScore: Number,
      categoryScore: Number
    },
    explanations: [{
      type: String
    }],
    calculatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.RiskAssessment || mongoose.model('RiskAssessment', riskAssessmentSchema);
