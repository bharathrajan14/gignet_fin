import mongoose from 'mongoose';

const AllocationRunSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  runNumber: { type: Number, required: true, default: 1 },
  triggerReason: {
    type: String,
    enum: ['INITIAL_SEARCH', 'OFFER_REJECTED', 'OFFER_TIMEOUT', 'RADIUS_EXPANSION', 'MANUAL'],
    default: 'INITIAL_SEARCH'
  },
  radiusKm: { type: Number, required: true },
  searchStage: { type: String, required: true },
  totalEvaluated: { type: Number, default: 0 },
  eligibleCount: { type: Number, default: 0 },
  excludedCount: { type: Number, default: 0 },
  selectedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', default: null },
  status: {
    type: String,
    enum: ['CANDIDATE_OFFERED', 'EXHAUSTED', 'EXHAUSTED_NEED_EXPANSION', 'FAILED'],
    default: 'CANDIDATE_OFFERED'
  }
}, {
  timestamps: true
});

export default mongoose.model('AllocationRun', AllocationRunSchema);
