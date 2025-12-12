import mongoose from 'mongoose';

const bannerSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      required: true,
    },
    bgColor: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ['all', 'logged_in', 'logged_out'],
      default: 'all',
    },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
