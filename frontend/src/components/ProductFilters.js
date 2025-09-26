import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    priceRange: '',
    category: '',
    brand: '',
    rating: '',
    sortBy: 'name',
  });

  const priceRanges = [
    { label: 'Under ৳100', value: '0-100' },
    { label: '৳100 - ৳500', value: '100-500' },
    { label: '৳500 - ৳1000', value: '500-1000' },
    { label: '৳1000 - ৳2000', value: '1000-2000' },
    { label: 'Over ৳2000', value: '2000+' },
  ];

  const categories = [
    'Medicine',
    'Health Care',
    'Personal Care',
    'Vitamins',
    'Baby Care',
    'Medical Devices',
  ];

  const brands = [
    'Square Pharmaceuticals',
    'Beximco Pharma',
    'Incepta Pharma',
    'Renata Limited',
    'ACI Limited',
    'Opsonin Pharma',
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <h3 className='font-bold text-lg text-gray-800 mb-6'>Filters</h3>

      {/* Sort By */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Sort By
        </label>
        <select
          className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value='name'>Name A-Z</option>
          <option value='price-low'>Price: Low to High</option>
          <option value='price-high'>Price: High to Low</option>
          <option value='rating'>Rating</option>
          <option value='newest'>Newest First</option>
        </select>
      </div>

      {/* Price Range */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-700 mb-3'>
          Price Range
        </label>
        <div className='space-y-2'>
          {priceRanges.map((range) => (
            <label key={range.value} className='flex items-center'>
              <input
                type='radio'
                name='priceRange'
                value={range.value}
                checked={filters.priceRange === range.value}
                onChange={(e) =>
                  handleFilterChange('priceRange', e.target.value)
                }
                className='text-blue-600 focus:ring-blue-500'
              />
              <span className='ml-2 text-sm text-gray-700'>{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-700 mb-3'>
          Category
        </label>
        <div className='space-y-2'>
          {categories.map((category) => (
            <label key={category} className='flex items-center'>
              <input
                type='radio'
                name='category'
                value={category}
                checked={filters.category === category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className='text-blue-600 focus:ring-blue-500'
              />
              <span className='ml-2 text-sm text-gray-700'>{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-700 mb-3'>
          Brand
        </label>
        <div className='space-y-2'>
          {brands.map((brand) => (
            <label key={brand} className='flex items-center'>
              <input
                type='checkbox'
                value={brand}
                checked={filters.brand.includes(brand)}
                onChange={(e) => {
                  const currentBrands = filters.brand
                    ? filters.brand.split(',')
                    : [];
                  if (e.target.checked) {
                    currentBrands.push(brand);
                  } else {
                    const index = currentBrands.indexOf(brand);
                    if (index > -1) currentBrands.splice(index, 1);
                  }
                  handleFilterChange('brand', currentBrands.join(','));
                }}
                className='text-blue-600 focus:ring-blue-500'
              />
              <span className='ml-2 text-sm text-gray-700'>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-700 mb-3'>
          Rating
        </label>
        <div className='space-y-2'>
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className='flex items-center'>
              <input
                type='radio'
                name='rating'
                value={rating}
                checked={filters.rating === rating.toString()}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className='text-blue-600 focus:ring-blue-500'
              />
              <span className='ml-2 flex items-center'>
                {[...Array(rating)].map((_, i) => (
                  <i
                    key={i}
                    className='fas fa-star text-yellow-400 text-xs'
                  ></i>
                ))}
                <span className='ml-1 text-sm text-gray-700'>& Up</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          setFilters({
            priceRange: '',
            category: '',
            brand: '',
            rating: '',
            sortBy: 'name',
          });
          onFilterChange({
            priceRange: '',
            category: '',
            brand: '',
            rating: '',
            sortBy: 'name',
          });
        }}
        className='w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors'
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default ProductFilters;
