const express = require('express');
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/products — list with filter/search/pagination ──────────────────
router.get('/', asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 12, category, search, sort = '-createdAt',
    minPrice, maxPrice, featured, flash, tags,
  } = req.query;

  const query = { isActive: true };

  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;
  if (flash === 'true') { query.isFlashSale = true; query.flashSaleEndsAt = { $gt: new Date() }; }
  if (tags) query.tags = { $in: tags.split(',') };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) {
    query.$text = { $search: search };
  }

  const sortMap = {
    '-createdAt': { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    'rating': { 'rating.average': -1 },
    'popular': { salesCount: -1 },
  };
  const sortQuery = sortMap[sort] || { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
}));

// ─── GET /api/products/featured ───────────────────────────────────────────────
router.get('/featured', asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name slug')
    .limit(8)
    .lean();
  res.json({ success: true, products });
}));

// ─── GET /api/products/flash-sale ─────────────────────────────────────────────
router.get('/flash-sale', asyncHandler(async (req, res) => {
  const products = await Product.find({
    isFlashSale: true,
    isActive: true,
    flashSaleEndsAt: { $gt: new Date() },
  })
    .populate('category', 'name slug')
    .limit(8)
    .lean();
  res.json({ success: true, products });
}));

// ─── GET /api/products/search?q= ─────────────────────────────────────────────
router.get('/search', asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;
  if (!q || q.length < 2) return res.json({ success: true, products: [] });

  const products = await Product.find(
    { $text: { $search: q }, isActive: true },
    { score: { $meta: 'textScore' }, name: 1, slug: 1, images: 1, price: 1, brand: 1 }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(Number(limit))
    .lean();

  res.json({ success: true, products });
}));

// ─── GET /api/products/:slug ───────────────────────────────────────────────────
router.get('/:slug', asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug');

  if (!product) { res.status(404); throw new Error('Product not found'); }

  // Increment view count
  Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } }).exec();

  // Related products
  const related = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(4)
    .select('name slug images price originalPrice brand rating')
    .lean();

  res.json({ success: true, product, related });
}));

// ─── POST /api/products — admin create ────────────────────────────────────────
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
}));

// ─── PUT /api/products/:id — admin update ─────────────────────────────────────
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, product });
}));

// ─── DELETE /api/products/:id — admin delete ──────────────────────────────────
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, message: 'Product removed' });
}));

module.exports = router;
