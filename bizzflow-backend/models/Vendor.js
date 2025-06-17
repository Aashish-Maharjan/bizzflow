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
    default: 'pan',
    required: true
  },
  panNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (this.registrationType === 'pan') {
          return v && v.trim().length > 0;
        }
        return true;
      },
      message: 'PAN number is required when registration type is PAN'
    }
  },
  vatNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (this.registrationType === 'vat') {
          return v && v.trim().length > 0;
        }
        return true;
      },
      message: 'VAT number is required when registration type is VAT'
    }
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

// Basic indexes
vendorSchema.index({ name: 1 });
vendorSchema.index({ email: 1 }, { unique: true });
vendorSchema.index({ status: 1 });

// Registration number indexes with partial filter expressions
vendorSchema.index(
  { panNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      registrationType: "pan",
      panNumber: { $exists: true, $type: "string" }
    }
  }
);

vendorSchema.index(
  { vatNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      registrationType: "vat",
      vatNumber: { $exists: true, $type: "string" }
    }
  }
);

// Pre-save middleware
vendorSchema.pre('save', async function(next) {
  try {
    // Handle registration numbers based on type
    if (this.registrationType === 'pan') {
      this.vatNumber = null;  // Use null instead of empty string
      if (!this.panNumber || !this.panNumber.trim()) {
        throw new Error('PAN number is required when registration type is PAN');
      }
    } else if (this.registrationType === 'vat') {
      this.panNumber = null;  // Use null instead of empty string
      if (!this.vatNumber || !this.vatNumber.trim()) {
        throw new Error('VAT number is required when registration type is VAT');
      }
    }

    // Trim all string fields
    if (this.isModified('name')) this.name = this.name.trim();
    if (this.isModified('email')) this.email = this.email.trim().toLowerCase();
    if (this.isModified('phone')) this.phone = this.phone.trim();
    if (this.isModified('address')) this.address = this.address.trim();
    if (this.isModified('panNumber') && this.panNumber) this.panNumber = this.panNumber.trim();
    if (this.isModified('vatNumber') && this.vatNumber) this.vatNumber = this.vatNumber.trim();
    
    // Trim bank details
    if (this.isModified('bankDetails.accountName')) this.bankDetails.accountName = this.bankDetails.accountName.trim();
    if (this.isModified('bankDetails.accountNumber')) this.bankDetails.accountNumber = this.bankDetails.accountNumber.trim();
    if (this.isModified('bankDetails.bankName')) this.bankDetails.bankName = this.bankDetails.bankName.trim();
    if (this.isModified('bankDetails.branch')) this.bankDetails.branch = this.bankDetails.branch.trim();

    next();
  } catch (error) {
    next(error);
  }
});

// Methods
vendorSchema.methods.softDelete = async function(userId) {
  this.status = 'deleted';
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
};

vendorSchema.methods.restore = async function() {
  this.status = 'active';
  this.deletedAt = null;
  this.deletedBy = null;
  await this.save();
};

module.exports = mongoose.model('Vendor', vendorSchema); 