import mongoose from 'mongoose';

const WorkerSharingRequestSchema = new mongoose.Schema({
  requestingCooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true, index: true },
  targetCooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true, index: true },
  serviceCategory: {
    type: String,
    enum: ['PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'APPLIANCE', 'CLEANING', 'MASONRY'],
    required: true
  },
  targetDate: { type: Date, required: true, index: true },
  requestedCount: { type: Number, required: true, min: 1 },
  approvedCount: { type: Number, default: 0 },
  assignedWorkerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }],
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'],
    default: 'PENDING',
    index: true
  },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

export default mongoose.model('WorkerSharingRequest', WorkerSharingRequestSchema);
