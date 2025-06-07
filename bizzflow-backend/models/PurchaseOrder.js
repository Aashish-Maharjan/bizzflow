const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      default: 'piece'
    },
    total: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed', 'deleted'],
    default: 'draft'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially-paid', 'paid'],
    default: 'unpaid'
  },
  paymentTerms: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  approvalHistory: [{
    status: {
      type: String,
      enum: ['approved', 'rejected', 'cancelled']
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  payments: [{
    amount: Number,
    method: {
      type: String,
      enum: ['cash', 'bank-transfer', 'cheque']
    },
    reference: String,
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
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

// Generate unique order number before saving
purchaseOrderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get the count of documents for the current month
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
      }
    });
    
    // Generate order number: PO-YY-MM-XXXX
    this.orderNumber = `PO-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Calculate totals before saving
purchaseOrderSchema.pre('save', function(next) {
  // Calculate item totals
  this.items.forEach(item => {
    item.total = item.quantity * item.unitPrice;
  });
  
  // Calculate order totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  this.total = this.subtotal + this.tax - this.discount;
  
  next();
});

// Add a method to soft delete
purchaseOrderSchema.methods.softDelete = async function(userId) {
  this.status = 'deleted';
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
};

// Add a method to restore
purchaseOrderSchema.methods.restore = async function() {
  this.status = 'draft';
  this.deletedAt = null;
  this.deletedBy = null;
  await this.save();
};

// Indexes for faster queries
purchaseOrderSchema.index({ orderNumber: 1 });
purchaseOrderSchema.index({ vendorId: 1, createdAt: -1 });
purchaseOrderSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema); 