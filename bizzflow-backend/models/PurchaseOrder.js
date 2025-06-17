const mongoose = require('mongoose');
const Counter = require('./Counter');

const purchaseOrderSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
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

// Auto-generate order number before saving
purchaseOrderSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      console.log('Generating order number for new purchase order...');
      const seq = await Counter.getNextSequence('purchaseOrder');
      console.log('Retrieved sequence number:', seq);
      this.orderNumber = `PO-${seq.toString().padStart(6, '0')}`;
      console.log('Generated order number:', this.orderNumber);
    }

    // Calculate totals
    if (this.items && this.items.length > 0) {
      console.log('Calculating item totals...');
      this.items.forEach(item => {
        item.total = Number(item.quantity) * Number(item.unitPrice);
      });
      
      // Calculate order totals
      this.subtotal = this.items.reduce((sum, item) => sum + (item.total || 0), 0);
      this.total = this.subtotal + (this.tax || 0) - (this.discount || 0);
      console.log('Calculated totals:', {
        subtotal: this.subtotal,
        tax: this.tax,
        discount: this.discount,
        total: this.total
      });
    }
    
    next();
  } catch (error) {
    console.error('Error in pre-save middleware:', {
      error: error.message,
      stack: error.stack,
      isNew: this.isNew,
      items: this.items,
      modelId: this._id
    });
    next(error);
  }
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