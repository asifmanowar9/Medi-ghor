import React, { useState } from 'react';

const SearchBox = () => {
  const [keyword, setKeyword] = useState('');

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      // Navigate to the search results page with the keyword
      window.location.href = `/search/${keyword}`;
    } else {
      // If no keyword, navigate to the home page
      window.location.href = '/';
    }
  };

  return (
    <form onSubmit={submitHandler} className='w-64'>
      <div className='relative flex'>
        <input
          type='text'
          name='q'
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              submitHandler(e);
            }
          }}
          placeholder='Search products...'
          aria-label='Search Products'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className='w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        />
        <button
          type='submit'
          className='px-4 py-2 bg-green-600 text-white border border-green-600 rounded-r-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200'
        >
          <i className='fas fa-search'></i>
        </button>
      </div>
    </form>
  );
};

export default SearchBox;
