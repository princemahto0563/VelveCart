const express = require('express');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

// ─── Validation rules ─────────────────────────────────────────────────────────
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }
  next();
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', registerValidation, validate, asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, phone });

  // Send welcome email (non-blocking)
  sendEmail({
    to: email,
    subject: 'Welcome to VelvetCart ✦',
    template: 'welcome',
    data: { name },
  }).catch(console.error);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
}));

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', loginValidation, validate, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
    },
  });
}));

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name slug images price');
  res.json({ success: true, user });
}));

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;

  await user.save();

  res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, role: user.role } });
}));

// ─── PUT /api/auth/change-password ───────────────────────────────────────────
router.put('/change-password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) { res.status(400); throw new Error('Current password is incorrect'); }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
}));

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if email exists
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset Your VelvetCart Password',
    template: 'resetPassword',
    data: { name: user.name, resetUrl },
  });

  res.json({ success: true, message: 'Password reset link sent to your email' });
}));

// ─── POST /api/auth/reset-password/:token ────────────────────────────────────
router.post('/reset-password/:token', asyncHandler(async (req, res) => {
  const { password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) { res.status(400); throw new Error('Invalid or expired reset token'); }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful. Please log in.' });
}));

// ─── POST /api/auth/address ───────────────────────────────────────────────────
router.post('/address', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }

  user.addresses.push(req.body);
  await user.save();

  res.status(201).json({ success: true, addresses: user.addresses });
}));

// ─── DELETE /api/auth/address/:id ────────────────────────────────────────────
router.delete('/address/:id', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.id);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
}));

module.exports = router;
