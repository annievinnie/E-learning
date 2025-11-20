import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    merchandise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchandise',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  stripeSessionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentIntentId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

orderSchema.index({ student: 1, createdAt: -1 });
// stripeSessionId already has unique: true in the schema definition above

const Order = mongoose.model('Order', orderSchema);

export default Order;

