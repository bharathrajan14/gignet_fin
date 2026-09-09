import mongoose from 'mongoose';

const WorkerLocationSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, unique: true, index: true },
  location: {
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
  h3Res7: { type: String, index: true, default: '' },
  h3Res8: { type: String, index: true, default: '' },
  heading: { type: Number, default: 0 },
  speed: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false, index: true },
  isSimulated: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

// CRITICAL 2DSPHERE INDEX FOR PROGRESSIVE GEO RADIUS DISPATCH
WorkerLocationSchema.index({ location: '2dsphere' });

export default mongoose.model('WorkerLocation', WorkerLocationSchema);
