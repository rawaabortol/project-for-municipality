import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['STATUS_UPDATE', 'CRITICAL_ALERT', 'CLUSTER_ALERT', 'ASSIGNMENT', 'SYSTEM'],
      default: 'STATUS_UPDATE'
    },
    link: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
