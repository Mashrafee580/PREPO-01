import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
      qty: { type: Number, default: 1, min: 1 },
      price: { type: Number, required: true },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

// user field already has a unique index from the schema definition — no duplicate needed

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
