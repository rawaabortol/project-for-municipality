import mongoose from 'mongoose';
import { INVESTIGATION_RESULTS, INVESTIGATION_STATUSES } from '../constant/index.js';

const investigationSchema = new mongoose.Schema(
  {
    investigationCode: {
      type: String,
      required: true,
      unique: true
    },
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
    officer: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      badgeNumber: { type: String }
    },
    investigationDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    findings: {
      type: String,
      required: [true, 'Field findings are required'],
      trim: true
    },
    actionsTaken: {
      type: String,
      required: [true, 'Actions taken are required'],
      trim: true
    },
    recommendations: {
      type: String,
      required: [true, 'Recommendations are required'],
      trim: true
    },
    result: {
      type: String,
      enum: Object.values(INVESTIGATION_RESULTS),
      default: INVESTIGATION_RESULTS.INCONCLUSIVE
    },
    samplesCollected: {
      type: String,
      default: 'None'
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(INVESTIGATION_STATUSES),
      default: INVESTIGATION_STATUSES.IN_PROGRESS
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Investigation || mongoose.model('Investigation', investigationSchema);
