import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      default: ''
    },
    permissions: [{
      type: String
    }]
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Role || mongoose.model('Role', roleSchema);
