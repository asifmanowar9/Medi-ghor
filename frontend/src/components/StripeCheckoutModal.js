import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import StripeProvider from './StripeProvider';
import StripeCheckout from './StripeCheckout';

const StripeCheckoutModal = ({ orderId, totalPrice, show, onClose }) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size='lg'
      backdrop='static'
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Complete Your Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body className='p-0'>
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
      </Modal.Body>
    </Modal>
  );
};

export default StripeCheckoutModal;
