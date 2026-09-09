import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  fullName: { type: String, required: true, trim: true },
  avatarUrl: { type: String, default: '' },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
    state: { type: String, default: '' }
  },
  preferredLanguage: { type: String, default: 'en' }
}, {
  timestamps: true
});

export default mongoose.model('Profile', ProfileSchema);
