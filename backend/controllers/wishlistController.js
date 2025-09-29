import asyncHandler from 'express-async-handler';
import Wishlist from '../models/wishlistModel.js';
import Product from '../models/productModel.js';
import { sendRestockNotificationEmail } from '../config/emailConfig.js';

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  try {
    // Check if product exists and is out of stock
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (product.countInStock > 0) {
      res.status(400);
      throw new Error('Only out-of-stock products can be added to wishlist');
    }

    // Check if already in wishlist
    const existingWishlistItem = await Wishlist.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existingWishlistItem) {
      res.status(400);
      throw new Error('Product already in wishlist');
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      user: req.user._id,
      product: productId,
    });

    const populatedItem = await Wishlist.findById(wishlistItem._id).populate(
      'product',
      'name price image brand category countInStock'
    );

    res.status(201).json({
      success: true,
      data: populatedItem,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error('Product already in wishlist');
    }
    throw error;
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlistItem = await Wishlist.findOne({
    user: req.user._id,
    product: req.params.id,
  });

  if (!wishlistItem) {
    res.status(404);
    throw new Error('Product not found in wishlist');
  }

  await Wishlist.deleteOne({ _id: wishlistItem._id });

  res.json({
    success: true,
    message: 'Product removed from wishlist',
  });
});

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const wishlistItems = await Wishlist.find({ user: req.user._id })
    .populate('product', 'name price image brand category countInStock')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: wishlistItems,
  });
});

// @desc    Clear user's wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  await Wishlist.deleteMany({ user: req.user._id });

  res.json({
    success: true,
    message: 'Wishlist cleared',
  });
});

// @desc    Check for restocked products and send notifications
// @route   POST /api/wishlist/check-restock
// @access  Private (Admin only)
const checkRestockedProducts = asyncHandler(async (req, res) => {
  try {
    // Find all wishlist items for products that are now in stock but haven't been notified
    const restockedWishlistItems = await Wishlist.find({
      notified: false,
    })
      .populate('product', 'name price image brand category countInStock')
      .populate('user', 'name email');

    const notificationsToSend = restockedWishlistItems.filter(
      (item) => item.product.countInStock > 0
    );

    let notificationsSent = 0;

    for (const item of notificationsToSend) {
      try {
        // Send email notification
        const emailSent = await sendRestockNotificationEmail(
          item.user,
          item.product
        );

        if (emailSent) {
          // Mark as notified
          await Wishlist.findByIdAndUpdate(item._id, { notified: true });
          notificationsSent++;
        }
      } catch (error) {
        console.error(
          `Failed to send notification for product ${item.product._id}:`,
          error
        );
      }
    }

    res.json({
      success: true,
      message: `Sent ${notificationsSent} restock notifications`,
      totalChecked: notificationsToSend.length,
    });
  } catch (error) {
    console.error('Error checking restocked products:', error);
    res.status(500);
    throw new Error('Failed to check restocked products');
  }
});

// @desc    Sync frontend wishlist with backend (for existing users)
// @route   POST /api/wishlist/sync
// @access  Private
const syncWishlist = asyncHandler(async (req, res) => {
  const { wishlistItems } = req.body;

  try {
    const syncResults = {
      added: 0,
      skipped: 0,
      errors: 0,
    };

    for (const item of wishlistItems) {
      try {
        // Check if product exists and is still out of stock
        const product = await Product.findById(item.product);
        if (!product || product.countInStock > 0) {
          syncResults.skipped++;
          continue;
        }

        // Try to add to backend wishlist
        const existingItem = await Wishlist.findOne({
          user: req.user._id,
          product: item.product,
        });

        if (!existingItem) {
          await Wishlist.create({
            user: req.user._id,
            product: item.product,
          });
          syncResults.added++;
        } else {
          syncResults.skipped++;
        }
      } catch (error) {
        syncResults.errors++;
      }
    }

    res.json({
      success: true,
      message: 'Wishlist synced successfully',
      results: syncResults,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to sync wishlist');
  }
});

export {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  clearWishlist,
  checkRestockedProducts,
  syncWishlist,
};
