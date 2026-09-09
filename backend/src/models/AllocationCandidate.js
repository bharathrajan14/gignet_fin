import mongoose from 'mongoose';

const AllocationCandidateSchema = new mongoose.Schema({
  allocationRunId: { type: mongoose.Schema.Types.ObjectId, ref: 'AllocationRun', required: true, index: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
  rank: { type: Number, default: 999 },
  isExcluded: { type: Boolean, default: false, index: true },
  exclusionReasons: [{ type: String }],
  
  scores: {
    distanceKm: { type: Number, default: 0 },
    distanceScore: { type: Number, default: 0 },
    ratingScore: { type: Number, default: 0 },
    utilizationScore: { type: Number, default: 0 },
    hoursWorkedToday: { type: Number, default: 0 },
    hoursAvailableToday: { type: Number, default: 8 },
    isSameCooperative: { type: Boolean, default: false },
    cooperativeBonus: { type: Number, default: 0 },
    compositeScore: { type: Number, default: 0 },
    finalScore: { type: Number, default: 0 }
  },

  explainabilitySummary: { type: String, default: '' }
}, {
  timestamps: true
});

AllocationCandidateSchema.index({ allocationRunId: 1, rank: 1 });

export default mongoose.model('AllocationCandidate', AllocationCandidateSchema);
