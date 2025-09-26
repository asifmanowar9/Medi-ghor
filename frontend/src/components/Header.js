import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../actions/userActions';
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaFileAlt,
} from 'react-icons/fa';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const logoutHandler = () => {
    dispatch(logout());
    setIsUserDropdownOpen(false);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${searchQuery}`);
      setSearchQuery('');
    }
  };

  const categories = [
    'Medicine',
    'Vitamins',
    'Personal Care',
    'Baby Care',
    'Health Devices',
    'First Aid',
  ];

  return (
    <header className='bg-white shadow-sm border-b sticky top-0 z-50'>
      {/* Main Header */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <Link to='/' className='flex items-center space-x-2'>
            <div className='w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center'></div>
            <span className='text-2xl font-bold text-gray-900'>Medi-ghor</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className='hidden md:flex flex-1 max-w-lg mx-8'>
            <form onSubmit={submitHandler} className='flex w-full'>
              <div className='flex w-full'>
                <select className='px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-sm'>
                  <option>All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
                <input
                  type='text'
                  placeholder='Search for medicines, health products...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='flex-1 px-4 py-2 border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500'
                />
                <button
                  type='submit'
                  className='px-6 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
                >
                  <FaSearch />
                </button>
              </div>
            </form>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center space-x-6'>
            {/* AI Test Reports - Hidden on mobile */}
            <Link
              to={userInfo ? '/chats' : '/login?redirect=/chats'}
              className='hidden md:flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors'
            >
              <FaFileAlt className='text-lg' />
              <span className='text-sm font-medium'>AI Test Reports</span>
            </Link>

            {/* Cart */}
            <Link to='/cart' className='relative'>
              <div className='flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors'>
                <FaShoppingCart className='text-xl' />
                <span className='hidden sm:inline text-sm font-medium'>
                  Cart
                </span>
                {cartItemsCount > 0 && (
                  <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                    {cartItemsCount}
                  </span>
                )}
              </div>
            </Link>

            {/* User Account */}
            <div className='relative'>
              {userInfo ? (
                <div>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className='flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors'
                  >
                    <FaUser className='text-lg' />
                    <span className='hidden sm:inline text-sm font-medium'>
                      {userInfo.name}
                    </span>
                  </button>

                  {isUserDropdownOpen && (
                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border'>
                      <Link
                        to='/profile'
                        className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={logoutHandler}
                        className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to='/login'
                  className='flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors'
                >
                  <FaUser className='text-lg' />
                  <span className='hidden sm:inline text-sm font-medium'>
                    Sign In
                  </span>
                </Link>
              )}
            </div>

            {/* Admin Dropdown */}
            {userInfo && userInfo.isAdmin && (
              <div className='relative'>
                <button
                  onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                  className='text-sm font-medium text-gray-700 hover:text-green-600 transition-colors'
                >
                  Admin
                </button>

                {isAdminDropdownOpen && (
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border'>
                    <Link
                      to='/admin/userlist'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      onClick={() => setIsAdminDropdownOpen(false)}
                    >
                      Users
                    </Link>
                    <Link
                      to='/admin/productlist'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      onClick={() => setIsAdminDropdownOpen(false)}
                    >
                      Products
                    </Link>
                    <Link
                      to='/admin/orderlist'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      onClick={() => setIsAdminDropdownOpen(false)}
                    >
                      Orders
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='md:hidden text-gray-700 hover:text-green-600'
            >
              {isMenuOpen ? (
                <FaTimes className='text-xl' />
              ) : (
                <FaBars className='text-xl' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className='md:hidden pb-3'>
          <form onSubmit={submitHandler} className='flex'>
            <input
              type='text'
              placeholder='Search medicines...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500'
            />
            <button
              type='submit'
              className='px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700'
            >
              <FaSearch />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='md:hidden bg-white border-t'>
          <div className='px-4 py-2 space-y-2'>
            <Link
              to={userInfo ? '/chats' : '/login?redirect=/chats'}
              className='block py-2 text-gray-700 hover:text-green-600'
              onClick={() => setIsMenuOpen(false)}
            >
              AI Test Reports
            </Link>
            {userInfo && userInfo.isAdmin && (
              <>
                <Link
                  to='/admin/userlist'
                  className='block py-2 text-gray-700 hover:text-green-600'
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin - Users
                </Link>
                <Link
                  to='/admin/productlist'
                  className='block py-2 text-gray-700 hover:text-green-600'
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin - Products
                </Link>
                <Link
                  to='/admin/orderlist'
                  className='block py-2 text-gray-700 hover:text-green-600'
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin - Orders
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
