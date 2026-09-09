import mongoose from 'mongoose';

const WorkforcePlanSchema = new mongoose.Schema({
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true, index: true },
  planPeriodStart: { type: Date, required: true },
  planPeriodEnd: { type: Date, required: true },
  projectedDemandHours: { type: Number, required: true },
  availableWorkforceHours: { type: Number, required: true },
  netGapHours: { type: Number, required: true },
  recommendedHiringCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'ACTIVE', 'ARCHIVED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

export default mongoose.model('WorkforcePlan', WorkforcePlanSchema);
