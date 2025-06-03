const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Vendor = require('../models/Vendor');
const PurchaseOrder = require('../models/PurchaseOrder');

// @route   GET /api/vendors
// @desc    Get all vendors
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .sort({ createdAt: -1 });
    res.json(vendors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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
    check('registrationType', 'Registration type is required').isIn(['pan', 'vat']),
    check('bankDetails.accountName', 'Account name is required').not().isEmpty(),
    check('bankDetails.accountNumber', 'Account number is required').not().isEmpty(),
    check('bankDetails.bankName', 'Bank name is required').not().isEmpty(),
    check('bankDetails.branch', 'Branch name is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if vendor with same email exists
    let vendor = await Vendor.findOne({ email: req.body.email });
    if (vendor) {
      return res.status(400).json({ message: 'Vendor already exists' });
    }

    // Check for duplicate PAN/VAT number
    if (req.body.registrationType === 'pan' && req.body.panNumber) {
      vendor = await Vendor.findOne({ panNumber: req.body.panNumber });
      if (vendor) {
        return res.status(400).json({ message: 'PAN number already registered' });
      }
    }
    if (req.body.registrationType === 'vat' && req.body.vatNumber) {
      vendor = await Vendor.findOne({ vatNumber: req.body.vatNumber });
      if (vendor) {
        return res.status(400).json({ message: 'VAT number already registered' });
      }
    }

    vendor = new Vendor({
      ...req.body,
      createdBy: req.user.id
    });

    await vendor.save();
    res.json(vendor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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
// @desc    Delete a vendor
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if vendor has any purchase orders
    const purchaseOrders = await PurchaseOrder.find({ vendorId: req.params.id });
    if (purchaseOrders.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete vendor with existing purchase orders' 
      });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await vendor.deleteOne();
    res.json({ message: 'Vendor removed' });
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