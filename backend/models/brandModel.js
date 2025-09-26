import mongoose from 'mongoose';

const brandSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    logo: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for product count
brandSchema.virtual('productCount', {
  ref: 'Product',
  localField: 'name',
  foreignField: 'brand',
  count: true,
});

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
