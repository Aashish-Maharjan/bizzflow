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
    enum: ['active', 'inactive', 'blacklisted', 'deleted'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
vendorSchema.index({ name: 1, email: 1 });
vendorSchema.index({ panNumber: 1 }, { unique: true, sparse: true });
vendorSchema.index({ vatNumber: 1 }, { unique: true, sparse: true });

// Add a method to soft delete
vendorSchema.methods.softDelete = async function(userId) {
  this.status = 'deleted';
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
};

// Add a method to restore
vendorSchema.methods.restore = async function() {
  this.status = 'active';
  this.deletedAt = null;
  this.deletedBy = null;
  await this.save();
};

module.exports = mongoose.model('Vendor', vendorSchema); 