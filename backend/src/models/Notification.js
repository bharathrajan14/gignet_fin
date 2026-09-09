import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'BOOKING_OFFER',
      'BOOKING_CONFIRMED',
      'WORKER_ON_THE_WAY',
      'WORKER_ARRIVED',
      'WORKER_STARTED',
      'JOB_COMPLETED',
      'INVOICE_GENERATED',
      'PAYMENT_SUCCESS',
      'OFFER_EXPIRED',
      'KYC_UPDATE',
      'SLA_ALERT',
      'WORKFORCE_SHORTAGE'
    ],
    required: true
  },
  isRead: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

export default mongoose.model('Notification', NotificationSchema);
