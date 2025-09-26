import React from 'react';
import { Link } from 'react-router-dom';

const Paginate = ({ pages, page, isAdmin = false, keyword = '' }) => {
  return (
    pages > 1 && (
      <div className='flex justify-center my-6'>
        <nav className='flex space-x-1' aria-label='Pagination'>
          {[...Array(pages).keys()].map((x) => (
            <Link
              key={x + 1}
              to={
                isAdmin
                  ? `/admin/productlist/${x + 1}`
                  : keyword
                  ? `/search/${keyword}/page/${x + 1}`
                  : `/page/${x + 1}`
              }
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                x + 1 === page
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {x + 1}
            </Link>
          ))}
        </nav>
      </div>
    )
  );
};

export default Paginate;
