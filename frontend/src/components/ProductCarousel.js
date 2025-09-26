import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Loader from './Loader';
import Message from './Message';
import { listTopProducts } from '../actions/productActions';

const ProductCarousel = () => {
  const dispatch = useDispatch();
  const [currentSlide, setCurrentSlide] = useState(0);

  const productTopRated = useSelector((state) => state.productTopRated);
  const { loading, error, products } = productTopRated;

  useEffect(() => {
    dispatch(listTopProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products && products.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % products.length);
      }, 5000); // Auto-advance every 5 seconds

      return () => clearInterval(interval);
    }
  }, [products]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : (
    <div className='relative mx-auto mb-8 max-w-4xl bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-lg overflow-hidden'>
      {/* Carousel Container */}
      <div className='relative h-96'>
        {products.map((product, index) => (
          <div
            key={product._id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Link to={`/product/${product._id}`} className='block h-full'>
              <div className='relative h-full flex items-center justify-center bg-white'>
                <img
                  src={
                    product.image.startsWith('http')
                      ? product.image
                      : product.image.startsWith('/uploads')
                      ? product.image
                      : product.image.startsWith('/images')
                      ? product.image
                      : `/uploads/${product.image}`
                  }
                  alt={product.name}
                  className='max-h-80 max-w-full object-contain'
                />

                {/* Caption */}
                <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2'>
                  <div className='bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg'>
                    <h3 className='text-lg font-semibold text-gray-900 text-center'>
                      {product.name}
                    </h3>
                    <p className='text-teal-600 font-bold text-center'>
                      BDT {product.price}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {products && products.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M9 5l7 7-7 7'
              />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {products && products.length > 1 && (
        <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2'>
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-teal-600 w-8'
                  : 'bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;
