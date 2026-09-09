import mongoose from 'mongoose';

const CooperativeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  registrationNumber: { type: String, required: true, unique: true },
  federationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', default: null },
  contactPhone: { type: String, required: true },
  email: { type: String, default: '' },
  centerLocation: {
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
  operationalRadiusKm: { type: Number, default: 15 },
  coveredH3Cells: [{ type: String, index: true }],
  activeWorkersCount: { type: Number, default: 0 },
  reserveFundBalance: { type: Number, default: 0 }
}, {
  timestamps: true
});

CooperativeSchema.index({ centerLocation: '2dsphere' });

export default mongoose.model('Cooperative', CooperativeSchema);
