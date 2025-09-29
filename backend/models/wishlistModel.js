import mongoose from 'mongoose';

const wishlistSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to prevent duplicate entries
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
