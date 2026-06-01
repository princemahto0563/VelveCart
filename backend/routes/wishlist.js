const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name slug images price originalPrice brand rating isActive');
  res.json({ success: true, wishlist: user.wishlist });
}));

router.post('/:productId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const pid = req.params.productId;
  const inList = user.wishlist.map(id => id.toString()).includes(pid);
  if (inList) user.wishlist = user.wishlist.filter((id) => id.toString() !== pid);
  else user.wishlist.push(pid);
  await user.save();
  res.json({ success: true, inWishlist: !inList, wishlist: user.wishlist });
}));

module.exports = router;
