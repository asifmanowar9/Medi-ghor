import React from 'react';
import { Link } from 'react-router-dom';
import Rating from './Rating';

const Product = ({ product }) => {
  // Fix the image path handling (keeping existing logic):
  const imagePath =
    product.image &&
    (product.image.startsWith('http')
      ? product.image // Use as is if it's an absolute URL
      : product.image.startsWith('/uploads')
      ? product.image // Use as is if it already has /uploads prefix
      : product.image.startsWith('/images')
      ? product.image // Use as is if it already has /images prefix (from demo data)
      : `/uploads/${product.image}`); // Add /uploads prefix for relative paths

  // Calculate discount percentage (mock logic - you can customize this)
  const originalPrice = product.originalPrice || product.price * 1.2;
  const discountPercentage = Math.round(
    ((originalPrice - product.price) / originalPrice) * 100
  );
  const hasDiscount = discountPercentage > 0;

  return (
    <div className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group'>
      <div className='relative aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-50'>
        {hasDiscount && (
          <div className='absolute top-2 left-2 z-10'>
            <span className='bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md'>
              -{discountPercentage}%
            </span>
          </div>
        )}

        <Link to={`/product/${product._id}`} className='block'>
          <img
            src={imagePath}
            alt={product.name}
            className='h-48 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300'
          />
        </Link>

        {/* Quick Add Button - Shows on hover */}
        <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
          <button className='w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors'>
            <i className='fas fa-cart-plus mr-2'></i>
            Add to Cart
          </button>
        </div>
      </div>

      <div className='p-4'>
        <Link to={`/product/${product._id}`}>
          <h3 className='text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-2 line-clamp-2'>
            {product.name}
          </h3>
        </Link>

        <div className='mb-3'>
          <Rating
            value={product.rating}
            text={`(${product.numReviews})`}
            className='text-xs'
          />
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex flex-col'>
            <div className='flex items-center space-x-2'>
              <span className='text-lg font-bold text-gray-900'>
                ৳{product.price}
              </span>
              {hasDiscount && (
                <span className='text-sm text-gray-500 line-through'>
                  ৳{originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.inStock === 0 && (
              <span className='text-xs text-red-600 font-medium'>
                Out of Stock
              </span>
            )}
            {product.inStock > 0 && product.inStock <= 5 && (
              <span className='text-xs text-orange-600 font-medium'>
                Only {product.inStock} left
              </span>
            )}
          </div>

          <div className='flex items-center space-x-1'>
            <button className='p-1.5 text-gray-400 hover:text-red-500 transition-colors'>
              <i className='fas fa-heart text-xs'></i>
            </button>
            <button className='p-1.5 text-gray-400 hover:text-blue-500 transition-colors'>
              <i className='fas fa-share-alt text-xs'></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
