import React from 'react';

const Loader = () => {
  return (
    <div className='flex justify-center items-center py-8'>
      <div className='animate-spin rounded-full h-24 w-24 border-b-2 border-teal-600'></div>
      <span className='sr-only'>Loading...</span>
    </div>
  );
};

export default Loader;
