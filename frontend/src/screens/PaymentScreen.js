import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { savePaymentMethod } from '../actions/cartActions';

const PaymentScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  if (!shippingAddress) {
    navigate('/shipping');
  }

  // Change default to Stripe
  const [paymentMethod, setPaymentMethod] = useState('Stripe');

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-md mx-auto'>
        <CheckoutSteps step1 step2 step3 />

        <div className='bg-white rounded-lg shadow-md p-8'>
          <h1 className='text-2xl font-bold text-gray-900 text-center mb-8'>
            Payment Method
          </h1>

          <form onSubmit={submitHandler} className='space-y-6'>
            <fieldset>
              <legend className='text-lg font-medium text-gray-900 mb-4'>
                Select Payment Method
              </legend>

              <div className='space-y-4'>
                <div className='flex items-center'>
                  <input
                    id='Stripe'
                    name='paymentMethod'
                    type='radio'
                    value='Stripe'
                    checked={paymentMethod === 'Stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className='h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300'
                  />
                  <label htmlFor='Stripe' className='ml-3 flex items-center'>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        Stripe Credit/Debit Card
                      </p>
                      <p className='text-xs text-gray-500'>
                        Secure payment processing with Stripe
                      </p>
                    </div>
                    <div className='ml-4 flex space-x-2'>
                      <svg
                        className='h-6 w-auto'
                        viewBox='0 0 40 24'
                        fill='none'
                      >
                        <rect width='40' height='24' rx='4' fill='#0066cc' />
                        <path d='M8 8h24v8H8z' fill='#fff' />
                      </svg>
                      <svg
                        className='h-6 w-auto'
                        viewBox='0 0 40 24'
                        fill='none'
                      >
                        <rect width='40' height='24' rx='4' fill='#cc0000' />
                        <path d='M12 10h16v4H12z' fill='#fff' />
                      </svg>
                    </div>
                  </label>
                </div>

                {/* Additional payment methods can be added here */}
                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-gray-300' />
                  </div>
                  <div className='relative flex justify-center text-sm'>
                    <span className='px-2 bg-white text-gray-500'>
                      More payment methods coming soon
                    </span>
                  </div>
                </div>
              </div>
            </fieldset>

            <div className='pt-4'>
              <button
                type='submit'
                className='w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200'
              >
                Continue to Review Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;
