import mongoose from 'mongoose';

const WorkerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true, index: true },
  badgeNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
  
  kycStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
    index: true
  },
  kycDocuments: [{
    docType: { type: String, enum: ['AADHAAR', 'VOTER_ID', 'PAN', 'TRADE_LICENSE'], required: true },
    documentNumber: { type: String, required: true },
    fileUrl: { type: String, required: true },
    verifiedAt: { type: Date },
    rejectionReason: { type: String, default: '' }
  }],
  
  isOnline: { type: Boolean, default: false, index: true },
  isAvailable: { type: Boolean, default: true, index: true },
  activeBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },

  skills: [{ type: String, index: true }], // e.g. ['PLUMBING_BASIC', 'PIPE_FITTING']
  certifications: [{
    code: { type: String, required: true },
    name: { type: String, required: true },
    certificateNo: { type: String, required: true },
    issuingBody: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    docUrl: { type: String, default: '' },
    isVerified: { type: Boolean, default: false }
  }],

  rating: {
    average: { type: Number, default: 5.0, min: 1.0, max: 5.0 },
    count: { type: Number, default: 0 }
  },
  reliabilityScore: { type: Number, default: 100, min: 0, max: 100 },

  fairnessMetrics: {
    completedJobsCount: { type: Number, default: 0 },
    emergencyJobsCount: { type: Number, default: 0 },
    scheduledJobsCount: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    weeklyEarnings: { type: Number, default: 0 },
    weeklyAssignedHours: { type: Number, default: 0 },
    workloadStatus: {
      type: String,
      enum: ['UNDERUTILIZED', 'BALANCED', 'HIGH_WORKLOAD', 'OVERLOADED'],
      default: 'BALANCED',
      index: true
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Worker', WorkerSchema);
