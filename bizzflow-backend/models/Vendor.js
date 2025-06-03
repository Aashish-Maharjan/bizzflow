const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  registrationType: {
    type: String,
    enum: ['pan', 'vat'],
    default: 'pan'
  },
  panNumber: {
    type: String,
    required: function() {
      return this.registrationType === 'pan';
    },
    trim: true
  },
  vatNumber: {
    type: String,
    required: function() {
      return this.registrationType === 'vat';
    },
    trim: true
  },
  category: {
    type: String,
    enum: ['supplier', 'manufacturer', 'distributor', 'service-provider'],
    default: 'supplier'
  },
  bankDetails: {
    accountName: {
      type: String,
      required: true,
      trim: true
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true
    },
    bankName: {
      type: String,
      required: true,
      trim: true
    },
    branch: {
      type: String,
      required: true,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
vendorSchema.index({ name: 1, email: 1 });
vendorSchema.index({ panNumber: 1 }, { unique: true, sparse: true });
vendorSchema.index({ vatNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Vendor', vendorSchema); 