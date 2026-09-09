import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  
  paymentMethod: {
    type: String,
    enum: ['DEMO_UPI', 'DEMO_CARD', 'CASH_ON_SERVICE'],
    default: 'DEMO_UPI',
    required: true
  },
  demoTransactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING'],
    default: 'SUCCESS'
  },
  paidAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model('Payment', PaymentSchema);
