import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  category: {
    type: String,
    enum: ['PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'APPLIANCE', 'CLEANING', 'MASONRY'],
    required: true,
    index: true
  },
  description: { type: String, default: '' }
}, {
  timestamps: true
});

export default mongoose.model('Skill', SkillSchema);
