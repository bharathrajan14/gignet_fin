import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Customer from '../models/Customer.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gignet_sih26089_jwt_secret_dev_key_change_in_prod';

/**
 * Authentication Middleware
 * Decodes session JWT or handles simulated demo user contexts seamlessly.
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      // Check for Demo header for quick developer/judge testing
      const demoRole = req.headers['x-demo-role'];
      if (demoRole) {
        const demoUser = await User.findOne({ role: demoRole, isActive: true });
        if (demoUser) {
          req.user = {
            id: demoUser._id,
            role: demoUser.role,
            email: demoUser.email,
            phoneNumber: demoUser.phoneNumber
          };
          if (demoUser.role === 'WORKER') {
            const worker = await Worker.findOne({ userId: demoUser._id });
            req.user.workerId = worker?._id;
            req.user.cooperativeId = worker?.cooperativeId;
          } else if (demoUser.role === 'CUSTOMER') {
            const customer = await Customer.findOne({ userId: demoUser._id });
            req.user.customerId = customer?._id;
          }
          return next();
        }
      }
      return res.status(401).json({ success: false, message: 'Authentication required. Missing Bearer token.' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive user account.' });
    }

    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      phoneNumber: user.phoneNumber,
      ...decoded
    };

    if (user.role === 'WORKER' && !req.user.workerId) {
      const worker = await Worker.findOne({ userId: user._id });
      req.user.workerId = worker?._id;
      req.user.cooperativeId = worker?.cooperativeId;
    } else if (user.role === 'CUSTOMER' && !req.user.customerId) {
      const customer = await Customer.findOne({ userId: user._id });
      req.user.customerId = customer?._id;
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token verification failed: ' + err.message });
  }
}
