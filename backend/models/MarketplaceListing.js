import mongoose from 'mongoose';

const marketplaceListingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'General' },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    required: true,
  },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: 0 },
  images: [{ type: String }],
  coverUrl: { type: String, default: '' },
  location: { type: String, default: '' },
  listingType: { type: String, enum: ['sell', 'buy'], required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  sellerName: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

marketplaceListingSchema.index({ status: 1 });
marketplaceListingSchema.index({ listingType: 1 });
marketplaceListingSchema.index({ category: 1 });
marketplaceListingSchema.index({ user: 1 });
marketplaceListingSchema.index({ title: 'text', author: 'text' });

marketplaceListingSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const MarketplaceListing = mongoose.model('MarketplaceListing', marketplaceListingSchema);
export default MarketplaceListing;
