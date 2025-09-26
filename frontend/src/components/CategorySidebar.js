import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CategorySidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    {
      name: 'Medicine & Drugs',
      icon: '💊',
      subcategories: [
        'Prescription Drugs',
        'OTC Medicines',
        'Herbal Medicine',
        'Ayurvedic',
      ],
    },
    {
      name: 'Health & Wellness',
      icon: '🏥',
      subcategories: [
        'Vitamins & Supplements',
        'Protein & Nutrition',
        'Health Monitors',
        'First Aid',
      ],
    },
    {
      name: 'Personal Care',
      icon: '🧴',
      subcategories: ['Skin Care', 'Hair Care', 'Oral Care', 'Body Care'],
    },
    {
      name: 'Baby & Mother Care',
      icon: '👶',
      subcategories: ['Baby Food', 'Diapers', 'Baby Care', 'Mother Care'],
    },
    {
      name: 'Healthcare Devices',
      icon: '🩺',
      subcategories: [
        'Blood Pressure Monitors',
        'Thermometers',
        'Glucometers',
        'Nebulizers',
      ],
    },
    {
      name: 'Sexual Wellness',
      icon: '💗',
      subcategories: ['Condoms', 'Personal Lubricants', 'Wellness Products'],
    },
    {
      name: 'Fitness & Sports',
      icon: '💪',
      subcategories: [
        'Protein Supplements',
        'Sports Equipment',
        'Energy Drinks',
      ],
    },
    {
      name: 'Mental Wellness',
      icon: '🧠',
      subcategories: ['Stress Relief', 'Sleep Aids', 'Mood Support'],
    },
  ];

  return (
    <>
      {/* Mobile Category Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='lg:hidden fixed bottom-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors'
      >
        <i className='fas fa-th-list'></i>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40'
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:z-auto lg:transform-none overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className='p-4'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-lg font-bold text-gray-800'>Categories</h2>
            <button
              onClick={() => setIsOpen(false)}
              className='lg:hidden text-gray-500 hover:text-gray-700'
            >
              <i className='fas fa-times'></i>
            </button>
          </div>

          {/* Categories List */}
          <nav className='space-y-2'>
            {categories.map((category, index) => (
              <div key={index} className='group'>
                <Link
                  to={`/products?category=${category.name
                    .toLowerCase()
                    .replace(/ & /g, '-')
                    .replace(/ /g, '-')}`}
                  className='flex items-center w-full p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group'
                  onClick={() => setIsOpen(false)}
                >
                  <span className='text-lg mr-3'>{category.icon}</span>
                  <span className='font-medium flex-1'>{category.name}</span>
                  <i className='fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity'></i>
                </Link>

                {/* Subcategories - shown on hover */}
                <div className='hidden lg:block absolute left-80 top-0 w-64 bg-white shadow-lg rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-60'>
                  <h3 className='font-bold text-gray-800 mb-3'>
                    {category.name}
                  </h3>
                  <div className='space-y-2'>
                    {category.subcategories.map((sub, subIndex) => (
                      <Link
                        key={subIndex}
                        to={`/products?category=${sub
                          .toLowerCase()
                          .replace(/ /g, '-')}`}
                        className='block text-sm text-gray-600 hover:text-blue-600 py-1 hover:bg-blue-50 px-2 rounded transition-colors'
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Special Offers Section */}
          <div className='mt-8 p-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg text-white'>
            <h3 className='font-bold mb-2'>Special Offers</h3>
            <p className='text-sm mb-3 opacity-90'>
              Get up to 50% off on selected items
            </p>
            <Link
              to='/offers'
              className='inline-block bg-white text-gray-800 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors'
              onClick={() => setIsOpen(false)}
            >
              View Deals
            </Link>
          </div>

          {/* Need Help Section */}
          <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
            <h3 className='font-bold text-gray-800 mb-2'>Need Help?</h3>
            <p className='text-sm text-gray-600 mb-3'>
              Contact our pharmacy experts
            </p>
            <Link
              to='/contact'
              className='inline-block text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors'
              onClick={() => setIsOpen(false)}
            >
              Get Support →
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CategorySidebar;
