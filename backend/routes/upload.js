const express = require('express');
const asyncHandler = require('express-async-handler');
const { uploadProduct, uploadBanner } = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/product', protect, adminOnly, uploadProduct.array('images', 8), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) { res.status(400); throw new Error('No files uploaded'); }
  const images = req.files.map((f) => ({ url: f.path, publicId: f.filename, alt: '' }));
  res.json({ success: true, images });
}));

router.post('/banner', protect, adminOnly, uploadBanner.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
  res.json({ success: true, url: req.file.path, publicId: req.file.filename });
}));

module.exports = router;
