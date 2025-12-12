import asyncHandler from 'express-async-handler';
import Banner from '../models/bannerModel.js';

// @description  Get all banners for admin (including inactive)
// @route        GET /api/banners/admin
// @access       Private/Admin
const getAllBannersAdmin = asyncHandler(async (req, res) => {
  const banners = await Banner.find({}).sort({ order: 1, createdAt: -1 });
  res.json(banners);
});

// @description  Get all active banners filtered by user login status
// @route        GET /api/banners?isLoggedIn=true|false
// @access       Public
const getBanners = asyncHandler(async (req, res) => {
  const { isLoggedIn } = req.query;
  
  // Build the visibility filter based on login status
  let visibilityFilter;
  if (isLoggedIn === 'true') {
    // Show banners for logged-in users: 'all' or 'logged_in'
    visibilityFilter = { $in: ['all', 'logged_in'] };
  } else if (isLoggedIn === 'false') {
    // Show banners for non-logged-in users: 'all' or 'logged_out'
    visibilityFilter = { $in: ['all', 'logged_out'] };
  } else {
    // No filter specified, show all active banners
    visibilityFilter = { $in: ['all', 'logged_in', 'logged_out'] };
  }

  const banners = await Banner.find({ 
    isActive: true,
    visibility: visibilityFilter
  }).sort({ order: 1 });
  
  res.json(banners);
});

// @description  Get single banner by ID
// @route        GET /api/banners/:id
// @access       Public
const getBannerById = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (banner) {
    res.json(banner);
  } else {
    res.status(404);
    throw new Error('Banner not found');
  }
});

// @description  Create a banner
// @route        POST /api/banners
// @access       Private/Admin
const createBanner = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    description,
    image,
    buttonText,
    link,
    badge,
    bgColor,
    order,
    visibility,
  } = req.body;

  const banner = new Banner({
    title,
    subtitle,
    description,
    image,
    buttonText,
    link,
    badge,
    bgColor,
    order: order || 0,
    visibility: visibility || 'all',
  });

  const createdBanner = await banner.save();
  res.status(201).json(createdBanner);
});

// @description  Update a banner
// @route        PUT /api/banners/:id
// @access       Private/Admin
const updateBanner = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    description,
    image,
    buttonText,
    link,
    badge,
    bgColor,
    isActive,
    order,
    visibility,
  } = req.body;

  const banner = await Banner.findById(req.params.id);

  if (banner) {
    banner.title = title || banner.title;
    banner.subtitle = subtitle || banner.subtitle;
    banner.description = description || banner.description;
    banner.image = image || banner.image;
    banner.buttonText = buttonText || banner.buttonText;
    banner.link = link || banner.link;
    banner.badge = badge || banner.badge;
    banner.bgColor = bgColor || banner.bgColor;
    banner.isActive = isActive !== undefined ? isActive : banner.isActive;
    banner.order = order !== undefined ? order : banner.order;
    banner.visibility = visibility || banner.visibility;

    const updatedBanner = await banner.save();
    res.json(updatedBanner);
  } else {
    res.status(404);
    throw new Error('Banner not found');
  }
});

// @description  Delete a banner
// @route        DELETE /api/banners/:id
// @access       Private/Admin
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (banner) {
    await banner.deleteOne();
    res.json({ message: 'Banner removed' });
  } else {
    res.status(404);
    throw new Error('Banner not found');
  }
});

export {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getAllBannersAdmin,
};
