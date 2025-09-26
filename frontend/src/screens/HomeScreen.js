import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Product from '../components/Product';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import { listProducts } from '../actions/productActions';

const HomeScreen = () => {
  const { keyword, pageNumber } = useParams();
  const keywordSearch = keyword || '';
  const page = pageNumber || 1;
  const dispatch = useDispatch();

  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  useEffect(() => {
    dispatch(listProducts(keywordSearch, page));
  }, [dispatch, keywordSearch, page]);

  // Category data
  const categories = [
    {
      name: 'Medicine',
      icon: '💊',
      color: 'bg-green-100 text-green-800',
      link: '/products?category=medicine',
    },
    {
      name: 'Health Care',
      icon: '🏥',
      color: 'bg-blue-100 text-blue-800',
      link: '/products?category=healthcare',
    },
    {
      name: 'Personal Care',
      icon: '🧴',
      color: 'bg-purple-100 text-purple-800',
      link: '/products?category=personal-care',
    },
    {
      name: 'Vitamins',
      icon: '💉',
      color: 'bg-orange-100 text-orange-800',
      link: '/products?category=vitamins',
    },
    {
      name: 'Baby Care',
      icon: '👶',
      color: 'bg-pink-100 text-pink-800',
      link: '/products?category=baby-care',
    },
    {
      name: 'Medical Devices',
      icon: '🩺',
      color: 'bg-indigo-100 text-indigo-800',
      link: '/products?category=devices',
    },
  ];

  const featuredCategories = [
    {
      title: 'Flash Sale',
      subtitle: 'Up to 50% Off',
      bg: 'bg-gradient-to-r from-red-400 to-pink-500',
    },
    {
      title: 'New Arrivals',
      subtitle: 'Latest Products',
      bg: 'bg-gradient-to-r from-blue-400 to-purple-500',
    },
    {
      title: 'Best Sellers',
      subtitle: 'Most Popular',
      bg: 'bg-gradient-to-r from-green-400 to-teal-500',
    },
    {
      title: 'Bestseller Routines',
      subtitle: 'Proven Results',
      bg: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Section */}
      {!keywordSearch ? (
        <section className='relative'>
          <ProductCarousel />
        </section>
      ) : (
        <div className='container mx-auto px-4 py-4'>
          <Link
            to='/'
            className='inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors'
          >
            <i className='fas fa-arrow-left mr-2'></i>
            Go Back
          </Link>
        </div>
      )}

      <div className='container mx-auto px-4 py-8'>
        {/* Categories Section */}
        {!keywordSearch && (
          <section className='mb-12'>
            <div className='text-center mb-8'>
              <h2 className='text-3xl font-bold text-gray-800 mb-2'>
                Especially for You
              </h2>
              <p className='text-gray-600'>Shop by categories</p>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
              {categories.map((category, index) => (
                <Link
                  key={index}
                  to={category.link}
                  className={`${category.color} rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className='text-3xl mb-2'>{category.icon}</div>
                  <h3 className='font-semibold text-sm'>{category.name}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Categories Banners */}
        {!keywordSearch && (
          <section className='mb-12'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {featuredCategories.map((item, index) => (
                <div
                  key={index}
                  className={`${item.bg} rounded-lg p-6 text-white cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <h3 className='font-bold text-lg mb-1'>{item.title}</h3>
                  <p className='text-sm opacity-90'>{item.subtitle}</p>
                  <div className='mt-4'>
                    <span className='text-xs bg-white bg-opacity-20 px-2 py-1 rounded'>
                      Shop Now →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Products Section */}
        <section>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h2 className='text-3xl font-bold text-gray-800 mb-2'>
                {keywordSearch
                  ? `Search Results for "${keywordSearch}"`
                  : 'Latest Products'}
              </h2>
              <p className='text-gray-600'>Discover our newest additions</p>
            </div>
            <Link
              to='/products'
              className='text-blue-600 hover:text-blue-800 font-medium flex items-center'
            >
              View All
              <i className='fas fa-arrow-right ml-2'></i>
            </Link>
          </div>

          {loading ? (
            <div className='flex justify-center py-12'>
              <Loader />
            </div>
          ) : error ? (
            <Message variant='danger'>{error}</Message>
          ) : (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6'>
                {products.map((product) => (
                  <Product key={product._id} product={product} />
                ))}
              </div>

              {products.length > 0 && (
                <div className='mt-12 flex justify-center'>
                  <Paginate
                    pages={productList.pages}
                    page={page}
                    keyword={keywordSearch ? keywordSearch : ''}
                  />
                </div>
              )}
            </>
          )}
        </section>

        {/* Promotional Banner */}
        {!keywordSearch && products.length > 0 && (
          <section className='mt-16'>
            <div className='bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded-2xl p-8 text-white text-center relative overflow-hidden'>
              <div className='absolute inset-0 bg-black bg-opacity-10'></div>
              <div className='relative z-10'>
                <div className='inline-block bg-white bg-opacity-20 rounded-full px-6 py-2 mb-4'>
                  <span className='font-bold text-3xl'>60%</span>
                  <span className='ml-2'>OFF</span>
                </div>
                <h2 className='text-4xl font-bold mb-4'>Special Discount</h2>
                <p className='text-lg mb-6 opacity-90'>
                  Limited time offer on selected medical products
                </p>
                <button className='bg-white text-gray-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors'>
                  Shop Now
                </button>
              </div>
              {/* Decorative circles */}
              <div className='absolute -top-10 -right-10 w-32 h-32 bg-white bg-opacity-10 rounded-full'></div>
              <div className='absolute -bottom-16 -left-16 w-48 h-48 bg-white bg-opacity-10 rounded-full'></div>
            </div>
          </section>
        )}

        {/* Additional Categories */}
        {!keywordSearch && (
          <section className='mt-16'>
            <h2 className='text-3xl font-bold text-gray-800 mb-8 text-center'>
              Featured Categories
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
              {[
                {
                  title: 'Wellness Essentials',
                  desc: 'Daily health supplements',
                  icon: '🌿',
                  products: '500+ Products',
                },
                {
                  title: 'Baby & Mother Care',
                  desc: 'Complete care solutions',
                  icon: '👶',
                  products: '200+ Products',
                },
                {
                  title: 'Beauty & Skincare',
                  desc: 'Dermatologist approved',
                  icon: '✨',
                  products: '300+ Products',
                },
                {
                  title: 'Medical Devices',
                  desc: 'Professional equipment',
                  icon: '🩺',
                  products: '150+ Products',
                },
              ].map((category, index) => (
                <div
                  key={index}
                  className='bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow'
                >
                  <div className='text-4xl mb-4'>{category.icon}</div>
                  <h3 className='font-bold text-lg mb-2'>{category.title}</h3>
                  <p className='text-gray-600 text-sm mb-4'>{category.desc}</p>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-blue-600 font-medium'>
                      {category.products}
                    </span>
                    <button className='text-blue-600 hover:text-blue-800'>
                      <i className='fas fa-arrow-right'></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
