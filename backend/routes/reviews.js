const express = require('express');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { Review } = require('../models/index');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/product/:productId', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const sortMap = { '-createdAt': { createdAt: -1 }, 'rating-high': { rating: -1 }, 'helpful': { helpfulVotes: -1 } };
  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId, isApproved: true }).populate('user', 'name avatar').sort(sortMap[sort] || { createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Review.countDocuments({ product: req.params.productId, isApproved: true }),
  ]);
  const ratingDist = await Review.aggregate([
    { $match: { product: mongoose.Types.ObjectId.createFromHexString(req.params.productId), isApproved: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);
  res.json({ success: true, reviews, total, ratingDistribution: ratingDist });
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  const { product, rating, title, body } = req.body;
  const existing = await Review.findOne({ user: req.user._id, product });
  if (existing) { res.status(400); throw new Error('You have already reviewed this product'); }
  const review = await Review.create({ user: req.user._id, product, rating, title, body });
  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, review });
}));

router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') { res.status(403); throw new Error('Not authorized'); }
  await review.deleteOne();
  res.json({ success: true });
}));

module.exports = router;
