import Invoice from '../models/Invoice.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import Cooperative from '../models/Cooperative.js';
import { FINANCIAL_SPLIT } from '../shared/contracts.js';

/**
 * Generates an itemized invoice for a completed booking.
 * Adheres strictly to cooperative welfare splits:
 * 80% Worker direct payout, 15% Cooperative emergency reserve, 5% platform infra.
 */
export async function generateInvoiceForBooking(bookingId) {
  const booking = await Booking.findById(bookingId).populate('assignedWorkerId');
  if (!booking) throw new Error('Booking not found');

  const existing = await Invoice.findOne({ bookingId });
  if (existing) return existing;

  const total = booking.pricing.totalAmount;
  const workerPayout = Math.round(total * FINANCIAL_SPLIT.WORKER_SHARE_PERCENT);
  const cooperativeReserve = Math.round(total * FINANCIAL_SPLIT.COOPERATIVE_RESERVE_PERCENT);
  const infrastructureCut = total - workerPayout - cooperativeReserve; // exact remainder (approx 5%)

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randSeq = Math.floor(1000 + Math.random() * 9000);
  const invoiceNumber = `INV-${dateStr}-${randSeq}`;

  const invoice = await Invoice.create({
    invoiceNumber,
    bookingId: booking._id,
    customerId: booking.customerId,
    workerId: booking.assignedWorkerId._id,
    cooperativeId: booking.cooperativeId,
    breakdown: {
      serviceAmount: booking.pricing.baseAmount,
      emergencySurcharge: booking.pricing.emergencySurcharge,
      workerPayout,
      cooperativeReserve,
      infrastructureCut,
      totalAmount: total
    },
    status: 'UNPAID',
    issuedAt: new Date()
  });

  // Credit cooperative reserve fund
  await Cooperative.findByIdAndUpdate(booking.cooperativeId, {
    $inc: { reserveFundBalance: cooperativeReserve }
  });

  // Update worker earnings records
  await Worker.findByIdAndUpdate(booking.assignedWorkerId._id, {
    $inc: {
      'fairnessMetrics.totalEarnings': workerPayout,
      'fairnessMetrics.weeklyEarnings': workerPayout,
      'fairnessMetrics.completedJobsCount': 1,
      ...(booking.bookingType === 'EMERGENCY' ? { 'fairnessMetrics.emergencyJobsCount': 1 } : { 'fairnessMetrics.scheduledJobsCount': 1 })
    }
  });

  return invoice;
}
