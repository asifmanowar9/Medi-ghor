import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Container, Card } from 'react-bootstrap';
import CheckoutSteps from '../components/CheckoutSteps';
import { savePaymentMethod } from '../actions/cartActions';
import './PaymentScreen.css';

const PaymentScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  if (!shippingAddress) {
    navigate('/shipping');
  }

  // Change default to Stripe
  const [paymentMethod, setPaymentMethod] = useState('Stripe');

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <div className='payment-screen-container'>
      <Container>
        <CheckoutSteps step1 step2 step3 />

        <Card className='payment-main-card'>
          <Card.Body className='p-4'>
            <h1 className='payment-title'>
              <i className='fas fa-credit-card me-3'></i>
              Payment Method
            </h1>

            <div className='payment-method-section'>
              <h3 className='section-title'>
                <i className='fas fa-wallet me-2'></i>
                Select Payment Method
              </h3>

              <Form onSubmit={submitHandler}>
                <div className='payment-method-options'>
                  {/* Stripe Payment Option */}
                  <div
                    className={`payment-option ${
                      paymentMethod === 'Stripe' ? 'selected' : ''
                    }`}
                    onClick={() => setPaymentMethod('Stripe')}
                  >
                    <div className='payment-option-content'>
                      <div className='payment-option-icon'>
                        <i className='fas fa-credit-card'></i>
                      </div>
                      <div className='payment-option-details'>
                        <h4 className='payment-option-title'>
                          Credit/Debit Card via Stripe
                        </h4>
                        <p className='payment-option-description'>
                          Pay securely with Visa, MasterCard, American Express,
                          and more
                        </p>
                      </div>
                      <div className='payment-radio'>
                        <input
                          type='radio'
                          id='Stripe'
                          name='paymentMethod'
                          value='Stripe'
                          checked={paymentMethod === 'Stripe'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <div className='radio-custom'></div>
                      </div>
                    </div>
                  </div>

                  {/* Cash on Delivery Option */}
                  <div
                    className={`payment-option ${
                      paymentMethod === 'CashOnDelivery' ? 'selected' : ''
                    }`}
                    onClick={() => setPaymentMethod('CashOnDelivery')}
                  >
                    <div className='payment-option-content'>
                      <div className='payment-option-icon'>
                        <i className='fas fa-money-bill-wave'></i>
                      </div>
                      <div className='payment-option-details'>
                        <h4 className='payment-option-title'>
                          Cash on Delivery
                        </h4>
                        <p className='payment-option-description'>
                          Pay when your order is delivered to your doorstep
                        </p>
                      </div>
                      <div className='payment-radio'>
                        <input
                          type='radio'
                          id='CashOnDelivery'
                          name='paymentMethod'
                          value='CashOnDelivery'
                          checked={paymentMethod === 'CashOnDelivery'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <div className='radio-custom'></div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button type='submit' className='continue-btn'>
                  <i className='fas fa-arrow-right me-2'></i>
                  Continue to Review Order
                </Button>

                {/* Security Notice */}
                <div className='security-notice'>
                  <div className='security-notice-icon'>
                    <i className='fas fa-certificate'></i>
                  </div>
                  <div className='security-notice-text'>
                    Your payment is protected by industry-standard encryption.
                    We never store your payment details on our servers.
                  </div>
                </div>
              </Form>
            </div>
          </Card.Body>
        </Card>

        {/* Payment Features - Horizontal layout below card */}
        <div className='payment-features-horizontal'>
          <Container>
            <div className='row g-3'>
              <div className='col-md-3 col-6'>
                <div className='feature-item-horizontal'>
                  <i className='fas fa-shield-alt'></i>
                  <span>256-bit SSL encrypted</span>
                </div>
              </div>
              <div className='col-md-3 col-6'>
                <div className='feature-item-horizontal'>
                  <i className='fas fa-lock'></i>
                  <span>Payment info never stored</span>
                </div>
              </div>
              <div className='col-md-3 col-6'>
                <div className='feature-item-horizontal'>
                  <i className='fas fa-undo'></i>
                  <span>Easy refunds & returns</span>
                </div>
              </div>
              <div className='col-md-3 col-6'>
                <div className='feature-item-horizontal'>
                  <i className='fas fa-headset'></i>
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </Container>
    </div>
  );
};

export default PaymentScreen;
