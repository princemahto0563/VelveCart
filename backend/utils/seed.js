const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const { Category, Coupon, Settings } = require('../models/index');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✦ Connected to MongoDB');

    // Clear existing
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Coupon.deleteMany({}),
      Settings.deleteMany({}),
    ]);
    console.log('✦ Cleared existing data');

    // ── Admin user ────────────────────────────────────────────────────────────
    const admin = await User.create({
      name: 'VelvetCart Admin',
      email: process.env.ADMIN_EMAIL || 'admin@velvetcart.store',
      password: process.env.ADMIN_PASSWORD || 'Admin@2025',
      role: 'admin',
      isVerified: true,
    });
    console.log('✦ Admin created:', admin.email);

    // ── Categories ────────────────────────────────────────────────────────────
    const categories = await Category.insertMany([
      { name: 'Jewellery', slug: 'jewellery', description: 'Handcrafted luxury jewellery', sortOrder: 1 },
      { name: 'Fashion', slug: 'fashion', description: 'Premium fashion & apparel', sortOrder: 2 },
      { name: 'Beauty', slug: 'beauty', description: 'Skincare, makeup & fragrance', sortOrder: 3 },
      { name: 'Home & Decor', slug: 'home', description: 'Aesthetic home decor', sortOrder: 4 },
      { name: 'Accessories', slug: 'accessories', description: 'Bags, belts & more', sortOrder: 5 },
    ]);
    console.log('✦ Categories seeded');

    const [jewellery, fashion, beauty, home, accessories] = categories;

    // ── Products ──────────────────────────────────────────────────────────────
    const products = await Product.insertMany([
      {
        name: 'Celestine Diamond Pendant',
        slug: 'celestine-diamond-pendant',
        brand: 'VelvetCart Gold',
        description: '<p>A breathtaking pendant crafted with lab-grown diamonds set in 18k gold-plated sterling silver. The celestial design is inspired by the cosmos, making it a true statement piece for the discerning collector.</p><p>Each pendant comes in a premium VelvetCart gift box, perfect for gifting.</p>',
        shortDescription: 'Lab-grown diamond pendant in 18k gold-plated sterling silver.',
        category: jewellery._id,
        price: 4999,
        originalPrice: 7999,
        discount: 38,
        images: [
          { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80', alt: 'Celestine Diamond Pendant front' },
          { url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80', alt: 'Celestine Diamond Pendant detail' },
          { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', alt: 'Celestine Diamond Pendant worn' },
        ],
        variants: [
          { size: '16 inch chain', stock: 8 },
          { size: '18 inch chain', stock: 12 },
          { size: '20 inch chain', stock: 5 },
        ],
        specifications: [
          { label: 'Material', value: '18k Gold-plated 925 Sterling Silver' },
          { label: 'Stone', value: 'Lab-grown Diamond (0.5 ct)' },
          { label: 'Chain Length', value: '16/18/20 inches' },
          { label: 'Clasp', value: 'Lobster Clasp' },
          { label: 'Weight', value: '3.2g' },
          { label: 'Certification', value: 'GIA Certified Stone' },
        ],
        stock: 25,
        tags: ['diamond', 'pendant', 'gold', 'luxury', 'bestseller'],
        isFeatured: true,
        isFlashSale: false,
        rating: { average: 4.9, count: 142 },
        salesCount: 89,
        metaTitle: 'Celestine Diamond Pendant | VelvetCart Gold',
        metaDescription: 'Luxury lab-grown diamond pendant in 18k gold-plated silver. Free shipping above ₹2999.',
      },
      {
        name: 'Velvet Noir Tote Bag',
        slug: 'velvet-noir-tote-bag',
        brand: 'VelvetCart Studio',
        description: '<p>Crafted from premium vegan leather, the Velvet Noir Tote is the ultimate everyday luxury companion. Spacious enough for a 15" laptop, with an interior suede lining and magnetic snap closure.</p>',
        shortDescription: 'Premium vegan leather tote with suede interior lining.',
        category: accessories._id,
        price: 2299,
        originalPrice: 3499,
        discount: 34,
        images: [
          { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', alt: 'Velvet Noir Tote Bag' },
          { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', alt: 'Tote bag interior' },
        ],
        variants: [
          { color: 'Noir Black', colorHex: '#0a0a0a', stock: 15 },
          { color: 'Champagne Beige', colorHex: '#c9a96e', stock: 8 },
          { color: 'Dusty Rose', colorHex: '#d4a0a0', stock: 6 },
        ],
        specifications: [
          { label: 'Material', value: 'Premium Vegan Leather' },
          { label: 'Lining', value: 'Suede microfiber' },
          { label: 'Dimensions', value: '35cm × 30cm × 12cm' },
          { label: 'Closure', value: 'Magnetic snap + zipper pocket' },
          { label: 'Laptop Fit', value: 'Up to 15 inches' },
        ],
        stock: 29,
        tags: ['tote', 'bag', 'vegan leather', 'handbag', 'luxury'],
        isFeatured: true,
        rating: { average: 4.8, count: 89 },
        salesCount: 64,
        metaTitle: 'Velvet Noir Tote Bag | VelvetCart Studio',
        metaDescription: 'Premium vegan leather luxury tote bag. Available in 3 colors.',
      },
      {
        name: 'Rose Gold Stud Earrings',
        slug: 'rose-gold-stud-earrings',
        brand: 'VelvetCart Gold',
        description: '<p>Timeless rose gold stud earrings featuring AAA-grade cubic zirconia stones. Hypoallergenic and tarnish-resistant, these are perfect for daily wear.</p>',
        shortDescription: 'Hypoallergenic rose gold CZ stud earrings.',
        category: jewellery._id,
        price: 1899,
        originalPrice: 2999,
        discount: 37,
        images: [
          { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', alt: 'Rose Gold Stud Earrings' },
          { url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80', alt: 'Earrings worn' },
        ],
        variants: [
          { size: '6mm', stock: 20 },
          { size: '8mm', stock: 15 },
          { size: '10mm', stock: 10 },
        ],
        specifications: [
          { label: 'Material', value: '18k Rose Gold Plated' },
          { label: 'Stone', value: 'AAA Cubic Zirconia' },
          { label: 'Back', value: 'Butterfly push back' },
          { label: 'Hypoallergenic', value: 'Yes — Nickel free' },
        ],
        stock: 45,
        tags: ['earrings', 'rose gold', 'studs', 'jewellery'],
        isFeatured: true,
        isFlashSale: true,
        flashSalePrice: 1499,
        flashSaleEndsAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
        rating: { average: 4.7, count: 203 },
        salesCount: 178,
      },
      {
        name: 'Luxury Satin Scrunchie Set',
        slug: 'luxury-satin-scrunchie-set',
        brand: 'VelvetCart Beauty',
        description: '<p>Set of 5 premium mulberry satin scrunchies that protect your hair while keeping you looking aesthetically elevated. Loved by Pinterest creators worldwide.</p>',
        shortDescription: 'Set of 5 mulberry satin scrunchies — Pinterest bestseller.',
        category: beauty._id,
        price: 599,
        originalPrice: 899,
        discount: 33,
        images: [
          { url: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80', alt: 'Satin Scrunchie Set' },
        ],
        variants: [
          { color: 'Neutrals Pack', colorHex: '#c9a96e', stock: 50 },
          { color: 'Pastels Pack', colorHex: '#d4a0a0', stock: 40 },
          { color: 'Darks Pack', colorHex: '#2a2318', stock: 35 },
        ],
        specifications: [
          { label: 'Material', value: '100% Mulberry Satin' },
          { label: 'Quantity', value: '5 scrunchies per set' },
          { label: 'Size', value: 'Standard + 1 XL' },
          { label: 'Hair Type', value: 'All hair types' },
        ],
        stock: 125,
        tags: ['scrunchie', 'satin', 'hair', 'beauty', 'pinterest', 'aesthetic'],
        isFeatured: true,
        isFlashSale: true,
        flashSalePrice: 449,
        flashSaleEndsAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
        rating: { average: 4.9, count: 512 },
        salesCount: 412,
      },
      {
        name: 'Marble Resin Trinket Tray',
        slug: 'marble-resin-trinket-tray',
        brand: 'VelvetCart Home',
        description: '<p>A hand-poured resin trinket tray with genuine marble dust for that authentic stone finish. Perfect for jewellery, perfumes, or as a desk catch-all. Each piece is unique.</p>',
        shortDescription: 'Hand-poured marble resin trinket tray — unique piece.',
        category: home._id,
        price: 1299,
        originalPrice: 1999,
        discount: 35,
        images: [
          { url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80', alt: 'Marble Trinket Tray' },
        ],
        variants: [
          { color: 'White Marble', colorHex: '#f0ece4', stock: 12 },
          { color: 'Black Marble', colorHex: '#1a1a1a', stock: 8 },
          { color: 'Rose Marble', colorHex: '#c9a0a0', stock: 6 },
        ],
        specifications: [
          { label: 'Material', value: 'Resin + marble dust' },
          { label: 'Size', value: '18cm × 12cm' },
          { label: 'Weight', value: '280g' },
          { label: 'Finish', value: 'Matte gloss' },
          { label: 'Note', value: 'Each piece is unique — slight variations expected' },
        ],
        stock: 26,
        tags: ['home decor', 'marble', 'tray', 'resin', 'aesthetic', 'pinterest'],
        isFeatured: false,
        rating: { average: 4.6, count: 67 },
        salesCount: 43,
      },
      {
        name: 'Noir 05 Perfume Dupe',
        slug: 'noir-05-perfume-dupe',
        brand: 'VelvetCart Beauty',
        description: '<p>Our bestselling fragrance — a rich, woody oriental with top notes of bergamot and black pepper, heart of oud and rose, base of amber and musk. Lasts 8-10 hours.</p>',
        shortDescription: 'Long-lasting luxury fragrance — oud, rose & amber.',
        category: beauty._id,
        price: 799,
        originalPrice: 1499,
        discount: 47,
        images: [
          { url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80', alt: 'Noir 05 Perfume' },
        ],
        variants: [
          { size: '30ml', stock: 35 },
          { size: '50ml', stock: 28 },
          { size: '100ml', stock: 20 },
        ],
        specifications: [
          { label: 'Top Notes', value: 'Bergamot, Black Pepper' },
          { label: 'Heart Notes', value: 'Oud, Rose, Jasmine' },
          { label: 'Base Notes', value: 'Amber, Musk, Sandalwood' },
          { label: 'Longevity', value: '8-10 hours' },
          { label: 'Sillage', value: 'Moderate-Strong' },
          { label: 'Type', value: 'Eau de Parfum' },
        ],
        stock: 83,
        tags: ['perfume', 'fragrance', 'oud', 'luxury', 'beauty', 'bestseller'],
        isFeatured: true,
        isFlashSale: true,
        flashSalePrice: 649,
        flashSaleEndsAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
        rating: { average: 4.8, count: 318 },
        salesCount: 201,
      },
      {
        name: 'Linen Co-ord Set',
        slug: 'linen-co-ord-set',
        brand: 'VelvetCart Studio',
        description: '<p>Premium 100% linen co-ordinate set featuring a relaxed-fit blazer and wide-leg trousers. The ultimate capsule wardrobe piece for the modern minimalist.</p>',
        shortDescription: '100% linen blazer + wide-leg trouser co-ord set.',
        category: fashion._id,
        price: 3299,
        originalPrice: 4999,
        discount: 34,
        images: [
          { url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', alt: 'Linen Co-ord Set' },
          { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', alt: 'Co-ord Set detail' },
        ],
        variants: [
          { size: 'XS', color: 'Sand Beige', colorHex: '#c9a96e', stock: 5 },
          { size: 'S', color: 'Sand Beige', colorHex: '#c9a96e', stock: 10 },
          { size: 'M', color: 'Sand Beige', colorHex: '#c9a96e', stock: 12 },
          { size: 'L', color: 'Sand Beige', colorHex: '#c9a96e', stock: 8 },
          { size: 'XL', color: 'Sand Beige', colorHex: '#c9a96e', stock: 4 },
          { size: 'S', color: 'Chalk White', colorHex: '#f5f0e8', stock: 8 },
          { size: 'M', color: 'Chalk White', colorHex: '#f5f0e8', stock: 10 },
        ],
        specifications: [
          { label: 'Material', value: '100% Pure Linen' },
          { label: 'Includes', value: 'Blazer + Wide-leg trousers' },
          { label: 'Fit', value: 'Relaxed / Oversized' },
          { label: 'Care', value: 'Hand wash cold / Dry clean' },
          { label: 'Model wears', value: 'Size S, Height 5\'7"' },
        ],
        stock: 57,
        tags: ['linen', 'co-ord', 'fashion', 'blazer', 'minimalist', 'aesthetic'],
        isFeatured: true,
        rating: { average: 4.9, count: 178 },
        salesCount: 64,
        metaTitle: 'Linen Co-ord Set | VelvetCart Studio',
        metaDescription: 'Premium 100% linen co-ord set. Relaxed luxury for the modern minimalist.',
      },
      {
        name: 'Champagne Resin Ring',
        slug: 'champagne-resin-ring',
        brand: 'VelvetCart Gold',
        description: '<p>A handcrafted resin ring with gold leaf inclusions sealed under a high-gloss dome. Each ring is one-of-a-kind, making it a truly unique piece of wearable art.</p>',
        shortDescription: 'Handmade resin ring with 24k gold leaf inclusions.',
        category: jewellery._id,
        price: 449,
        originalPrice: 699,
        discount: 36,
        images: [
          { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80', alt: 'Champagne Resin Ring' },
        ],
        variants: [
          { size: '5 (15.7mm)', stock: 8 },
          { size: '6 (16.5mm)', stock: 12 },
          { size: '7 (17.3mm)', stock: 15 },
          { size: '8 (18.2mm)', stock: 10 },
          { size: '9 (19.0mm)', stock: 6 },
        ],
        specifications: [
          { label: 'Material', value: 'Resin + 24k Gold Leaf' },
          { label: 'Finish', value: 'High-gloss dome' },
          { label: 'Band width', value: '8mm' },
          { label: 'Note', value: 'Handmade — each piece is unique' },
        ],
        stock: 51,
        tags: ['ring', 'resin', 'gold leaf', 'handmade', 'jewellery', 'aesthetic'],
        isFeatured: false,
        isFlashSale: true,
        flashSalePrice: 349,
        flashSaleEndsAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
        rating: { average: 4.6, count: 94 },
        salesCount: 178,
      },
    ]);
    console.log(`✦ ${products.length} products seeded`);

    // ── Coupons ───────────────────────────────────────────────────────────────
    await Coupon.insertMany([
      {
        code: 'VELVET10',
        type: 'percentage',
        value: 10,
        minOrderAmount: 999,
        maxDiscount: 500,
        usageLimit: 1000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        description: '10% off on orders above ₹999',
        isActive: true,
      },
      {
        code: 'WELCOME200',
        type: 'fixed',
        value: 200,
        minOrderAmount: 1499,
        usageLimit: null,
        userLimit: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        description: 'Flat ₹200 off for new customers',
        isActive: true,
      },
      {
        code: 'LUXURY20',
        type: 'percentage',
        value: 20,
        minOrderAmount: 3999,
        maxDiscount: 1500,
        usageLimit: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: '20% off on orders above ₹3999',
        isActive: true,
      },
    ]);
    console.log('✦ Coupons seeded');

    // ── Site Settings ─────────────────────────────────────────────────────────
    await Settings.insertMany([
      { key: 'siteName', value: 'VelvetCart', label: 'Site Name', group: 'general' },
      { key: 'siteTagline', value: 'Luxury Reimagined', label: 'Tagline', group: 'general' },
      { key: 'currency', value: 'INR', label: 'Currency', group: 'general' },
      { key: 'freeShippingThreshold', value: 2999, label: 'Free Shipping Above (₹)', group: 'shipping' },
      { key: 'standardShippingCost', value: 99, label: 'Standard Shipping Cost', group: 'shipping' },
      { key: 'taxRate', value: 18, label: 'GST Rate (%)', group: 'tax' },
      { key: 'razorpayKeyId', value: '', label: 'Razorpay Key ID', group: 'payment' },
      { key: 'qrUpiId', value: 'velvetcart@upi', label: 'UPI ID for QR', group: 'payment' },
      { key: 'qrImageUrl', value: '', label: 'QR Code Image URL', group: 'payment' },
      { key: 'whatsappNumber', value: '', label: 'WhatsApp Business Number', group: 'contact' },
      { key: 'instagramUrl', value: 'https://instagram.com/velvetcart', label: 'Instagram', group: 'social' },
      { key: 'pinterestUrl', value: 'https://pinterest.com/velvetcart', label: 'Pinterest', group: 'social' },
    ]);
    console.log('✦ Settings seeded');

    console.log('\n✦ ✦ ✦ Seed complete! ✦ ✦ ✦');
    console.log(`Admin: ${process.env.ADMIN_EMAIL || 'admin@velvetcart.store'}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'Admin@2025'}`);
    process.exit(0);
  } catch (error) {
    console.error('✕ Seed failed:', error);
    process.exit(1);
  }
};

seed();
