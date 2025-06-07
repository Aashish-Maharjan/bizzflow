const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    time: Date,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: undefined
      }
    }
  },
  checkOut: {
    time: Date,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: undefined
      }
    }
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'late', 'leave'],
    default: 'absent'
  },
  workHours: {
    type: Number,
    default: 0
  },
  overtime: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  leaveType: {
    type: String,
    enum: ['sick', 'vacation', 'personal', 'unpaid', null],
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Method to calculate work hours
attendanceSchema.methods.calculateWorkHours = function() {
  if (this.checkIn?.time && this.checkOut?.time) {
    const duration = this.checkOut.time - this.checkIn.time;
    this.workHours = Math.round((duration / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
    
    // Calculate overtime (assuming 8-hour workday)
    if (this.workHours > 8) {
      this.overtime = Math.round((this.workHours - 8) * 100) / 100;
    }
  }
};

// Pre-save middleware to calculate work hours
attendanceSchema.pre('save', function(next) {
  this.calculateWorkHours();
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema); 