import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  category: {
    type: String,
    enum: ['PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'APPLIANCE', 'CLEANING', 'MASONRY'],
    required: true,
    index: true
  },
  description: { type: String, required: true },
  basePrice: { type: Number, required: true },
  emergencyMultiplier: { type: Number, default: 1.5 },
  estimatedDurationMinutes: { type: Number, default: 60 },
  requiredSkills: [{ type: String }],
  requiredCertifications: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model('Service', ServiceSchema);
