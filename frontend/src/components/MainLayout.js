import React from 'react';
import CategorySidebar from './CategorySidebar';

const MainLayout = ({ children, showSidebar = true }) => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='flex'>
        {showSidebar && (
          <div className='hidden lg:block lg:w-80 flex-shrink-0'>
            <CategorySidebar />
          </div>
        )}

        <main className={`flex-1 ${showSidebar ? 'lg:ml-0' : ''}`}>
          {children}
        </main>
      </div>

      {/* Mobile sidebar - always rendered for mobile access */}
      {showSidebar && <CategorySidebar />}
    </div>
  );
};

export default MainLayout;
