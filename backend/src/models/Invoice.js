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
    partsTotal: { type: Number, default: 0 },
    welfareFundFee: { type: Number, default: 15 },
    workerPayout: { type: Number, required: true },
    cooperativeReserve: { type: Number, required: true },
    infrastructureCut: { type: Number, required: true },
    totalAmount: { type: Number, required: true }
  },

  parts: [{
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitCost: { type: Number, required: true },
    total: { type: Number, required: true }
  }],

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
