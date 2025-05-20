import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { payOrder } from '../actions/orderActions';

const StripeCheckout = ({ orderId, totalPrice }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const getClientSecret = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
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
          color: '#32325d',
        },
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
          email_address: 'customer@example.com',
          payment_source: 'Stripe',
        })
      );

      setProcessing(false);
    }
  };

  return (
    <Form id='payment-form' onSubmit={handleSubmit}>
      <CardElement
        id='card-element'
        options={cardStyle}
        onChange={handleChange}
        className='mb-3 p-3 border'
      />
      <Button
        disabled={processing || succeeded || !stripe}
        id='submit'
        type='submit'
        className='btn-block'
      >
        {processing ? 'Processing...' : `Pay $${totalPrice}`}
      </Button>
      {message && <div className='mt-3 text-center text-danger'>{message}</div>}
    </Form>
  );
};

export default StripeCheckout;
