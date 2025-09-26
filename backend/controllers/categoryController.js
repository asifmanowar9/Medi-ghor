import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';

// @description  Get all active categories
// @route        GET /api/categories
// @access       Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1 });

  // Get product count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({
        category: category._id,
        isActive: true,
      });
      return {
        ...category.toObject(),
        productCount,
      };
    })
  );

  res.json(categoriesWithCount);
});

// @description  Get featured categories
// @route        GET /api/categories/featured
// @access       Public
const getFeaturedCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({
    isActive: true,
    isFeatured: true,
  }).sort({ order: 1 });

  // Get product count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({
        category: category._id,
        isActive: true,
      });
      return {
        ...category.toObject(),
        productCount,
      };
    })
  );

  res.json(categoriesWithCount);
});

// @description  Get single category by ID
// @route        GET /api/categories/:id
// @access       Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    const productCount = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    res.json({
      ...category.toObject(),
      productCount,
    });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @description  Create a category
// @route        POST /api/categories
// @access       Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, icon, description, color, image, isFeatured, order } = req.body;

  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = new Category({
    name,
    icon,
    description,
    color,
    image,
    isFeatured: isFeatured || false,
    order: order || 0,
  });

  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
});

// @description  Update a category
// @route        PUT /api/categories/:id
// @access       Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, icon, description, color, image, isActive, isFeatured, order } =
    req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = name || category.name;
    category.icon = icon || category.icon;
    category.description = description || category.description;
    category.color = color || category.color;
    category.image = image || category.image;
    category.isActive = isActive !== undefined ? isActive : category.isActive;
    category.isFeatured =
      isFeatured !== undefined ? isFeatured : category.isFeatured;
    category.order = order !== undefined ? order : category.order;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @description  Delete a category
// @route        DELETE /api/categories/:id
// @access       Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    // Check if there are products in this category
    const productCount = await Product.countDocuments({
      category: category._id,
    });

    if (productCount > 0) {
      res.status(400);
      throw new Error('Cannot delete category with existing products');
    }

    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

export {
  getCategories,
  getFeaturedCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
