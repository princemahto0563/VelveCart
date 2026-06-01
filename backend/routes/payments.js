const express = require('express');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { Order, QRPayment, Settings } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadQR } = require('../config/cloudinary');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

// ─── Razorpay instance (lazy, uses DB settings or env) ───────────────────────
const getRazorpay = async () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// ─── POST /api/payments/razorpay/order — create Razorpay order ───────────────
router.post('/razorpay/order', protect, asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Access denied'); }

  const razorpay = await getRazorpay();
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalPrice * 100), // paisa
    currency: 'INR',
    receipt: order.orderId,
    notes: { orderId: order._id.toString(), userId: req.user._id.toString() },
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.json({
    success: true,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}));

// ─── POST /api/payments/razorpay/verify — verify payment signature ────────────
router.post('/razorpay/verify', protect, asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    res.status(400); throw new Error('Payment verification failed — invalid signature');
  }

  const order = await Order.findById(orderId).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.paymentStatus = 'paid';
  order.status = 'confirmed';
  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  await order.save();

  // Order confirmation email
  sendEmail({
    to: order.user.email,
    subject: `Order Confirmed! #${order.orderId} ✦`,
    template: 'orderConfirmed',
    data: {
      name: order.user.name,
      orderId: order.orderId,
      totalPrice: order.totalPrice,
      items: order.items,
    },
  }).catch(console.error);

  res.json({ success: true, message: 'Payment verified successfully', order: { _id: order._id, orderId: order.orderId, status: order.status } });
}));

// ─── POST /api/payments/webhook — Razorpay webhook ───────────────────────────
router.post('/webhook', asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = req.body; // raw Buffer

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).json({ success: false });
  }

  const event = JSON.parse(body.toString());

  if (event.event === 'payment.captured') {
    const { order_id, id: paymentId } = event.payload.payment.entity;
    const order = await Order.findOne({ razorpayOrderId: order_id });
    if (order && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.razorpayPaymentId = paymentId;
      await order.save();
    }
  }

  if (event.event === 'payment.failed') {
    const { order_id } = event.payload.payment.entity;
    const order = await Order.findOne({ razorpayOrderId: order_id });
    if (order) { order.paymentStatus = 'failed'; await order.save(); }
  }

  res.json({ received: true });
}));

// ─── POST /api/payments/qr/upload — customer uploads screenshot ───────────────
router.post('/qr/upload', protect, uploadQR.single('screenshot'), asyncHandler(async (req, res) => {
  const { orderId, utrNumber } = req.body;

  if (!req.file) { res.status(400); throw new Error('Payment screenshot is required'); }

  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Access denied'); }
  if (order.paymentMethod !== 'qr') { res.status(400); throw new Error('Order is not set to QR payment'); }

  const qrPayment = await QRPayment.create({
    order: order._id,
    user: req.user._id,
    screenshotUrl: req.file.path,
    screenshotPublicId: req.file.filename,
    amount: order.totalPrice,
    utrNumber,
  });

  order.qrPayment = qrPayment._id;
  order.status = 'pending'; // awaiting admin verification
  await order.save();

  res.status(201).json({ success: true, message: 'Payment screenshot uploaded. Awaiting verification.', qrPayment });
}));

// ─── ADMIN: GET /api/payments/qr/pending ─────────────────────────────────────
router.get('/qr/pending', protect, adminOnly, asyncHandler(async (req, res) => {
  const payments = await QRPayment.find({ status: 'pending' })
    .populate('user', 'name email phone')
    .populate('order', 'orderId totalPrice items')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, payments });
}));

// ─── ADMIN: PUT /api/payments/qr/:id/approve ─────────────────────────────────
router.put('/qr/:id/approve', protect, adminOnly, asyncHandler(async (req, res) => {
  const qrPayment = await QRPayment.findById(req.params.id).populate('order').populate('user', 'name email');

  if (!qrPayment) { res.status(404); throw new Error('QR payment not found'); }

  qrPayment.status = 'approved';
  qrPayment.verifiedBy = req.user._id;
  qrPayment.verifiedAt = new Date();
  qrPayment.adminNote = req.body.note || '';
  await qrPayment.save();

  const order = await Order.findById(qrPayment.order);
  order.paymentStatus = 'paid';
  order.status = 'confirmed';
  await order.save();

  sendEmail({
    to: qrPayment.user.email,
    subject: `Payment Approved! Order #${order.orderId} ✦`,
    template: 'orderConfirmed',
    data: { name: qrPayment.user.name, orderId: order.orderId, totalPrice: order.totalPrice },
  }).catch(console.error);

  res.json({ success: true, message: 'Payment approved and order confirmed' });
}));

// ─── ADMIN: PUT /api/payments/qr/:id/reject ──────────────────────────────────
router.put('/qr/:id/reject', protect, adminOnly, asyncHandler(async (req, res) => {
  const qrPayment = await QRPayment.findById(req.params.id).populate('user', 'name email');
  if (!qrPayment) { res.status(404); throw new Error('QR payment not found'); }

  qrPayment.status = 'rejected';
  qrPayment.verifiedBy = req.user._id;
  qrPayment.verifiedAt = new Date();
  qrPayment.rejectionReason = req.body.reason || 'Payment could not be verified';
  await qrPayment.save();

  const order = await Order.findById(qrPayment.order);
  order.paymentStatus = 'failed';
  await order.save();

  res.json({ success: true, message: 'Payment rejected' });
}));

module.exports = router;
