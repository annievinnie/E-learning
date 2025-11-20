import mongoose from 'mongoose';

const merchandiseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    default: 'General'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

merchandiseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Merchandise = mongoose.model('Merchandise', merchandiseSchema);

export default Merchandise;

