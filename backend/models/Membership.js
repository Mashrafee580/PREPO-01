import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan: { type: String, enum: ['free', 'premium', 'ultimate'], required: true },
  price: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
  paymentMethod: { type: String, default: 'mock' },
  createdAt: { type: Date, default: Date.now },
});

// user field already has a unique index from schema definition — no duplicate needed

const Membership = mongoose.model('Membership', membershipSchema);
export default Membership;
