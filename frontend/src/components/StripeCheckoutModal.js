import React, { useEffect } from 'react';
import StripeProvider from './StripeProvider';
import StripeCheckout from './StripeCheckout';

const StripeCheckoutModal = ({ orderId, totalPrice, show, onClose }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.keyCode === 27) {
        // Escape key - don't close on escape for this modal
        return;
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'></div>

      {/* Modal */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div className='relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-lg'>
          {/* Modal Header */}
          <div className='bg-gray-50 px-6 py-4 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Complete Your Payment
              </h3>
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-md p-1'
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className='p-6'>
            <StripeProvider>
              <StripeCheckout
                orderId={orderId}
                totalPrice={totalPrice}
                onSuccess={() => {
                  // Wait a moment to show success message before closing
                  setTimeout(() => {
                    onClose();
                  }, 2000);
                }}
              />
            </StripeProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckoutModal;
