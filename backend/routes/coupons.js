const express = require('express');
const asyncHandler = require('express-async-handler');
const { Coupon } = require('../models/index');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/validate', protect, asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
  if (!coupon) { res.status(404); throw new Error('Invalid coupon code'); }
  if (new Date() < coupon.validFrom || new Date() > coupon.validUntil) { res.status(400); throw new Error('Coupon has expired'); }
  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) { res.status(400); throw new Error(`Minimum order amount ₹${coupon.minOrderAmount} required`); }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) { res.status(400); throw new Error('Coupon usage limit reached'); }
  let discount = coupon.type === 'percentage' ? Math.min((orderAmount * coupon.value) / 100, coupon.maxDiscount || Infinity) : coupon.value;
  res.json({ success: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value, description: coupon.description }, discount: Math.round(discount) });
}));

module.exports = router;
