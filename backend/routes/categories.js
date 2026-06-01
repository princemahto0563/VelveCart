const express = require('express');
const asyncHandler = require('express-async-handler');
const { Category } = require('../models/index');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  res.json({ success: true, categories });
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, category });
}));

module.exports = router;
