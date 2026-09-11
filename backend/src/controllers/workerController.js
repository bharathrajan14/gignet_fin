import Worker from '../models/Worker.js';
import WorkerLocation from '../models/WorkerLocation.js';
import WorkerOffer from '../models/WorkerOffer.js';
import Booking from '../models/Booking.js';
import BookingEvent from '../models/BookingEvent.js';
import Invoice from '../models/Invoice.js';
import { handleOfferResponse } from '../allocation/offerManager.js';
import { startSimulatedMovement, stopSimulatedMovement } from '../services/simulatedMovementService.js';
import { generateInvoiceForBooking } from '../services/invoiceService.js';
import { getSocketIO } from '../services/socketService.js';
import { toH3 } from '../utils/geoUtils.js';

export async function getProfile(req, res) {
  try {
    const worker = await Worker.findOne({ userId: req.user.id })
      .populate('userId')
      .populate('cooperativeId');

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    const location = await WorkerLocation.findOne({ workerId: worker._id });

    return res.status(200).json({
      success: true,
      data: {
        worker,
        location: location?.location?.coordinates || null,
        isSimulated: location?.isSimulated || false
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function toggleOnline(req, res) {
  try {
    const worker = await Worker.findOne({ userId: req.user.id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

    worker.isOnline = !worker.isOnline;
    await worker.save();

    await WorkerLocation.findOneAndUpdate(
      { workerId: worker._id },
      { isOnline: worker.isOnline },
      { upsert: true }
    );

    const io = getSocketIO();
    if (io) {
      io.to('admin').emit('worker:status_change', {
        workerId: worker._id,
        isOnline: worker.isOnline
      });
    }

    return res.status(200).json({
      success: true,
      message: `Worker is now ${worker.isOnline ? 'ONLINE' : 'OFFLINE'}`,
      isOnline: worker.isOnline
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateLocation(req, res) {
  try {
    const { longitude, latitude, heading = 0, speed = 0 } = req.body;
    const worker = await Worker.findOne({ userId: req.user.id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

    const h3Res7 = toH3(latitude, longitude, 7);
    const h3Res8 = toH3(latitude, longitude, 8);

    const loc = await WorkerLocation.findOneAndUpdate(
      { workerId: worker._id },
      {
        location: { type: 'Point', coordinates: [longitude, latitude] },
        h3Res7,
        h3Res8,
        heading,
        speed,
        isOnline: worker.isOnline,
        isSimulated: false,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, data: loc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getPendingOffers(req, res) {
  try {
    const worker = await Worker.findOne({ userId: req.user.id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

    const now = new Date();
    const offer = await WorkerOffer.findOne({
      workerId: worker._id,
      offerStatus: 'PENDING',
      expiresAt: { $gt: now }
    }).populate('bookingId');

    if (!offer) {
      return res.status(200).json({ success: true, data: null });
    }

    const remainingSeconds = Math.max(0, Math.round((new Date(offer.expiresAt).getTime() - now.getTime()) / 1000));

    return res.status(200).json({
      success: true,
      data: {
        offer: {
          ...offer.toObject(),
          assignedWorkerBadge: worker.badgeNumber || null
        },
        remainingSeconds
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function respondToOffer(req, res) {
  try {
    const { offerId } = req.params;
    const { isAccepted, rejectReason = '' } = req.body;

    const worker = await Worker.findOne({ userId: req.user.id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

    const result = await handleOfferResponse({
      offerId,
      workerId: worker._id,
      isAccepted: !!isAccepted,
      rejectReason
    });

    return res.status(200).json({
      success: true,
      message: isAccepted ? 'Offer accepted! Job confirmed.' : 'Offer rejected.',
      data: result
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function getActiveJob(req, res) {
  try {
    const worker = await Worker.findOne({ userId: req.user.id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

    const booking = await Booking.findOne({
      assignedWorkerId: worker._id,
      status: { $in: ['CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'] }
    })
      .populate('serviceId')
      .populate({
        path: 'customerId',
        populate: { path: 'userId' }
      });

    return res.status(200).json({ success: true, data: booking });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function advanceJobStatus(req, res) {
  try {
    const { id: bookingId } = req.params;
    const { nextStatus } = req.body;

    const worker = await Worker.findOne({ userId: req.user.id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

    const booking = await Booking.findOne({ _id: bookingId, assignedWorkerId: worker._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Active booking not found for this worker.' });

    const allowedNext = {
      CONFIRMED: ['ON_THE_WAY', 'CANCELLED'],
      ON_THE_WAY: ['ARRIVED', 'CANCELLED'],
      ARRIVED: ['IN_PROGRESS'],
      IN_PROGRESS: ['COMPLETED']
    };

    if (!allowedNext[booking.status] || !allowedNext[booking.status].includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid state transition from ${booking.status} to ${nextStatus}. Allowed: [${(allowedNext[booking.status] || []).join(', ')}]`
      });
    }

    const previousStatus = booking.status;
    booking.status = nextStatus;

    if (nextStatus === 'ON_THE_WAY') {
      booking.timestamps.onTheWayAt = new Date();
      // Start simulated movement for demo purposes if enabled
      const workerLoc = await WorkerLocation.findOne({ workerId: worker._id });
      const originCoords = workerLoc?.location?.coordinates || [77.6200, 12.9300];
      startSimulatedMovement({
        bookingId: booking._id,
        workerId: worker._id,
        originCoords,
        destinationCoords: booking.customerLocation.coordinates
      });
    } else if (nextStatus === 'ARRIVED') {
      booking.timestamps.arrivedAt = new Date();
      stopSimulatedMovement(booking._id);
    } else if (nextStatus === 'IN_PROGRESS') {
      booking.timestamps.startedAt = new Date();
    } else if (nextStatus === 'COMPLETED') {
      booking.timestamps.completedAt = new Date();
      // Generate itemized invoice and release worker lock
      await generateInvoiceForBooking(booking._id);
      await Worker.findByIdAndUpdate(worker._id, {
        isAvailable: true,
        activeBookingId: null
      });
    }

    await booking.save();

    await BookingEvent.create({
      bookingId: booking._id,
      fromStatus: previousStatus,
      toStatus: nextStatus,
      actorId: req.user.id,
      actorRole: 'WORKER',
      reason: `Worker advanced job status to ${nextStatus}`
    });

    const io = getSocketIO();
    if (io) {
      io.to(`booking:${booking._id}`).emit('booking:status_update', {
        bookingId: booking._id,
        status: nextStatus
      });
      io.to(`user:${booking.customerId}`).emit('booking:status_update', {
        bookingId: booking._id,
        status: nextStatus
      });
      io.to('admin').emit('booking:status_update', {
        bookingId: booking._id,
        status: nextStatus
      });
    }

    return res.status(200).json({
      success: true,
      message: `Job status advanced to ${nextStatus}`,
      data: booking
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getEarnings(req, res) {
  try {
    const worker = await Worker.findOne({ userId: req.user.id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

    return res.status(200).json({
      success: true,
      data: {
        totalEarnings: worker.fairnessMetrics.totalEarnings,
        weeklyEarnings: worker.fairnessMetrics.weeklyEarnings,
        completedJobsCount: worker.fairnessMetrics.completedJobsCount,
        emergencyJobsCount: worker.fairnessMetrics.emergencyJobsCount,
        scheduledJobsCount: worker.fairnessMetrics.scheduledJobsCount,
        workloadStatus: worker.fairnessMetrics.workloadStatus,
        rating: worker.rating
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function uploadKyc(req, res) {
  try {
    const { docType, documentNumber, fileUrl, isScanned = true } = req.body;
    const worker = await Worker.findOne({ userId: req.user.id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

    worker.kycDocuments.push({
      docType,
      documentNumber,
      fileUrl: fileUrl || 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=400&q=80',
      isScanned: !!isScanned,
      scannedAt: new Date(),
      verifiedAt: null
    });
    worker.kycStatus = 'PENDING';
    await worker.save();

    const io = getSocketIO();
    if (io) {
      io.to('admin').emit('admin:kyc_submitted', {
        workerId: worker._id,
        badgeNumber: worker.badgeNumber,
        docType,
        fileUrl
      });
      io.emit('admin:workers_updated');
    }

    return res.status(200).json({
      success: true,
      message: 'KYC document submitted for cooperative verification.',
      data: worker
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function completeJobWithParts(req, res) {
  try {
    const { id: bookingId } = req.params;
    const { parts = [] } = req.body;

    const worker = await Worker.findOne({ userId: req.user.id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

    const booking = await Booking.findOne({ _id: bookingId, assignedWorkerId: worker._id })
      .populate('serviceId')
      .populate('customerId');
    if (!booking) return res.status(404).json({ success: false, message: 'Active booking not found for this worker.' });

    // Calculate parts total
    const formattedParts = parts.map(p => ({
      name: p.name || 'Spare Part',
      quantity: Number(p.quantity) || 1,
      unitCost: Number(p.unitCost) || 0,
      total: (Number(p.quantity) || 1) * (Number(p.unitCost) || 0)
    }));
    const partsTotal = formattedParts.reduce((sum, item) => sum + item.total, 0);

    const baseAmount = booking.pricing?.baseAmount || booking.serviceId?.basePrice || 350;
    const emergencySurcharge = booking.pricing?.emergencySurcharge || 0;
    const welfareFund = 15;
    
    // Total calculation
    const laborTotal = baseAmount + emergencySurcharge;
    const finalTotalAmount = laborTotal + partsTotal + welfareFund;

    // Financial distribution:
    // Worker gets: 80% labor + 100% parts reimbursement
    const workerLaborShare = Math.round(laborTotal * 0.80);
    const workerPayout = workerLaborShare + partsTotal;

    // Cooperative Reserve: 15% labor + ₹15 welfare fund
    const cooperativeReserve = Math.round(laborTotal * 0.15) + welfareFund;

    // Platform fee: 5% labor
    const platformCut = Math.round(laborTotal * 0.05);

    // Stop simulated movement if any
    stopSimulatedMovement(booking._id);

    // Update booking
    booking.status = 'COMPLETED';
    booking.partsUsed = formattedParts;
    booking.pricing = {
      baseAmount,
      emergencySurcharge,
      materialsCost: partsTotal,
      workerPayout,
      cooperativeReserve,
      platformFee: platformCut,
      totalAmount: finalTotalAmount
    };
    booking.timestamps.completedAt = new Date();
    await booking.save();

    // Release worker availability & update completed job count
    worker.isAvailable = true;
    worker.activeBookingId = null;
    worker.fairnessMetrics.completedJobsCount = (worker.fairnessMetrics.completedJobsCount || 0) + 1;
    worker.fairnessMetrics.totalEarnings = (worker.fairnessMetrics.totalEarnings || 0) + workerPayout;
    worker.fairnessMetrics.weeklyEarnings = (worker.fairnessMetrics.weeklyEarnings || 0) + workerPayout;
    await worker.save();

    // Create or update Invoice
    let invoice = await Invoice.findOne({ bookingId: booking._id });
    if (!invoice) {
      invoice = new Invoice({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        bookingId: booking._id,
        customerId: booking.customerId._id || booking.customerId,
        workerId: worker._id,
        cooperativeId: booking.cooperativeId
      });
    }

    invoice.status = 'UNPAID';
    invoice.parts = formattedParts;
    invoice.breakdown = {
      serviceAmount: baseAmount,
      emergencySurcharge,
      partsTotal,
      welfareFundFee: welfareFund,
      workerPayout,
      cooperativeReserve,
      infrastructureCut: platformCut,
      totalAmount: finalTotalAmount
    };
    invoice.issuedAt = new Date();
    await invoice.save();

    // Booking Event
    await BookingEvent.create({
      bookingId: booking._id,
      fromStatus: 'IN_PROGRESS',
      toStatus: 'COMPLETED',
      actorId: worker.userId,
      actorRole: 'WORKER',
      reason: `Worker generated official bill with ${formattedParts.length} parts and marked completed.`
    });

    const io = getSocketIO();
    if (io) {
      // Notify customer room & booking room
      io.to(`booking:${booking._id}`).emit('booking:status_update', {
        bookingId: booking._id,
        status: 'COMPLETED',
        invoice,
        partsUsed: formattedParts
      });
      io.to(`booking:${booking._id}`).emit('invoice:generated', {
        bookingId: booking._id,
        invoice
      });

      const customerUserId = booking.customerId?.userId || booking.customerId;
      if (customerUserId) {
        io.to(`user:${customerUserId}`).emit('booking:status_update', {
          bookingId: booking._id,
          status: 'COMPLETED',
          invoice
        });
        io.to(`user:${customerUserId}`).emit('notification:new', {
          title: 'Official Bill Generated by Technician',
          message: `Your service is complete. Total amount due is ₹${finalTotalAmount}. Please review and pay.`,
          type: 'INVOICE'
        });
      }

      // Broadcast update
      io.emit('booking:status_update', {
        bookingId: booking._id,
        status: 'COMPLETED',
        invoice
      });

      // Notify admin
      io.to('admin').emit('admin:job_completed', {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        workerBadge: worker.badgeNumber,
        partsTotal,
        totalAmount: finalTotalAmount
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job completed! Itemized invoice generated successfully.',
      data: {
        booking,
        invoice
      }
    });
  } catch (err) {
    console.error('[WorkerController] completeJobWithParts error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
