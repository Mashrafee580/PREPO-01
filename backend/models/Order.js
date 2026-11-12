import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: [
    {
      book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: null },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      qty: { type: Number, required: true, default: 1 },
      coverUrl: { type: String, default: '' },
    },
  ],
  shipping: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: 'BD' },
  },
  delivery: {
    type: { type: String, enum: ['standard', 'express', 'overnight', 'free'], default: 'standard' },
    cost: { type: Number, default: 3.99 },
  },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: { type: String, default: 'mock' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'paid' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.orderNumber = `PT-${year}-${rand}`;
  }
  this.updatedAt = new Date();
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
