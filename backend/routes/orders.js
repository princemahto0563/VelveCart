const express = require('express');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const { Order } = require('../models/index');
const { Coupon } = require('../models/index');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

// ─── POST /api/orders — create order ─────────────────────────────────────────
router.post('/', protect, asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode, notes } = req.body;

  if (!items || items.length === 0) { res.status(400); throw new Error('No items in order'); }

  // Validate stock and compute items price
  let itemsPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) { res.status(400); throw new Error(`Product not found: ${item.name}`); }
    if (product.stock < item.quantity) { res.status(400); throw new Error(`Insufficient stock for ${product.name}`); }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      quantity: item.quantity,
      variant: item.variant || {},
    });
    itemsPrice += product.price * item.quantity;
  }

  // Coupon
  let discountAmount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && new Date() >= coupon.validFrom && new Date() <= coupon.validUntil) {
      if (coupon.minOrderAmount && itemsPrice < coupon.minOrderAmount) {
        res.status(400); throw new Error(`Minimum order amount is ₹${coupon.minOrderAmount}`);
      }
      if (coupon.type === 'percentage') {
        discountAmount = (itemsPrice * coupon.value) / 100;
        if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      } else {
        discountAmount = coupon.value;
      }
      appliedCoupon = coupon._id;
    }
  }

  const shippingPrice = itemsPrice >= 2999 ? 0 : 99;
  const taxPrice = Math.round((itemsPrice - discountAmount) * 0.18 * 100) / 100; // 18% GST
  const totalPrice = Math.max(0, itemsPrice - discountAmount + shippingPrice + taxPrice);

  const order = await Order.create({
    orderId: `VC${Date.now().toString(36).toUpperCase()}`,
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountAmount,
    totalPrice,
    coupon: appliedCoupon,
    notes,
  });

  // Decrement stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, salesCount: item.quantity } });
  }

  // Update coupon usage
  if (appliedCoupon) {
    await Coupon.findByIdAndUpdate(appliedCoupon, {
      $inc: { usedCount: 1 },
      $push: { usedBy: req.user._id },
    });
  }

  await order.populate('items.product', 'name slug');

  res.status(201).json({ success: true, order });
}));

// ─── GET /api/orders/my — current user orders ─────────────────────────────────
router.get('/my', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.json({ success: true, orders, pagination: { page: Number(page), total, pages: Math.ceil(total / Number(limit)) } });
}));

// ─── GET /api/orders/:id — single order (owner or admin) ─────────────────────
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('qrPayment');

  if (!order) { res.status(404); throw new Error('Order not found'); }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') { res.status(403); throw new Error('Access denied'); }

  res.json({ success: true, order });
}));

// ─── PUT /api/orders/:id/cancel ───────────────────────────────────────────────
router.put('/:id/cancel', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') { res.status(403); throw new Error('Access denied'); }

  if (['delivered', 'shipped', 'cancelled'].includes(order.status)) {
    res.status(400); throw new Error(`Cannot cancel order with status: ${order.status}`);
  }

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || 'Customer request';
  await order.save();

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, salesCount: -item.quantity } });
  }

  res.json({ success: true, order });
}));

// ─── ADMIN: GET /api/orders — all orders ─────────────────────────────────────
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, paymentMethod, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (search) query.orderId = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Order.countDocuments(query),
  ]);

  res.json({ success: true, orders, pagination: { page: Number(page), total, pages: Math.ceil(total / Number(limit)) } });
}));

// ─── ADMIN: PUT /api/orders/:id/status ───────────────────────────────────────
router.put('/:id/status', protect, adminOnly, asyncHandler(async (req, res) => {
  const { status, trackingNumber, trackingUrl } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingUrl) order.trackingUrl = trackingUrl;
  if (status === 'delivered') order.deliveredAt = new Date();

  await order.save();

  // Send shipping/delivery email
  if (status === 'shipped' || status === 'delivered') {
    sendEmail({
      to: order.user.email,
      subject: status === 'shipped' ? `Your VelvetCart order #${order.orderId} has shipped!` : `Order #${order.orderId} delivered!`,
      template: status === 'shipped' ? 'orderShipped' : 'orderDelivered',
      data: { name: order.user.name, orderId: order.orderId, trackingNumber, trackingUrl },
    }).catch(console.error);
  }

  res.json({ success: true, order });
}));

module.exports = router;
