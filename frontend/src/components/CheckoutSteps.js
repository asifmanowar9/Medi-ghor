import React from 'react';
import './CheckoutSteps.css';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  const steps = [
    {
      id: 'signin',
      title: 'Sign In',
      icon: 'fas fa-user',
      completed: step1,
      current: step1 && !step2,
    },
    {
      id: 'shipping',
      title: 'Shipping',
      icon: 'fas fa-shipping-fast',
      completed: step2,
      current: step2 && !step3,
    },
    {
      id: 'payment',
      title: 'Payment',
      icon: 'fas fa-credit-card',
      completed: step3,
      current: step3 && !step4,
    },
    {
      id: 'placeorder',
      title: 'Place Order',
      icon: 'fas fa-check-circle',
      completed: step4,
      current: step4,
    },
  ];

  return (
    <div className='checkout-steps-container'>
      <div className='checkout-steps'>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={`checkout-step ${
                step.completed
                  ? 'active'
                  : step.current
                  ? 'current'
                  : 'disabled'
              }`}
            >
              <div className='step-icon'>
                {step.completed && !step.current ? (
                  <i className='fas fa-check'></i>
                ) : (
                  <i className={step.icon}></i>
                )}
              </div>
              <span className='step-text'>{step.title}</span>
            </div>

            {/* Step separator - don't show after last step */}
            {index < steps.length - 1 && (
              <div
                className={`step-separator ${
                  step.completed ? 'completed' : ''
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CheckoutSteps;
