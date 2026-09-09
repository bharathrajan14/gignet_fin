import mongoose from 'mongoose';

const ForecastSchema = new mongoose.Schema({
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true, index: true },
  serviceCategory: {
    type: String,
    enum: ['PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'APPLIANCE', 'CLEANING', 'MASONRY'],
    required: true,
    index: true
  },
  targetDate: { type: Date, required: true, index: true },
  predictedDemandCount: { type: Number, required: true },
  confidenceLower: { type: Number, default: 0 },
  confidenceUpper: { type: Number, default: 0 },
  currentAvailableWorkforce: { type: Number, required: true },
  workforceGap: { type: Number, required: true }, // Positive = Shortage, Negative = Surplus
  actionRecommendation: {
    type: String,
    enum: ['BALANCED', 'REQUEST_WORKERS_INWARD', 'DISPATCH_WORKERS_OUTWARD'],
    default: 'BALANCED'
  },
  modelMetadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

export default mongoose.model('Forecast', ForecastSchema);
