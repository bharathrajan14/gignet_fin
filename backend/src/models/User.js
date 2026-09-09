import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, unique: true, sparse: true, index: true },
  email: { type: String, lowercase: true, trim: true, sparse: true },
  phoneNumber: { type: String, trim: true, sparse: true, index: true },
  role: {
    type: String,
    enum: ['CUSTOMER', 'WORKER', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN', 'SYSTEM_ADMIN'],
    default: 'CUSTOMER',
    required: true,
    index: true
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model('User', UserSchema);
