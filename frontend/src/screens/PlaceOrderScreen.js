import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import { createOrder } from '../actions/orderActions';
import { useNavigate } from 'react-router-dom';

const PlaceOrderScreen = () => {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  // Calculate prices
  cart.itemsPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );

  cart.shippingAddress = cart.shippingAddress ? cart.shippingAddress : {};
  cart.shippingPrice = addDecimals(cart.itemsPrice > 999 ? 0 : 100);
  cart.taxPrice = addDecimals(Number(cart.itemsPrice) * 0.15);

  cart.totalPrice = addDecimals(
    Number(cart.itemsPrice) + Number(cart.shippingPrice) + Number(cart.taxPrice)
  );

  const orderCreate = useSelector((state) => state.orderCreate);
  const { order, success, error } = orderCreate;

  useEffect(() => {
    if (success) {
      navigate(`/order/${order._id}`);
    }
  }, [success, order, navigate]);

  const placeOrderHandler = () => {
    dispatch(
      createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      })
    );
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <CheckoutSteps step1 step2 step3 step4 />

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Order Details */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Shipping Information */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Shipping Address
              </h2>
              <div className='text-gray-700'>
                <p className='font-medium mb-2'>Delivery Address:</p>
                <p className='text-sm'>
                  {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                  {cart.shippingAddress.postalCode},{' '}
                  {cart.shippingAddress.country}
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Payment Method
              </h2>
              <div className='flex items-center'>
                <div className='flex items-center justify-center w-8 h-8 bg-teal-100 rounded-full mr-3'>
                  <svg
                    className='w-4 h-4 text-teal-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                    />
                  </svg>
                </div>
                <span className='text-gray-700 font-medium'>
                  {cart.paymentMethod}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Order Items
              </h2>
              {cart.cartItems.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                <div className='space-y-4'>
                  {cart.cartItems.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-4 ${
                        index !== cart.cartItems.length - 1
                          ? 'pb-4 border-b border-gray-200'
                          : ''
                      }`}
                    >
                      <div className='flex-shrink-0'>
                        <img
                          src={
                            item.image.startsWith('http')
                              ? item.image
                              : item.image.startsWith('/uploads')
                              ? item.image
                              : item.image.startsWith('/images')
                              ? item.image
                              : `/uploads/${item.image}`
                          }
                          alt={item.name}
                          className='w-16 h-16 object-cover rounded-lg'
                        />
                      </div>
                      <div className='flex-grow min-w-0'>
                        <Link
                          to={`/product/${item.product}`}
                          className='text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors duration-200'
                        >
                          {item.name}
                        </Link>
                      </div>
                      <div className='text-sm text-gray-700'>
                        <span className='font-medium'>
                          {item.qty} × BDT {item.price} = BDT{' '}
                          {(item.qty * item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-6'>
                Order Summary
              </h2>

              <div className='space-y-4'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Items</span>
                  <span className='font-medium'>BDT {cart.itemsPrice}</span>
                </div>

                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Shipping</span>
                  <span className='font-medium'>BDT {cart.shippingPrice}</span>
                </div>

                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Tax (15%)</span>
                  <span className='font-medium'>BDT {cart.taxPrice}</span>
                </div>

                <div className='border-t border-gray-200 pt-4'>
                  <div className='flex justify-between text-lg font-semibold'>
                    <span>Total</span>
                    <span className='text-teal-600'>BDT {cart.totalPrice}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className='mt-4'>
                  <Message variant='danger'>{error}</Message>
                </div>
              )}

              <button
                type='button'
                disabled={cart.cartItems.length === 0}
                onClick={placeOrderHandler}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                  cart.cartItems.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'
                }`}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderScreen;
