import mongoose from 'mongoose';

const WelfareFundSchema = new mongoose.Schema({
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true, index: true },
  transactionType: {
    type: String,
    enum: ['BOOKING_RESERVE_CREDIT', 'HEALTH_BENEFIT_DISBURSAL', 'ACCIDENT_INSURANCE_PREMIUM', 'TOOL_GRANT'],
    required: true
  },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', default: null },
  description: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('WelfareFund', WelfareFundSchema);
