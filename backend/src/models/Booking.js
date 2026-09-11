import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  bookingNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true, index: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
  
  bookingType: {
    type: String,
    enum: ['EMERGENCY', 'SCHEDULED'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: [
      'DRAFT',
      'SEARCHING',
      'OFFERED',
      'CONFIRMED',
      'ON_THE_WAY',
      'ARRIVED',
      'IN_PROGRESS',
      'COMPLETED',
      'PAID',
      'CANCELLED'
    ],
    default: 'DRAFT',
    required: true,
    index: true
  },
  
  customerLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  addressText: { type: String, required: true },
  h3Res7: { type: String, index: true, default: '' },
  h3Res8: { type: String, index: true, default: '' },
  scheduledFor: { type: Date, default: null }, // Null for EMERGENCY, future Date for SCHEDULED
  
  // AI Problem Classification (DistilBERT)
  problemDescription: { type: String, default: '' },
  serviceCategory: { type: String, default: '' },
  subSkillId: { type: String, default: '', index: true },
  classificationConfidence: { type: Number, default: 0 },
  classificationSource: { type: String, default: '' },
  modelVersion: { type: String, default: '' },

  assignedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', default: null, index: true },
  currentOfferId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerOffer', default: null },

  pricing: {
    baseAmount: { type: Number, required: true },
    emergencySurcharge: { type: Number, default: 0 },
    materialsCost: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    cooperativeReserve: { type: Number, default: 0 },
    workerPayout: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  },

  partsUsed: [{
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitCost: { type: Number, required: true },
    total: { type: Number, required: true }
  }],

  cancellation: {
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reason: { type: String, default: '' },
    cancelledAt: { type: Date, default: null }
  },

  timestamps: {
    searchingStartedAt: { type: Date, default: null },
    workerAssignedAt: { type: Date, default: null },
    onTheWayAt: { type: Date, default: null },
    arrivedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null }
  }
}, {
  timestamps: true
});

BookingSchema.index({ customerLocation: '2dsphere' });

export default mongoose.model('Booking', BookingSchema);
