import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
  
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewTags: [{ type: String }],
  feedbackText: { type: String, default: '' }
}, {
  timestamps: true
});

export default mongoose.model('Rating', RatingSchema);
