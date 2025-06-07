const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');

// @route   GET /api/purchase-orders
// @desc    Get all purchase orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find()
      .populate('vendorId', ['name', 'email'])
      .sort({ createdAt: -1 });
    res.json(purchaseOrders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/purchase-orders/:id
// @desc    Get purchase order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('vendorId', ['name', 'email', 'phone', 'address', 'bankDetails']);
    
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    res.json(purchaseOrder);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/purchase-orders
// @desc    Create a purchase order
// @access  Private
router.post('/', [
  auth,
  [
    check('vendorId', 'Vendor is required').not().isEmpty(),
    check('items', 'At least one item is required').isArray({ min: 1 }),
    check('items.*.description', 'Item description is required').not().isEmpty(),
    check('items.*.quantity', 'Item quantity must be a positive number').isInt({ min: 1 }),
    check('items.*.unitPrice', 'Item unit price must be a positive number').isFloat({ min: 0 }),
    check('dueDate', 'Due date is required').not().isEmpty(),
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Verify vendor exists
    const vendor = await Vendor.findById(req.body.vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Calculate totals
    const items = req.body.items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = req.body.tax || 0;
    const discount = req.body.discount || 0;
    const total = subtotal + tax - discount;

    const purchaseOrder = new PurchaseOrder({
      ...req.body,
      items,
      subtotal,
      tax,
      discount,
      total,
      createdBy: req.user.id
    });

    await purchaseOrder.save();
    
    const populatedPO = await PurchaseOrder.findById(purchaseOrder._id)
      .populate('vendorId', ['name', 'email']);
    
    res.json(populatedPO);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/purchase-orders/:id
// @desc    Update a purchase order
// @access  Private
router.put('/:id', [
  auth,
  [
    check('items', 'At least one item is required').isArray({ min: 1 }),
    check('items.*.description', 'Item description is required').not().isEmpty(),
    check('items.*.quantity', 'Item quantity must be a positive number').isInt({ min: 1 }),
    check('items.*.unitPrice', 'Item unit price must be a positive number').isFloat({ min: 0 }),
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    // Only allow updates if PO is in draft or pending status
    if (!['draft', 'pending'].includes(purchaseOrder.status)) {
      return res.status(400).json({ 
        message: 'Purchase order can only be updated when in draft or pending status' 
      });
    }

    // Calculate new totals
    const items = req.body.items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = req.body.tax || purchaseOrder.tax;
    const discount = req.body.discount || purchaseOrder.discount;
    const total = subtotal + tax - discount;

    purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { 
        $set: {
          ...req.body,
          items,
          subtotal,
          tax,
          discount,
          total
        }
      },
      { new: true }
    ).populate('vendorId', ['name', 'email']);

    res.json(purchaseOrder);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/purchase-orders/:id
// @desc    Soft delete a purchase order
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    // Only allow deletion of draft or rejected POs
    if (!['draft', 'rejected'].includes(purchaseOrder.status)) {
      return res.status(400).json({ 
        message: 'Only draft or rejected purchase orders can be moved to trash' 
      });
    }

    await purchaseOrder.softDelete(req.user.id);
    res.json({ message: 'Purchase order moved to trash' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/purchase-orders/:id/restore
// @desc    Restore a deleted purchase order
// @access  Private
router.post('/:id/restore', auth, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== 'deleted') {
      return res.status(400).json({ message: 'Purchase order is not in trash' });
    }

    await purchaseOrder.restore();
    res.json({ message: 'Purchase order restored successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/purchase-orders/:id/permanent
// @desc    Permanently delete a purchase order
// @access  Private
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== 'deleted') {
      return res.status(400).json({ message: 'Purchase order must be in trash before permanent deletion' });
    }

    await purchaseOrder.deleteOne();
    res.json({ message: 'Purchase order permanently deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/purchase-orders/:id/status
// @desc    Update purchase order status (approve/reject/cancel)
// @access  Private
router.put('/:id/status', [
  auth,
  [
    check('status', 'Status is required').isIn(['approved', 'rejected', 'cancelled']),
    check('note', 'Note is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    // Add to approval history
    purchaseOrder.approvalHistory.push({
      status: req.body.status,
      by: req.user.id,
      note: req.body.note
    });

    // Update PO status
    purchaseOrder.status = req.body.status;
    
    await purchaseOrder.save();
    
    const populatedPO = await PurchaseOrder.findById(purchaseOrder._id)
      .populate('vendorId', ['name', 'email'])
      .populate('approvalHistory.by', ['name', 'email']);
    
    res.json(populatedPO);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/purchase-orders/:id/payments
// @desc    Add a payment to purchase order
// @access  Private
router.post('/:id/payments', [
  auth,
  [
    check('amount', 'Amount is required').isFloat({ min: 0.01 }),
    check('method', 'Valid payment method is required').isIn(['cash', 'bank-transfer', 'cheque']),
    check('reference', 'Payment reference is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    // Verify PO is approved
    if (purchaseOrder.status !== 'approved') {
      return res.status(400).json({ 
        message: 'Payments can only be added to approved purchase orders' 
      });
    }

    // Calculate total paid amount including new payment
    const totalPaid = purchaseOrder.payments.reduce((sum, payment) => sum + payment.amount, 0) + req.body.amount;

    // Verify payment doesn't exceed total amount
    if (totalPaid > purchaseOrder.total) {
      return res.status(400).json({ 
        message: 'Payment amount exceeds remaining balance' 
      });
    }

    // Add payment
    purchaseOrder.payments.push({
      ...req.body,
      processedBy: req.user.id
    });

    // Update payment status
    if (totalPaid === purchaseOrder.total) {
      purchaseOrder.paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      purchaseOrder.paymentStatus = 'partially-paid';
    }

    await purchaseOrder.save();
    
    const populatedPO = await PurchaseOrder.findById(purchaseOrder._id)
      .populate('vendorId', ['name', 'email'])
      .populate('payments.processedBy', ['name', 'email']);
    
    res.json(populatedPO);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 