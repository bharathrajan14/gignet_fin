import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  defaultLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [77.6245, 12.9352] // Default Bengaluru
    }
  },
  h3Res7: { type: String, index: true, default: '' },
  totalBookingsCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

CustomerSchema.index({ defaultLocation: '2dsphere' });

export default mongoose.model('Customer', CustomerSchema);
