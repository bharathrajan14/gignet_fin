import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Customer from '../models/Customer.js';
import Cooperative from '../models/Cooperative.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Rating from '../models/Rating.js';
import Worker from '../models/Worker.js';
import BookingEvent from '../models/BookingEvent.js';
import { runAllocation } from '../allocation/allocationEngine.js';
import { toH3 } from '../utils/geoUtils.js';
import { getSocketIO } from '../services/socketService.js';

export async function getServices(req, res) {
  try {
    const services = await Service.find({ isActive: true });
    return res.status(200).json({ success: true, data: services });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createBooking(req, res) {
  try {
    const {
      serviceId,
      bookingType = 'EMERGENCY',
      customerLocation, // [lon, lat]
      addressText = '12th Main, Koramangala 4th Block, Bengaluru',
      scheduledFor = null
    } = req.body;

    if (!serviceId || !customerLocation || !Array.isArray(customerLocation)) {
      return res.status(400).json({ success: false, message: 'serviceId and customerLocation [lon, lat] are required.' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    // Find governing or nearest cooperative
    let coop = await Cooperative.findOne();
    if (!coop) {
      coop = await Cooperative.create({
        name: 'Bengaluru South Labour Cooperative Society',
        code: 'COOP_BLR_01',
        registrationNumber: 'REG-BLR-2024-88',
        contactPhone: '+91 80 2555 1234',
        centerLocation: { type: 'Point', coordinates: [77.6245, 12.9352] }
      });
    }

    // Pricing calculation
    const baseAmount = service.basePrice;
    const emergencySurcharge = bookingType === 'EMERGENCY'
      ? Math.round(baseAmount * (service.emergencyMultiplier - 1.0))
      : 0;
    const totalAmount = baseAmount + emergencySurcharge;
    const platformFee = Math.round(totalAmount * 0.05);
    const cooperativeReserve = Math.round(totalAmount * 0.15);
    const workerPayout = totalAmount - platformFee - cooperativeReserve;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSeq = Math.floor(100 + Math.random() * 900);
    const bookingNumber = `BK-${bookingType[0]}-${dateStr}-${randSeq}`;

    const [lon, lat] = customerLocation;
    const h3Res7 = toH3(lat, lon, 7);
    const h3Res8 = toH3(lat, lon, 8);

    // Resolve or create Customer record
    let customer = await Customer.findOne({ userId: req.user.id });
    if (!customer) {
      customer = await Customer.create({
        userId: req.user.id,
        defaultLocation: { type: 'Point', coordinates: customerLocation },
        h3Res7
      });
    }

    const booking = await Booking.create({
      bookingNumber,
      customerId: customer._id,
      cooperativeId: coop._id,
      serviceId: service._id,
      bookingType,
      status: 'DRAFT',
      customerLocation: { type: 'Point', coordinates: customerLocation },
      addressText,
      h3Res7,
      h3Res8,
      scheduledFor: bookingType === 'SCHEDULED' ? (scheduledFor ? new Date(scheduledFor) : new Date(Date.now() + 7200000)) : null,
      pricing: {
        baseAmount,
        emergencySurcharge,
        platformFee,
        cooperativeReserve,
        workerPayout,
        totalAmount
      },
      timestamps: {
        createdAt: new Date(),
        searchingStartedAt: new Date()
      }
    });

    await BookingEvent.create({
      bookingId: booking._id,
      fromStatus: 'DRAFT',
      toStatus: 'SEARCHING',
      actorId: req.user.id,
      actorRole: 'CUSTOMER',
      reason: `Customer requested ${bookingType} service booking.`
    });

    // Notify Admin live feed via Socket.IO
    const io = getSocketIO();
    if (io) {
      io.to('admin').emit('booking:created', {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        bookingType: booking.bookingType,
        serviceName: service.name,
        coordinates: customerLocation,
        addressText,
        totalAmount
      });
    }

    // Kick off Allocation Engine in background
    setImmediate(() => {
      runAllocation(booking._id, { triggerReason: 'INITIAL_SEARCH' }).catch(err => {
        console.error(`[AllocationEngine] Async run error:`, err);
      });
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created and allocation initiated.',
      data: booking
    });
  } catch (err) {
    console.error('[CustomerController] createBooking error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getBookingDetails(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId')
      .populate({
        path: 'assignedWorkerId',
        populate: [{ path: 'userId' }, { path: 'cooperativeId' }]
      })
      .populate('currentOfferId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    let invoice = null;
    if (['COMPLETED', 'PAID'].includes(booking.status)) {
      invoice = await Invoice.findOne({ bookingId: booking._id });
    }

    return res.status(200).json({
      success: true,
      data: {
        booking,
        invoice
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getActiveBooking(req, res) {
  try {
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer) {
      return res.status(200).json({ success: true, data: null });
    }

    const activeBooking = await Booking.findOne({
      customerId: customer._id,
      status: { $nin: ['COMPLETED', 'PAID', 'CANCELLED'] }
    })
      .sort({ createdAt: -1 })
      .populate('serviceId')
      .populate({
        path: 'assignedWorkerId',
        populate: [{ path: 'userId' }]
      });

    return res.status(200).json({ success: true, data: activeBooking });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getBookingHistory(req, res) {
  try {
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer) {
      return res.status(200).json({ success: true, data: [] });
    }

    const bookings = await Booking.find({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .populate('serviceId')
      .populate('assignedWorkerId');

    return res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function processDemoPayment(req, res) {
  try {
    const { bookingId, paymentMethod = 'DEMO_UPI' } = req.body;
    const invoice = await Invoice.findOne({ bookingId });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    invoice.status = 'PAID';
    invoice.paidAt = new Date();
    await invoice.save();

    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status: 'PAID',
      'timestamps.paidAt': new Date()
    }, { new: true });

    const demoTxnId = `UPI-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await Payment.create({
      invoiceId: invoice._id,
      bookingId,
      customerId: invoice.customerId,
      paymentMethod,
      demoTransactionId: demoTxnId,
      amount: invoice.breakdown.totalAmount,
      status: 'SUCCESS'
    });

    await BookingEvent.create({
      bookingId,
      fromStatus: 'COMPLETED',
      toStatus: 'PAID',
      actorId: req.user.id,
      actorRole: 'CUSTOMER',
      reason: `Customer completed demo payment of ₹${invoice.breakdown.totalAmount} via ${paymentMethod}.`
    });

    const io = getSocketIO();
    if (io) {
      io.to(`booking:${bookingId}`).emit('payment:confirmed', {
        bookingId,
        invoiceId: invoice._id,
        amount: invoice.breakdown.totalAmount,
        demoTxnId
      });
      io.to(`worker:${invoice.workerId}`).emit('payment:confirmed', {
        bookingId,
        amountCredited: invoice.breakdown.workerPayout
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully.',
      data: { invoice, payment, booking }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function submitRating(req, res) {
  try {
    const { bookingId, rating, reviewTags = [], feedbackText = '' } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking || !booking.assignedWorkerId) {
      return res.status(400).json({ success: false, message: 'Invalid booking for rating.' });
    }

    const ratingDoc = await Rating.create({
      bookingId,
      customerId: booking.customerId,
      workerId: booking.assignedWorkerId,
      rating: Math.min(5, Math.max(1, Number(rating))),
      reviewTags,
      feedbackText
    });

    // Update Worker average rating
    const allRatings = await Rating.find({ workerId: booking.assignedWorkerId });
    const avg = allRatings.reduce((acc, r) => acc + r.rating, 0) / allRatings.length;

    await Worker.findByIdAndUpdate(booking.assignedWorkerId, {
      rating: {
        average: Math.round(avg * 10) / 10,
        count: allRatings.length
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully.',
      data: ratingDoc
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
