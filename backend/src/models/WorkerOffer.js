import mongoose from 'mongoose';

const WorkerOfferSchema = new mongoose.Schema({
  allocationRunId: { type: mongoose.Schema.Types.ObjectId, ref: 'AllocationRun', required: true, index: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'AllocationCandidate', default: null },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
  
  offerStatus: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'TIMED_OUT', 'REVOKED'],
    default: 'PENDING',
    required: true,
    index: true
  },
  
  offeredAt: { type: Date, default: Date.now, required: true },
  expiresAt: { type: Date, required: true, index: true },
  respondedAt: { type: Date, default: null },
  
  details: {
    serviceName: { type: String, required: true },
    bookingType: { type: String, required: true },
    distanceKm: { type: Number, default: 0 },
    etaMinutes: { type: Number, default: 15 },
    estimatedPayout: { type: Number, required: true },
    addressText: { type: String, default: '' },
    customerRating: { type: Number, default: 5.0 }
  }
}, {
  timestamps: true
});

export default mongoose.model('WorkerOffer', WorkerOfferSchema);
