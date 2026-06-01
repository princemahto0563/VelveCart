// ============================================================
// reviews.js
// ============================================================
const express = require('express');
const asyncHandler = require('express-async-handler');
const { Review } = require('../models/index');
const Order = require('../models/Order'); // optional verified purchase
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/product/:productId', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const sortMap = { '-createdAt': { createdAt: -1 }, 'rating-high': { rating: -1 }, 'rating-low': { rating: 1 }, 'helpful': { helpfulVotes: -1 } };

  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Review.countDocuments({ product: req.params.productId, isApproved: true }),
  ]);

  const ratingDist = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId), isApproved: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.json({ success: true, reviews, total, ratingDistribution: ratingDist });
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  const { product, rating, title, body } = req.body;

  const existing = await Review.findOne({ user: req.user._id, product });
  if (existing) { res.status(400); throw new Error('You have already reviewed this product'); }

  const review = await Review.create({
    user: req.user._id,
    product,
    rating,
    title,
    body,
  });

  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, review });
}));

router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
}));

module.exports = router;

// ============================================================
// upload.js
// ============================================================
const uploadRouter = express.Router();
const { uploadProduct, uploadBanner } = require('../config/cloudinary');
const { protect: p2, adminOnly: a2 } = require('../middleware/auth');

uploadRouter.post('/product', p2, a2, uploadProduct.array('images', 8), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) { res.status(400); throw new Error('No files uploaded'); }
  const images = req.files.map((f) => ({ url: f.path, publicId: f.filename, alt: req.body.alt || '' }));
  res.json({ success: true, images });
}));

uploadRouter.post('/banner', p2, a2, uploadBanner.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
  res.json({ success: true, url: req.file.path, publicId: req.file.filename });
}));

// ============================================================
// coupons.js
// ============================================================
const couponRouter = express.Router();
const { Coupon } = require('../models/index');
const { protect: p3 } = require('../middleware/auth');

couponRouter.get('/', asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({ isActive: true }).select('code type value description minOrderAmount').lean();
  res.json({ success: true, coupons });
}));

couponRouter.post('/validate', p3, asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });

  if (!coupon) { res.status(404); throw new Error('Invalid coupon code'); }
  if (new Date() < coupon.validFrom || new Date() > coupon.validUntil) { res.status(400); throw new Error('Coupon has expired'); }
  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    res.status(400); throw new Error(`Minimum order amount ₹${coupon.minOrderAmount} required`);
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) { res.status(400); throw new Error('Coupon usage limit reached'); }

  const usedByUser = coupon.usedBy.includes(req.user._id);
  if (usedByUser && coupon.userLimit && coupon.usedBy.filter((id) => id.toString() === req.user._id.toString()).length >= coupon.userLimit) {
    res.status(400); throw new Error('You have already used this coupon');
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (orderAmount * coupon.value) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.value;
  }

  res.json({ success: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value, description: coupon.description }, discount: Math.round(discount) });
}));

// ============================================================
// categories.js
// ============================================================
const categoryRouter = express.Router();
const { Category: Cat } = require('../models/index');

categoryRouter.get('/', asyncHandler(async (req, res) => {
  const categories = await Cat.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  res.json({ success: true, categories });
}));

categoryRouter.get('/:slug', asyncHandler(async (req, res) => {
  const category = await Cat.findOne({ slug: req.params.slug, isActive: true });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, category });
}));

// ============================================================
// wishlist.js
// ============================================================
const wishlistRouter = express.Router();
const User = require('../models/User');
const { protect: p4 } = require('../middleware/auth');

wishlistRouter.get('/', p4, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name slug images price originalPrice brand rating isActive');
  res.json({ success: true, wishlist: user.wishlist });
}));

wishlistRouter.post('/:productId', p4, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;

  const inWishlist = user.wishlist.includes(productId);
  if (inWishlist) {
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();
  res.json({ success: true, inWishlist: !inWishlist, wishlist: user.wishlist });
}));

module.exports = {
  reviewsRouter: router,
  uploadRouter,
  couponRouter,
  categoryRouter,
  wishlistRouter,
};
