import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative', required: true, index: true },

  breakdown: {
    serviceAmount: { type: Number, required: true },
    emergencySurcharge: { type: Number, default: 0 },
    workerPayout: { type: Number, required: true },       // 80%
    cooperativeReserve: { type: Number, required: true }, // 15%
    infrastructureCut: { type: Number, required: true },  // 5%
    totalAmount: { type: Number, required: true }
  },

  status: {
    type: String,
    enum: ['UNPAID', 'PAID', 'REFUNDED'],
    default: 'UNPAID',
    index: true
  },
  
  issuedAt: { type: Date, default: Date.now },
  paidAt: { type: Date, default: null }
}, {
  timestamps: true
});

export default mongoose.model('Invoice', InvoiceSchema);
