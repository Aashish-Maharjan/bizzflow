const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  basicSalary: {
    type: Number,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  allowances: {
    type: Number,
    default: 0
  },
  deductions: {
    type: Number,
    default: 0
  },
  bonus: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paidDate: {
    type: Date
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate net salary before saving
PayrollSchema.pre('save', function(next) {
  this.netSalary = this.basicSalary + (this.allowances || 0) + (this.bonus || 0) - (this.deductions || 0);
  next();
});

// Add index for better query performance
PayrollSchema.index({ employee: 1, month: 1, year: 1 });

module.exports = mongoose.model('Payroll', PayrollSchema); 