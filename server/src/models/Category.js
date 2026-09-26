import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    baseWeight: {
      type: Number,
      required: true,
      default: 10,
      min: 1,
      max: 25
    },
    icon: {
      type: String,
      default: 'AlertCircle'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
