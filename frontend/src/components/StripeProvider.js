import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import Loader from './Loader';

const StripeProvider = ({ children }) => {
  const [stripeApiKey, setStripeApiKey] = useState('');

  useEffect(() => {
    const getStripeApiKey = async () => {
      try {
        const { data } = await axios.get('/api/config/stripe');
        setStripeApiKey(data.publishableKey);
      } catch (error) {
        console.error('Failed to load Stripe API key', error);
      }
    };
    getStripeApiKey();
  }, []);

  const stripeOptions = {
    fonts: [
      {
        cssSrc:
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap',
      },
    ],
  };

  return stripeApiKey ? (
    <Elements stripe={loadStripe(stripeApiKey)} options={stripeOptions}>
      {children}
    </Elements>
  ) : (
    <Loader />
  );
};

export default StripeProvider;
