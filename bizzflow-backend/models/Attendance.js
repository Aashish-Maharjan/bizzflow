const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    time: Date,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    }
  },
  checkOut: {
    time: Date,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    }
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'leave'],
    default: 'present'
  },
  workHours: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for querying attendance by date range
attendanceSchema.index({ user: 1, date: 1 });

// Method to calculate work hours
attendanceSchema.methods.calculateWorkHours = function() {
  if (this.checkIn?.time && this.checkOut?.time) {
    const hours = (this.checkOut.time - this.checkIn.time) / (1000 * 60 * 60);
    this.workHours = Math.round(hours * 100) / 100;
  }
};

// Middleware to calculate work hours before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkIn?.time && this.checkOut?.time) {
    this.calculateWorkHours();
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema); 