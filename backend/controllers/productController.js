import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// @description  Fetch all products
// @route        Get /api/products
//@access        public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @description  Fetch single products
// @route        Get /api/products/:id
//@access        public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
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

export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
};
