const express = require('express');
const asyncHandler = require('express-async-handler');
const { Order, Coupon, Category, Settings, QRPayment } = require('../models/index');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All routes require admin
router.use(protect, adminOnly);

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
router.get('/dashboard', asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  const [
    totalRevenue, monthRevenue, lastMonthRevenue,
    todayOrders, totalOrders, totalUsers, totalProducts,
    pendingQR, recentOrders, topProducts,
  ] = await Promise.all([
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.countDocuments({ createdAt: { $gte: startOfDay } }),
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    QRPayment.countDocuments({ status: 'pending' }),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5).lean(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, image: { $first: '$items.image' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
  ]);

  // Revenue chart: last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const revenueChart = await Order.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: sevenDaysAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    stats: {
      totalRevenue: totalRevenue[0]?.total || 0,
      monthRevenue: monthRevenue[0]?.total || 0,
      lastMonthRevenue: lastMonthRevenue[0]?.total || 0,
      todayOrders,
      totalOrders,
      totalUsers,
      totalProducts,
      pendingQR,
    },
    recentOrders,
    topProducts,
    revenueChart,
  });
}));

// ─── Users ────────────────────────────────────────────────────────────────────
router.get('/users', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    User.countDocuments(query),
  ]);
  res.json({ success: true, users, pagination: { total, pages: Math.ceil(total / Number(limit)) } });
}));

router.put('/users/:id/role', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, user });
}));

// ─── Coupons ──────────────────────────────────────────────────────────────────
router.get('/coupons', asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, coupons });
}));

router.post('/coupons', asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
}));

router.put('/coupons/:id', asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  res.json({ success: true, coupon });
}));

router.delete('/coupons/:id', asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
}));

// ─── Categories ───────────────────────────────────────────────────────────────
router.post('/categories', asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
}));

router.put('/categories/:id', asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, category });
}));

router.delete('/categories/:id', asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
}));

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get('/settings', asyncHandler(async (req, res) => {
  const settings = await Settings.find().lean();
  const settingsMap = {};
  settings.forEach((s) => { settingsMap[s.key] = s.value; });
  res.json({ success: true, settings: settingsMap });
}));

router.put('/settings', asyncHandler(async (req, res) => {
  const { settings } = req.body;
  const updates = Object.entries(settings).map(([key, value]) =>
    Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true })
  );
  await Promise.all(updates);
  res.json({ success: true, message: 'Settings saved' });
}));

// Export CSV of orders
router.get('/export/orders', asyncHandler(async (req, res) => {
  const orders = await Order.find({ paymentStatus: 'paid' })
    .populate('user', 'name email')
    .lean();

  const rows = [
    ['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Payment', 'Date'].join(','),
    ...orders.map((o) =>
      [o.orderId, o.user?.name, o.user?.email, o.totalPrice, o.status, o.paymentMethod,
        new Date(o.createdAt).toLocaleDateString('en-IN')].join(',')
    ),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=velvetcart-orders.csv');
  res.send(rows);
}));

module.exports = router;
