import React, { useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import { addToCart, removeFromCart } from '../actions/cartActions';
import { useCartAuth } from '../hooks/useCartAuth';

const CartScreen = () => {
  const { id: productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useCartAuth();

  // Parse quantity from URL search params
  const qty = new URLSearchParams(location.search).get('qty')
    ? Number(new URLSearchParams(location.search).get('qty'))
    : 1;

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  useEffect(() => {
    if (productId) {
      dispatch(addToCart(productId, qty));
    }
  }, [dispatch, productId, qty]);

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=shipping');
  };

  // Update the image source logic:
  const getImagePath = (image) => {
    if (image.startsWith('http')) return image;
    if (image.startsWith('/uploads')) return image;
    if (image.startsWith('/images')) return image;
    return `/uploads/${image}`;
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Cart Items Section */}
        <div className='lg:col-span-2'>
          <h1 className='text-3xl font-bold text-gray-900 mb-8'>
            Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 text-center'>
              <div className='text-blue-800'>
                <p className='mb-4'>Your cart is empty</p>
                <Link
                  to='/'
                  className='inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200'
                >
                  <svg
                    className='w-5 h-5 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M10 19l-7-7m0 0l7-7m-7 7h18'
                    />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
              {cartItems.map((item, index) => (
                <div
                  key={item.product}
                  className={`p-6 ${
                    index !== cartItems.length - 1
                      ? 'border-b border-gray-200'
                      : ''
                  }`}
                >
                  <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
                    {/* Product Image */}
                    <div className='flex-shrink-0'>
                      <img
                        src={getImagePath(item.image)}
                        alt={item.name}
                        className='w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg'
                      />
                    </div>

                    {/* Product Details */}
                    <div className='flex-grow min-w-0'>
                      <Link
                        to={`/product/${item.product}`}
                        className='text-lg font-medium text-gray-900 hover:text-teal-600 transition-colors duration-200'
                      >
                        {item.name}
                      </Link>
                      <p className='text-xl font-semibold text-teal-600 mt-1'>
                        BDT {item.price}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className='flex items-center gap-3'>
                      <label
                        htmlFor={`qty-${item.product}`}
                        className='text-sm font-medium text-gray-700'
                      >
                        Qty:
                      </label>
                      <select
                        id={`qty-${item.product}`}
                        value={item.qty}
                        onChange={(e) =>
                          dispatch(
                            addToCart(item.product, Number(e.target.value))
                          )
                        }
                        className='border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
                      >
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Remove Button */}
                    <button
                      type='button'
                      onClick={() => removeFromCartHandler(item.product)}
                      className='p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200'
                      aria-label='Remove item'
                    >
                      <svg
                        className='w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary Section */}
        <div className='lg:col-span-1'>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Order Summary
            </h2>

            <div className='space-y-4'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>
                  Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
                </span>
                <span className='font-medium'>
                  BDT{' '}
                  {cartItems
                    .reduce((acc, item) => acc + item.qty * item.price, 0)
                    .toFixed(2)}
                </span>
              </div>

              <div className='border-t border-gray-200 pt-4'>
                <div className='flex justify-between text-lg font-semibold'>
                  <span>Total</span>
                  <span className='text-teal-600'>
                    BDT{' '}
                    {cartItems
                      .reduce((acc, item) => acc + item.qty * item.price, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type='button'
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                  cartItems.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'
                }`}
              >
                Proceed To Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;
