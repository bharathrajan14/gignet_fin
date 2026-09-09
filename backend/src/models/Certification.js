import mongoose from 'mongoose';

const CertificationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  issuingBody: { type: String, required: true },
  category: {
    type: String,
    enum: ['PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'APPLIANCE', 'CLEANING', 'MASONRY'],
    required: true
  },
  validityYears: { type: Number, default: 3 }
}, {
  timestamps: true
});

export default mongoose.model('Certification', CertificationSchema);
