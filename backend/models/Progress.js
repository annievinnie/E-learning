import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completedModules: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastAccessedAt: {
    type: Date,
    default: Date.now
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

// Create compound index to ensure one progress record per student per course
progressSchema.index({ student: 1, course: 1 }, { unique: true });

// Update the updatedAt field before saving
progressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;

