import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { saveShippingAddress } from '../actions/cartActions';

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress.address);
  const [city, setCity] = useState(shippingAddress.city);
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode);
  const [country, setCountry] = useState(shippingAddress.country);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    navigate('/payment');
  };

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-md mx-auto'>
        <CheckoutSteps step1 step2 />

        <div className='bg-white rounded-lg shadow-md p-8'>
          <h1 className='text-2xl font-bold text-gray-900 text-center mb-8'>
            Shipping Address
          </h1>

          <form onSubmit={submitHandler} className='space-y-6'>
            <div>
              <label
                htmlFor='address'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Address *
              </label>
              <input
                id='address'
                type='text'
                placeholder='Enter your full address'
                value={address}
                required
                onChange={(e) => setAddress(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
              />
            </div>

            <div>
              <label
                htmlFor='city'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                City
              </label>
              <input
                id='city'
                type='text'
                placeholder='Enter city'
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
              />
            </div>

            <div>
              <label
                htmlFor='postalCode'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Postal Code
              </label>
              <input
                id='postalCode'
                type='text'
                placeholder='Enter postal code'
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
              />
            </div>

            <div>
              <label
                htmlFor='country'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Country
              </label>
              <input
                id='country'
                type='text'
                placeholder='Enter country'
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
              />
            </div>

            <button
              type='submit'
              className='w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200'
            >
              Continue to Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShippingScreen;
