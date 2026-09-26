import mongoose from 'mongoose';
import { REPORT_STATUSES, SEVERITY_LEVELS, RISK_LEVELS } from '../constant/index.js';

const statusHistorySchema = new mongoose.Schema({
  oldStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  changedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    role: { type: String, required: true }
  },
  timestamp: { type: Date, default: Date.now },
  comment: { type: String, default: '' }
}, { _id: false });

const riskFactorsSchema = new mongoose.Schema({
  severityScore: { type: Number, default: 0 },
  affectedPeopleScore: { type: Number, default: 0 },
  recentReportsScore: { type: Number, default: 0 },
  geographicClusterScore: { type: Number, default: 0 },
  categoryScore: { type: Number, default: 0 },
  explanations: [{ type: String }]
}, { _id: false });

const reportSchema = new mongoose.Schema(
  {
    reportNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    citizen: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      phone: { type: String },
      email: { type: String }
    },
    category: {
      categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      name: { type: String, required: true },
      code: { type: String, required: true }
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    incidentDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    location: {
      address: { type: String, required: true },
      district: { type: String, required: true },
      lat: { type: Number, required: true, min: 34.3, max: 34.55 }, // Tripoli bounds
      lng: { type: Number, required: true, min: 35.75, max: 35.95 }
    },
    affectedCount: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    },
    initialSeverity: {
      type: String,
      enum: Object.values(SEVERITY_LEVELS),
      default: SEVERITY_LEVELS.MEDIUM
    },
    imageUrl: {
      type: String,
      default: ''
    },
    additionalComments: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUSES),
      default: REPORT_STATUSES.SUBMITTED,
      index: true
    },
    assignedOfficer: {
      officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
      badgeNumber: { type: String }
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    riskLevel: {
      type: String,
      enum: Object.values(RISK_LEVELS),
      default: RISK_LEVELS.LOW,
      index: true
    },
    riskFactors: {
      type: riskFactorsSchema,
      default: () => ({})
    },
    statusHistory: [statusHistorySchema]
  },
  {
    timestamps: true
  }
);

reportSchema.index({ 'location.lat': 1, 'location.lng': 1 });
reportSchema.index({ createdAt: -1 });

export default mongoose.models.Report || mongoose.model('Report', reportSchema);
