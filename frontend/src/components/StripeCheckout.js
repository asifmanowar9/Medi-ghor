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
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '12px',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
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
      <h3 className='checkout-title'>Pay with card</h3>
      <Form id='payment-form' onSubmit={handleSubmit}>
        <Form.Group className='mb-3'>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type='email'
            placeholder='email@example.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Card information</Form.Label>
          <div className='card-element-container'>
            <CardElement
              id='card-element'
              options={cardStyle}
              onChange={handleChange}
              className='card-element'
            />
            <div className='card-brands'>
              <img
                src='/images/card-brands.png'
                alt='Accepted cards'
                width='100'
              />
            </div>
          </div>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Cardholder name</Form.Label>
          <Form.Control type='text' placeholder='Full name on card' required />
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Country or region</Form.Label>
          <Form.Select aria-label='Country selection'>
            <option value='Bangladesh'>Bangladesh</option>
            <option value='US'>United States</option>
            <option value='CA'>Canada</option>
            <option value='GB'>United Kingdom</option>
            <option value='AU'>Australia</option>
            <option value='IN'>India</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className='mb-4'>
          <Form.Check
            type='checkbox'
            id='save-info'
            label='Securely save my information for 1-click checkout'
            checked={saveInfo}
            onChange={() => setSaveInfo(!saveInfo)}
          />
          <small className='text-muted d-block mt-1 ms-4'>
            Pay faster on New business sandbox and everywhere Link is accepted.
          </small>
        </Form.Group>

        <Button
          className='w-100 pay-button'
          disabled={processing || succeeded || !stripe}
          type='submit'
        >
          {processing ? (
            <>
              <Spinner
                as='span'
                animation='border'
                size='sm'
                role='status'
                aria-hidden='true'
                className='me-1'
              />
              Processing...
            </>
          ) : (
            `Pay BDT${totalPrice}`
          )}
        </Button>

        {message && (
          <div
            className={`mt-3 text-center message ${
              succeeded ? 'text-success' : 'text-danger'
            }`}
          >
            {message}
          </div>
        )}

        <div className='text-center mt-3'>
          <small className='text-muted'>Powered by Stripe</small>
        </div>
      </Form>
    </div>
  );
};

export default StripeCheckout;
