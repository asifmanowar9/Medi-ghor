import asyncHandler from 'express-async-handler';
import Brand from '../models/brandModel.js';
import Product from '../models/productModel.js';

// @description  Get all active brands
// @route        GET /api/brands
// @access       Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort({ name: 1 });

  // Get product count for each brand
  const brandsWithCount = await Promise.all(
    brands.map(async (brand) => {
      const productCount = await Product.countDocuments({
        brand: brand.name,
        isActive: true,
      });
      return {
        ...brand.toObject(),
        productCount,
      };
    })
  );

  res.json(brandsWithCount);
});

// @description  Get featured brands
// @route        GET /api/brands/featured
// @access       Public
const getFeaturedBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true, isFeatured: true }).sort({
    name: 1,
  });

  // Get product count for each brand
  const brandsWithCount = await Promise.all(
    brands.map(async (brand) => {
      const productCount = await Product.countDocuments({
        brand: brand.name,
        isActive: true,
      });
      return {
        ...brand.toObject(),
        productCount,
      };
    })
  );

  res.json(brandsWithCount);
});

// @description  Get single brand by ID
// @route        GET /api/brands/:id
// @access       Public
const getBrandById = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (brand) {
    const productCount = await Product.countDocuments({
      brand: brand.name,
      isActive: true,
    });

    res.json({
      ...brand.toObject(),
      productCount,
    });
  } else {
    res.status(404);
    throw new Error('Brand not found');
  }
});

// @description  Create a brand
// @route        POST /api/brands
// @access       Private/Admin
const createBrand = asyncHandler(async (req, res) => {
  const { name, logo, description, isFeatured } = req.body;

  const brandExists = await Brand.findOne({ name });

  if (brandExists) {
    res.status(400);
    throw new Error('Brand already exists');
  }

  const brand = new Brand({
    name,
    logo,
    description,
    isFeatured: isFeatured || false,
  });

  const createdBrand = await brand.save();
  res.status(201).json(createdBrand);
});

// @description  Update a brand
// @route        PUT /api/brands/:id
// @access       Private/Admin
const updateBrand = asyncHandler(async (req, res) => {
  const { name, logo, description, isActive, isFeatured } = req.body;

  const brand = await Brand.findById(req.params.id);

  if (brand) {
    brand.name = name || brand.name;
    brand.logo = logo || brand.logo;
    brand.description = description || brand.description;
    brand.isActive = isActive !== undefined ? isActive : brand.isActive;
    brand.isFeatured = isFeatured !== undefined ? isFeatured : brand.isFeatured;

    const updatedBrand = await brand.save();
    res.json(updatedBrand);
  } else {
    res.status(404);
    throw new Error('Brand not found');
  }
});

// @description  Delete a brand
// @route        DELETE /api/brands/:id
// @access       Private/Admin
const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (brand) {
    // Check if there are products with this brand
    const productCount = await Product.countDocuments({ brand: brand.name });

    if (productCount > 0) {
      res.status(400);
      throw new Error('Cannot delete brand with existing products');
    }

    await brand.deleteOne();
    res.json({ message: 'Brand removed' });
  } else {
    res.status(404);
    throw new Error('Brand not found');
  }
});

export {
  getBrands,
  getFeaturedBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
