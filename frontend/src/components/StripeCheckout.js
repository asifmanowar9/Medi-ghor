import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { payOrder } from '../actions/orderActions';
import './StripeCheckout.css';

const StripeCheckout = ({ orderId, totalPrice, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [succeeded, setSucceeded] = useState(false);
  const [email, setEmail] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const getClientSecret = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        setEmail(userInfo.email || ''); // Pre-fill email if available

        const { data } = await axios.post(
          '/api/stripe/create-payment-intent',
          { orderId },
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setMessage(error.response?.data?.message || error.message);
      }
    };

    if (orderId) {
      getClientSecret();
    }
  }, [orderId]);

  const cardStyle = {
    style: {
      base: {
        color: '#2c3e50',
        fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        fontWeight: '500',
        '::placeholder': {
          color: 'rgba(44, 62, 80, 0.5)',
        },
        padding: '16px 20px',
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#e74c3c',
        iconColor: '#e74c3c',
      },
      complete: {
        color: '#27ae60',
        iconColor: '#27ae60',
      },
    },
  };

  const handleChange = (event) => {
    setMessage(event.error ? event.error.message : '');
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          email: email,
        },
      },
    });

    if (payload.error) {
      setMessage(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
    } else {
      setMessage('Payment succeeded!');
      setSucceeded(true);

      // Call the action to update the order as paid
      dispatch(
        payOrder(orderId, {
          id: payload.paymentIntent.id,
          status: payload.paymentIntent.status,
          update_time: new Date().toISOString(),
          email_address: email,
          payment_source: 'Stripe',
        })
      );

      setProcessing(false);

      // Call onSuccess callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
    }
  };

  return (
    <div className='stripe-checkout-container'>
      <div className='checkout-header'>
        <div className='payment-amount-card'>
          <div className='amount-label'>Total Amount</div>
          <div className='amount-value'>BDT {totalPrice}</div>
          <div className='payment-secure'>
            <i className='fas fa-shield-alt me-2'></i>
            Secure Payment with Stripe
          </div>
        </div>
      </div>

      <Form id='payment-form' onSubmit={handleSubmit} className='payment-form'>
        <div className='form-section'>
          <h4 className='section-title'>
            <i className='fas fa-envelope me-2'></i>
            Contact Information
          </h4>
          <Form.Group className='form-group'>
            <Form.Label className='form-label'>Email Address</Form.Label>
            <div className='input-wrapper'>
              {/* <i className='fas fa-envelope input-icon'></i> */}
              <Form.Control
                type='email'
                placeholder='your@email.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='modern-input'
                required
              />
            </div>
          </Form.Group>
        </div>

        <div className='form-section'>
          <h4 className='section-title'>
            <i className='fas fa-credit-card me-2'></i>
            Payment Information
          </h4>

          <Form.Group className='form-group'>
            <Form.Label className='form-label'>Card Details</Form.Label>
            <div className='card-element-container'>
              <CardElement
                id='card-element'
                options={cardStyle}
                onChange={handleChange}
                className='card-element'
              />
              <div className='card-brands'>
                <div className='brand-icons'>
                  <i className='fab fa-cc-visa'></i>
                  <i className='fab fa-cc-mastercard'></i>
                  <i className='fab fa-cc-amex'></i>
                  <i className='fab fa-cc-discover'></i>
                </div>
              </div>
            </div>
          </Form.Group>

          <Form.Group className='form-group'>
            <Form.Label className='form-label'>Cardholder Name</Form.Label>
            <div className='input-wrapper'>
              {/* <i className='fas fa-user input-icon'></i> */}
              <Form.Control
                type='text'
                placeholder='Full name on card'
                className='modern-input'
                required
              />
            </div>
          </Form.Group>

          <Form.Group className='form-group'>
            <Form.Label className='form-label'>Country or Region</Form.Label>
            <div className='input-wrapper'>
              {/* <i className='fas fa-globe input-icon'></i> */}
              <Form.Select
                className='modern-select'
                aria-label='Country selection'
              >
                <option value='Bangladesh'>🇧🇩 Bangladesh</option>
                <option value='US'>🇺🇸 United States</option>
                <option value='CA'>🇨🇦 Canada</option>
                <option value='GB'>🇬🇧 United Kingdom</option>
                <option value='AU'>🇦🇺 Australia</option>
                <option value='IN'>🇮🇳 India</option>
              </Form.Select>
            </div>
          </Form.Group>
        </div>

        <div className='form-section'>
          <div className='save-info-section'>
            <Form.Group className='form-group'>
              <Form.Check
                type='checkbox'
                id='save-info'
                className='custom-checkbox'
                checked={saveInfo}
                onChange={() => setSaveInfo(!saveInfo)}
                label={
                  <span className='checkbox-label'>
                    <i className='fas fa-save me-2'></i>
                    Securely save my information for faster checkout
                  </span>
                }
              />
              <small className='checkbox-description'>
                Your payment info is encrypted and never stored on our servers
              </small>
            </Form.Group>
          </div>
        </div>

        <div className='payment-actions'>
          <Button
            className='pay-button'
            disabled={processing || succeeded || !stripe}
            type='submit'
          >
            {processing ? (
              <>
                <i className='fas fa-spinner fa-spin me-2'></i>
                Processing Payment...
              </>
            ) : succeeded ? (
              <>
                <i className='fas fa-check-circle me-2'></i>
                Payment Successful!
              </>
            ) : (
              <>
                <i className='fas fa-credit-card me-2'></i>
                Pay BDT {totalPrice}
                <i className='fas fa-arrow-right ms-2'></i>
              </>
            )}
          </Button>

          {message && (
            <div
              className={`payment-message ${succeeded ? 'success' : 'error'}`}
            >
              <i
                className={`fas ${
                  succeeded ? 'fa-check-circle' : 'fa-exclamation-triangle'
                } me-2`}
              ></i>
              {message}
            </div>
          )}
        </div>

        <div className='security-footer'>
          <div className='security-badges'>
            <div className='security-badge'>
              <i className='fas fa-shield-alt'></i>
              <span>256-bit SSL</span>
            </div>
            <div className='security-badge'>
              <i className='fas fa-lock'></i>
              <span>PCI Compliant</span>
            </div>
            <div className='security-badge'>
              <i className='fab fa-stripe'></i>
              <span>Powered by Stripe</span>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default StripeCheckout;
