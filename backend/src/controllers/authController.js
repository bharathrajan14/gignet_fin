import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Worker from '../models/Worker.js';
import Customer from '../models/Customer.js';
import Cooperative from '../models/Cooperative.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gignet_sih26089_jwt_secret_dev_key_change_in_prod';
const DEMO_OTP = process.env.DEMO_OTP_CODE || '123456';

export async function requestDemoOtp(req, res) {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: 'Phone number is required.' });
  }

  // Realistic response simulating SMS delivery
  return res.status(200).json({
    success: true,
    message: `Demo OTP sent successfully. Use code: ${DEMO_OTP}`,
    simulatedCodeHint: DEMO_OTP,
    provider: 'GIGNET_DEMO_SMS_ADAPTER (Twilio/MSG91 pluggable)'
  });
}

export async function verifyDemoOtp(req, res) {
  const { phoneNumber, otpCode, role = 'CUSTOMER', fullName = 'Demo User' } = req.body;

  if (otpCode !== DEMO_OTP) {
    return res.status(400).json({ success: false, message: 'Invalid OTP code. Please use ' + DEMO_OTP });
  }

  try {
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      user = await User.create({
        phoneNumber,
        role,
        isActive: true
      });

      await Profile.create({
        userId: user._id,
        fullName
      });

      if (role === 'CUSTOMER') {
        await Customer.create({ userId: user._id });
      } else if (role === 'WORKER') {
        const coop = await Cooperative.findOne();
        await Worker.create({
          userId: user._id,
          cooperativeId: coop?._id,
          badgeNumber: `W-${Math.floor(1000 + Math.random() * 9000)}`,
          kycStatus: 'VERIFIED',
          isOnline: true
        });
      }
    }

    const profile = await Profile.findOne({ userId: user._id });
    let workerId = null;
    let customerId = null;
    let cooperativeId = null;

    if (user.role === 'WORKER') {
      const worker = await Worker.findOne({ userId: user._id });
      workerId = worker?._id;
      cooperativeId = worker?.cooperativeId;
    } else if (user.role === 'CUSTOMER') {
      const customer = await Customer.findOne({ userId: user._id });
      customerId = customer?._id;
    }

    const token = jwt.sign({
      id: user._id,
      role: user.role,
      phoneNumber: user.phoneNumber,
      workerId,
      customerId,
      cooperativeId
    }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        role: user.role,
        phoneNumber: user.phoneNumber,
        fullName: profile?.fullName || 'User',
        workerId,
        customerId,
        cooperativeId
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Demo Persona Switcher
 * Instantly provides a session token for:
 * - 'customer': Standard customer (Asha)
 * - 'worker-suresh': Balanced plumber (Suresh, 2 jobs done, high rating)
 * - 'worker-ramesh': Overloaded plumber (Ramesh, 8 jobs done, closer distance)
 * - 'worker-ravi': Worker with 10am confirmed booking (for Ravi/Kumar slack demo)
 * - 'admin': Cooperative Admin (Koramangala Society)
 * - 'federation': Federation Admin (Bangalore Central)
 */
export async function getWorkerPersonas(req, res) {
  try {
    const workers = await Worker.find()
      .populate('userId')
      .populate('cooperativeId');

    const personas = workers.map((w) => {
      let trade = 'General Utility';
      if (w.skills?.some((s) => s.includes('PLUMB'))) trade = 'Plumbing';
      else if (w.skills?.some((s) => s.includes('ELEC'))) trade = 'Electrical';
      else if (w.skills?.some((s) => s.includes('HVAC') || s.includes('APPLIANCE'))) trade = 'Appliance & HVAC';
      else if (w.skills?.some((s) => s.includes('CARPENT'))) trade = 'Carpentry';
      else if (w.skills?.some((s) => s.includes('CLEAN'))) trade = 'Cleaning';
      else if (w.skills?.some((s) => s.includes('PIPE') || s.includes('MASON'))) trade = 'Masonry & Waterproofing';

      return {
        id: w._id,
        badgeNumber: w.badgeNumber,
        fullName: w.userId?.email?.split('@')[0]?.replace('.', ' ')?.toUpperCase() || 'TECHNICIAN',
        trade,
        skills: w.skills,
        cooperativeName: w.cooperativeId?.name || 'Bengaluru Cooperative',
        workloadStatus: w.fairnessMetrics?.workloadStatus || 'BALANCED',
        rating: w.rating?.average || 4.8
      };
    });

    return res.status(200).json({ success: true, data: personas });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function switchDemoPersona(req, res) {
  const { persona } = req.body;

  try {
    let targetUser = null;

    if (persona === 'customer') {
      targetUser = await User.findOne({ role: 'CUSTOMER' });
    } else if (persona.startsWith('WRK-') || persona.startsWith('worker-') || mongoose.Types.ObjectId.isValid(persona)) {
      // Direct badge, slug or worker ID lookup
      let badge = persona;
      const badgeMap = {
        'worker-suresh': 'WRK-BLR-101',
        'worker-ramesh': 'WRK-BLR-102',
        'worker-ravi': 'WRK-BLR-103',
        'worker-priya': 'WRK-BLR-104',
        'worker-ananya': 'WRK-BLR-105',
        'worker-manoj': 'WRK-BLR-106',
        'worker-deepa': 'WRK-BLR-107',
        'worker-karthik': 'WRK-BLR-108',
        'worker-rajeshwari': 'WRK-BLR-109'
      };

      if (badgeMap[persona]) {
        badge = badgeMap[persona];
      }

      let worker = await Worker.findOne({ badgeNumber: badge });
      if (!worker && mongoose.Types.ObjectId.isValid(persona)) {
        worker = await Worker.findById(persona).catch(() => null);
      }
      if (worker) {
        targetUser = await User.findById(worker.userId);
      }
      if (!targetUser) {
        targetUser = await User.findOne({ role: 'WORKER' });
      }
    } else if (persona === 'admin') {
      targetUser = await User.findOne({ role: 'COOPERATIVE_ADMIN' }) || await User.findOne({ role: 'SYSTEM_ADMIN' });
    } else if (persona === 'federation') {
      targetUser = await User.findOne({ role: 'FEDERATION_ADMIN' }) || await User.findOne({ role: 'SYSTEM_ADMIN' });
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, message: `Persona '${persona}' not found in database. Run seed script.` });
    }

    const profile = await Profile.findOne({ userId: targetUser._id });
    const worker = await Worker.findOne({ userId: targetUser._id });
    const customer = await Customer.findOne({ userId: targetUser._id });

    const token = jwt.sign({
      id: targetUser._id,
      role: targetUser.role,
      email: targetUser.email,
      phoneNumber: targetUser.phoneNumber,
      workerId: worker?._id,
      customerId: customer?._id,
      cooperativeId: worker?.cooperativeId
    }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: targetUser._id,
        role: targetUser.role,
        fullName: profile?.fullName || 'User',
        badgeNumber: worker?.badgeNumber,
        workerId: worker?._id,
        customerId: customer?._id,
        cooperativeId: worker?.cooperativeId
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);
    const profile = await Profile.findOne({ userId: req.user.id });
    const worker = await Worker.findOne({ userId: req.user.id }).populate('cooperativeId');
    const customer = await Customer.findOne({ userId: req.user.id });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        phoneNumber: user.phoneNumber,
        fullName: profile?.fullName,
        avatarUrl: profile?.avatarUrl,
        worker,
        customer
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
