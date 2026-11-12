import mongoose from 'mongoose';

const marketplaceMessageSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceListing', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

marketplaceMessageSchema.index({ listing: 1 });

const MarketplaceMessage = mongoose.model('MarketplaceMessage', marketplaceMessageSchema);
export default MarketplaceMessage;
