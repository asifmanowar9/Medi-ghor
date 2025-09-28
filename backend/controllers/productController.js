import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import HealthCondition from '../models/healthConditionModel.js';

// @description  Fetch all products
// @route        Get /api/products
//@access        public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 12;
  const page = Number(req.query.pageNumber) || 1;
  const category = req.query.category;
  const healthCondition = req.query.healthCondition;
  const brand = req.query.brand;
  const featured = req.query.featured;
  const flashSale = req.query.flashSale;

  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { genericName: { $regex: req.query.keyword, $options: 'i' } },
          { brand: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  let query = { isActive: true, ...keyword };

  if (category) {
    // Check if category is an ObjectId (24 character hex string) or a name
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      query.category = category;
    } else {
      // It's a category name, find the category ID
      const categoryDoc = await Category.findOne({
        name: { $regex: new RegExp(category, 'i') },
      });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // Category not found, return empty results
        return res.json({
          products: [],
          page,
          pages: 0,
          total: 0,
        });
      }
    }
  }

  if (healthCondition) {
    // Check if healthCondition is an ObjectId (24 character hex string) or a name
    if (healthCondition.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      query.healthConditions = { $in: [healthCondition] };
    } else {
      // It's a health condition name, find the condition ID
      const conditionDoc = await HealthCondition.findOne({
        name: { $regex: new RegExp(healthCondition, 'i') },
      });
      if (conditionDoc) {
        query.healthConditions = { $in: [conditionDoc._id] };
      } else {
        // Health condition not found, return empty results
        return res.json({
          products: [],
          page,
          pages: 0,
          total: 0,
        });
      }
    }
  }

  if (brand) {
    // Use case-insensitive regex for brand matching
    query.brand = { $regex: new RegExp(brand, 'i') };
  }

  if (featured === 'true') {
    query.isFeatured = true;
  }

  if (flashSale === 'true') {
    query.isFlashSale = true;
    query.flashSaleEndDate = { $gt: new Date() };
  }

  const count = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate('category', 'name icon')
    .populate('healthConditions', 'name icon color')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @description  Fetch single products
// @route        Get /api/products/:id
//@access        public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name icon')
    .populate('healthConditions', 'name icon color');

  if (product) {
    res.json(product); // Send the found single product as JSON
  } else {
    res.status(404); // Send a 404 status if the product is not found
    throw new Error('Product not found');
  }
});

// @description  Delete a product
// @route        Delete /api/products/:id
//@access        private/admin

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @description  Create a product
// @route        Post /api/products
//@access        private/admin

const createProduct = asyncHandler(async (req, res) => {
  // const { name, price, description, image, brand, category, countInStock } =
  //   req.body;

  const product = new Product({
    name: 'sample name',
    user: req.user._id, // Assuming req.user is set by authentication middleware
    price: 0,
    description: 'sample description',
    image: '/image/sample.jpg',
    brand: 'sample brand',
    category: 'sample category',
    countInStock: 0,
    numReviews: 0,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @description  Update a product
// @route        Put /api/products/:id
//@access        private/admin

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } =
    req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @description  Create new review
// @route        Post /api/products/:id/reviews
//@access        private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @description  Get top rated products
// @route        Get /api/products/top
//@access        public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .populate('category', 'name icon')
    .sort({ rating: -1 })
    .limit(3);
  res.json(products);
});

// @description  Get featured products
// @route        Get /api/products/featured
//@access        public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 6;
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate('category', 'name icon')
    .populate('healthConditions', 'name icon color')
    .limit(limit)
    .sort({ createdAt: -1 });
  res.json(products);
});

// @description  Get flash sale products
// @route        Get /api/products/flash-sale
//@access        public
const getFlashSaleProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 6;
  const products = await Product.find({
    isActive: true,
    isFlashSale: true,
    flashSaleEndDate: { $gt: new Date() },
  })
    .populate('category', 'name icon')
    .populate('healthConditions', 'name icon color')
    .limit(limit)
    .sort({ discount: -1 });
  res.json(products);
});

// @description  Get best sellers
// @route        Get /api/products/best-sellers
//@access        public
const getBestSellerProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 6;
  const products = await Product.find({ isActive: true })
    .populate('category', 'name icon')
    .populate('healthConditions', 'name icon color')
    .limit(limit)
    .sort({ numReviews: -1, rating: -1 });
  res.json(products);
});

// @description  Get products by category
// @route        Get /api/products/category/:categoryId
//@access        public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 12;
  const page = Number(req.query.pageNumber) || 1;
  const categoryId = req.params.categoryId;

  const count = await Product.countDocuments({
    isActive: true,
    category: categoryId,
  });

  const products = await Product.find({
    isActive: true,
    category: categoryId,
  })
    .populate('category', 'name icon')
    .populate('healthConditions', 'name icon color')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getFeaturedProducts,
  getFlashSaleProducts,
  getBestSellerProducts,
  getProductsByCategory,
};
