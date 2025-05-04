import express from 'express';
import asyncHandler from 'express-async-handler';
const router = express.Router();

import Product from '../models/productModel.js';

// @description  Fetch all products
// @route        Get /api/products
//@access        public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const products = await Product.find({});

    res.json(products);
  })
);

// @description  Fetch single products
// @route        Get /api/products/:id
//@access        public
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product); // Send the found single product as JSON
    } else {
      res.status(404); // Send a 404 status if the product is not found
      throw new Error('Product not found');
    }
  })
);

export default router;
