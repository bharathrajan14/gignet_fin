import mongoose from 'mongoose';

const CooperativeAreaSchema = new mongoose.Schema({
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true, index: true },
  h3Index: { type: String, required: true, index: true },
  resolution: { type: Number, default: 7 },
  zoneName: { type: String, default: '' },
  activeDemandCount: { type: Number, default: 0 },
  activeWorkerCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model('CooperativeArea', CooperativeAreaSchema);
