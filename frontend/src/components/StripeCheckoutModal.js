import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import StripeProvider from './StripeProvider';
import StripeCheckout from './StripeCheckout';
import './StripeCheckout.css';

const StripeCheckoutModal = ({ orderId, totalPrice, show, onClose }) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size='lg'
      backdrop='static'
      keyboard={false}
      className='stripe-modal'
    >
      <div className='stripe-modal-content'>
        <div className='stripe-modal-header'>
          <h2 className='stripe-modal-title'>
            <i className='fas fa-credit-card me-3'></i>
            Complete Your Payment
          </h2>
          <button className='stripe-close-btn' onClick={onClose} type='button'>
            <i className='fas fa-times'></i>
          </button>
        </div>
        <div className='stripe-modal-body'>
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
    </Modal>
  );
};

export default StripeCheckoutModal;
