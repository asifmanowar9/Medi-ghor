import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <nav className='flex justify-center mb-8'>
      <ol className='flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400 sm:space-x-4'>
        {/* Step 1: Sign In */}
        <li className='flex items-center'>
          {step1 ? (
            <Link
              to='/login'
              className='flex items-center text-teal-600 dark:text-teal-500 hover:text-teal-800'
            >
              <span className='flex items-center justify-center w-5 h-5 mr-2 text-xs border border-teal-600 rounded-full dark:border-teal-500'>
                1
              </span>
              Sign In
            </Link>
          ) : (
            <span className='flex items-center text-gray-400 cursor-not-allowed'>
              <span className='flex items-center justify-center w-5 h-5 mr-2 text-xs border border-gray-400 rounded-full'>
                1
              </span>
              Sign In
            </span>
          )}
        </li>

        {/* Arrow */}
        <li className='flex items-center'>
          <svg
            className='w-3 h-3 mx-1 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M9 5l7 7-7 7'
            ></path>
          </svg>
        </li>

        {/* Step 2: Shipping */}
        <li className='flex items-center'>
          {step2 ? (
            <Link
              to='/shipping'
              className='flex items-center text-teal-600 dark:text-teal-500 hover:text-teal-800'
            >
              <span className='flex items-center justify-center w-5 h-5 mr-2 text-xs border border-teal-600 rounded-full dark:border-teal-500'>
                2
              </span>
              Shipping
            </Link>
          ) : (
            <span className='flex items-center text-gray-400 cursor-not-allowed'>
              <span className='flex items-center justify-center w-5 h-5 mr-2 text-xs border border-gray-400 rounded-full'>
                2
              </span>
              Shipping
            </span>
          )}
        </li>

        {/* Arrow */}
        <li className='flex items-center'>
          <svg
            className='w-3 h-3 mx-1 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M9 5l7 7-7 7'
            ></path>
          </svg>
        </li>

        {/* Step 3: Payment */}
        <li className='flex items-center'>
          {step3 ? (
            <Link
              to='/payment'
              className='flex items-center text-teal-600 dark:text-teal-500 hover:text-teal-800'
            >
              <span className='flex items-center justify-center w-5 h-5 mr-2 text-xs border border-teal-600 rounded-full dark:border-teal-500'>
                3
              </span>
              Payment
            </Link>
          ) : (
            <span className='flex items-center text-gray-400 cursor-not-allowed'>
              <span className='flex items-center justify-center w-5 h-5 mr-2 text-xs border border-gray-400 rounded-full'>
                3
              </span>
              Payment
            </span>
          )}
        </li>

        {/* Arrow */}
        <li className='flex items-center'>
          <svg
            className='w-3 h-3 mx-1 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M9 5l7 7-7 7'
            ></path>
          </svg>
        </li>

        {/* Step 4: Place Order */}
        <li className='flex items-center'>
          {step4 ? (
            <Link
              to='/placeorder'
              className='flex items-center text-teal-600 dark:text-teal-500 hover:text-teal-800'
            >
              <span className='flex items-center justify-center w-5 h-5 mr-2 text-xs border border-teal-600 rounded-full dark:border-teal-500'>
                4
              </span>
              Place Order
            </Link>
          ) : (
            <span className='flex items-center text-gray-400 cursor-not-allowed'>
              <span className='flex items-center justify-center w-5 h-5 mr-2 text-xs border border-gray-400 rounded-full'>
                4
              </span>
              Place Order
            </span>
          )}
        </li>
      </ol>
    </nav>
  );
};

export default CheckoutSteps;
