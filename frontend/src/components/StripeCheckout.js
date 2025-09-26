import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { payOrder } from '../actions/orderActions';

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
  const [cardholderName, setCardholderName] = useState('');
  const [country, setCountry] = useState('Bangladesh');

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
        color: '#374151',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#9CA3AF',
        },
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444',
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
          name: cardholderName,
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
    <div className='max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 text-center mb-2'>
          Secure Payment
        </h3>
        <p className='text-sm text-gray-600 text-center'>
          Complete your purchase with Stripe
        </p>
      </div>

      <form id='payment-form' onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Email
          </label>
          <input
            id='email'
            type='email'
            placeholder='email@example.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Card information
          </label>
          <div className='relative border border-gray-300 rounded-md p-3 bg-gray-50'>
            <CardElement
              id='card-element'
              options={cardStyle}
              onChange={handleChange}
              className='bg-transparent'
            />
            <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
              <div className='flex space-x-1'>
                <svg className='w-6 h-4' viewBox='0 0 40 24' fill='none'>
                  <rect width='40' height='24' rx='4' fill='#1434CB' />
                  <path d='M8 8h24v8H8z' fill='#fff' />
                </svg>
                <svg className='w-6 h-4' viewBox='0 0 40 24' fill='none'>
                  <rect width='40' height='24' rx='4' fill='#EB001B' />
                  <path d='M12 10h16v4H12z' fill='#fff' />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor='cardholder-name'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Cardholder name
          </label>
          <input
            id='cardholder-name'
            type='text'
            placeholder='Full name on card'
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            required
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
          />
        </div>

        <div>
          <label
            htmlFor='country'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Country or region
          </label>
          <select
            id='country'
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
          >
            <option value='Bangladesh'>Bangladesh</option>
            <option value='US'>United States</option>
            <option value='CA'>Canada</option>
            <option value='GB'>United Kingdom</option>
            <option value='AU'>Australia</option>
            <option value='IN'>India</option>
          </select>
        </div>

        <div className='flex items-start'>
          <input
            type='checkbox'
            id='save-info'
            checked={saveInfo}
            onChange={() => setSaveInfo(!saveInfo)}
            className='mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded'
          />
          <div className='ml-3'>
            <label htmlFor='save-info' className='text-sm text-gray-700'>
              Securely save my information for 1-click checkout
            </label>
            <p className='text-xs text-gray-500 mt-1'>
              Pay faster on future purchases
            </p>
          </div>
        </div>

        <button
          disabled={processing || succeeded || !stripe}
          type='submit'
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
            processing || succeeded || !stripe
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'
          }`}
        >
          {processing ? (
            <div className='flex items-center justify-center'>
              <svg
                className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              Processing...
            </div>
          ) : (
            `Pay BDT ${totalPrice}`
          )}
        </button>

        {message && (
          <div
            className={`text-center text-sm ${
              succeeded
                ? 'text-green-600 bg-green-50'
                : 'text-red-600 bg-red-50'
            } p-3 rounded-md`}
          >
            {message}
          </div>
        )}

        <div className='text-center'>
          <p className='text-xs text-gray-500 flex items-center justify-center'>
            Secured by
            <svg className='ml-1 h-4 w-16' viewBox='0 0 60 25' fill='#6B7280'>
              <path d='M2.88 19.6h4.32c.48 0 .96-.12 1.32-.36.36-.24.6-.6.6-1.08 0-.48-.24-.84-.6-1.08-.36-.24-.84-.36-1.32-.36H4.8v-2.4h2.4c1.08 0 1.92.24 2.52.72.6.48.9 1.14.9 1.98 0 .84-.3 1.5-.9 1.98-.6.48-1.44.72-2.52.72H2.88v-2.12zm8.4 2.12V15.2h1.68c1.08 0 1.92.24 2.52.72.6.48.9 1.14.9 1.98 0 .84-.3 1.5-.9 1.98-.6.48-1.44.72-2.52.72h-1.68zm1.68-1.32c.48 0 .84-.12 1.08-.36.24-.24.36-.6.36-1.08s-.12-.84-.36-1.08c-.24-.24-.6-.36-1.08-.36h-.36v2.88h.36zm5.52 1.32V15.2h1.32v5.22h2.76v1.32h-4.08zm7.08 0V15.2h1.32v2.16h2.16V15.2h1.32v6.54h-1.32v-2.88h-2.16v2.88h-1.32zm7.56 0V15.2h4.08v1.32h-2.76v1.2h2.52v1.32h-2.52v1.38h2.76v1.32h-4.08z' />
            </svg>
          </p>
        </div>
      </form>
    </div>
  );
};

export default StripeCheckout;
