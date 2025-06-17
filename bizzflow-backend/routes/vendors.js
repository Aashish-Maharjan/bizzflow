const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Vendor = require('../models/Vendor');
const PurchaseOrder = require('../models/PurchaseOrder');
const mongoose = require('mongoose');

// @route   GET /api/vendors
// @desc    Get all vendors
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching vendors...');
    console.log('User ID:', req.user.id);
    
    const vendors = await Vendor.find()
      .sort({ createdAt: -1 });
    
    console.log(`Found ${vendors.length} vendors`);
    res.json(vendors);
  } catch (err) {
    console.error('Error in fetching vendors:', {
      message: err.message,
      stack: err.stack,
      userId: req.user?.id
    });

    // Check if it's a MongoDB connection error
    if (err.name === 'MongooseError' || err.name === 'MongoError') {
      console.error('MongoDB Error Details:', {
        name: err.name,
        code: err.code,
        state: mongoose.connection.readyState
      });
    }

    res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   GET /api/vendors/:id
// @desc    Get vendor by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/vendors
// @desc    Create a vendor
// @access  Private
router.post('/', [
  auth,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Phone number is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('registrationType', 'Registration type must be either PAN or VAT').isIn(['pan', 'vat']),
    check('panNumber')
      .if((value, { req }) => req.body.registrationType === 'pan')
      .not()
      .isEmpty()
      .withMessage('PAN number is required when registration type is PAN'),
    check('vatNumber')
      .if((value, { req }) => req.body.registrationType === 'vat')
      .not()
      .isEmpty()
      .withMessage('VAT number is required when registration type is VAT'),
    check('bankDetails.accountName', 'Account name is required').not().isEmpty(),
    check('bankDetails.accountNumber', 'Account number is required').not().isEmpty(),
    check('bankDetails.bankName', 'Bank name is required').not().isEmpty(),
    check('bankDetails.branch', 'Branch name is required').not().isEmpty()
  ]
], async (req, res) => {
  try {
    console.log('Creating new vendor...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if vendor with same email exists
    let existingVendor = await Vendor.findOne({ email: req.body.email });
    if (existingVendor) {
      console.log('Vendor with email already exists:', req.body.email);
      return res.status(400).json({ message: 'Vendor with this email already exists' });
    }

    // Check for duplicate registration numbers
    const query = {};
    if (req.body.registrationType === 'pan' && req.body.panNumber) {
      query.panNumber = req.body.panNumber;
      query.registrationType = 'pan';
    } else if (req.body.registrationType === 'vat' && req.body.vatNumber) {
      query.vatNumber = req.body.vatNumber;
      query.registrationType = 'vat';
    }

    existingVendor = await Vendor.findOne(query);
    if (existingVendor) {
      const regType = req.body.registrationType.toUpperCase();
      console.log(`${regType} number already registered:`, req.body[`${req.body.registrationType}Number`]);
      return res.status(400).json({ message: `${regType} number already registered` });
    }

    // Create new vendor with only the required registration number
    const vendorData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      registrationType: req.body.registrationType,
      category: req.body.category || 'supplier',
      bankDetails: {
        accountName: req.body.bankDetails.accountName,
        accountNumber: req.body.bankDetails.accountNumber,
        bankName: req.body.bankDetails.bankName,
        branch: req.body.bankDetails.branch
      },
      status: 'active',
      createdBy: req.user.id
    };

    // Add only the relevant registration number
    if (req.body.registrationType === 'pan') {
      vendorData.panNumber = req.body.panNumber;
      vendorData.vatNumber = null;
    } else {
      vendorData.vatNumber = req.body.vatNumber;
      vendorData.panNumber = null;
    }

    const vendor = new Vendor(vendorData);

    console.log('Saving vendor...');
    await vendor.save();
    console.log('Vendor created successfully:', vendor._id);

    res.json(vendor);
  } catch (err) {
    console.error('Error in creating vendor:', {
      message: err.message,
      stack: err.stack,
      body: req.body,
      userId: req.user?.id
    });

    // Check if it's a MongoDB validation error
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message
      }));
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Check if it's a MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.toUpperCase()} number already registered`
      });
    }

    // Check MongoDB connection
    if (!mongoose.connection.readyState) {
      return res.status(500).json({ 
        message: 'Database connection error',
        error: process.env.NODE_ENV === 'development' ? 'MongoDB is not connected' : 'Internal Server Error'
      });
    }

    res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
  }
});

// @route   PUT /api/vendors/:id
// @desc    Update a vendor
// @access  Private
router.put('/:id', [
  auth,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Phone number is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check for duplicate email if email is being changed
    if (req.body.email !== vendor.email) {
      const existingVendor = await Vendor.findOne({ email: req.body.email });
      if (existingVendor) {
        return res.status(400).json({ message: 'Email already registered to another vendor' });
      }
    }

    // Check for duplicate PAN/VAT if being changed
    if (req.body.panNumber && req.body.panNumber !== vendor.panNumber) {
      const existingVendor = await Vendor.findOne({ panNumber: req.body.panNumber });
      if (existingVendor) {
        return res.status(400).json({ message: 'PAN number already registered' });
      }
    }
    if (req.body.vatNumber && req.body.vatNumber !== vendor.vatNumber) {
      const existingVendor = await Vendor.findOne({ vatNumber: req.body.vatNumber });
      if (existingVendor) {
        return res.status(400).json({ message: 'VAT number already registered' });
      }
    }

    vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(vendor);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/vendors/:id
// @desc    Soft delete a vendor
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if vendor has any active purchase orders
    const purchaseOrders = await PurchaseOrder.find({ 
      vendorId: req.params.id,
      status: { $nin: ['completed', 'cancelled', 'deleted'] }
    });
    
    if (purchaseOrders.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete vendor with active purchase orders' 
      });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await vendor.softDelete(req.user.id);
    res.json({ message: 'Vendor moved to trash' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/vendors/:id/restore
// @desc    Restore a deleted vendor
// @access  Private
router.post('/:id/restore', auth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (vendor.status !== 'deleted') {
      return res.status(400).json({ message: 'Vendor is not in trash' });
    }

    await vendor.restore();
    res.json({ message: 'Vendor restored successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/vendors/:id/permanent
// @desc    Permanently delete a vendor
// @access  Private
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (vendor.status !== 'deleted') {
      return res.status(400).json({ message: 'Vendor must be in trash before permanent deletion' });
    }

    await vendor.deleteOne();
    res.json({ message: 'Vendor permanently deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/vendors/:id/purchase-orders
// @desc    Get all purchase orders for a vendor
// @access  Private
router.get('/:id/purchase-orders', auth, async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find({ vendorId: req.params.id })
      .sort({ createdAt: -1 });
    res.json(purchaseOrders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 