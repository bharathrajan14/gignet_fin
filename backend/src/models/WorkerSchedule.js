import mongoose from 'mongoose';

const WorkerScheduleSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null, index: true },
  startDateTime: { type: Date, required: true, index: true },
  endDateTime: { type: Date, required: true, index: true },
  scheduleType: {
    type: String,
    enum: ['CONFIRMED_BOOKING', 'SHIFT_AVAILABILITY', 'OFF_DUTY'],
    default: 'CONFIRMED_BOOKING',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [77.6245, 12.9352]
    }
  },
  status: {
    type: String,
    enum: ['RESERVED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'CONFIRMED'
  },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

WorkerScheduleSchema.index({ workerId: 1, startDateTime: 1, endDateTime: 1 });
WorkerScheduleSchema.index({ location: '2dsphere' });

export default mongoose.model('WorkerSchedule', WorkerScheduleSchema);
