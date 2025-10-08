import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Container, Image } from 'react-bootstrap';
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import { createOrder, resetOrderCreate } from '../actions/orderActions';
import { useNavigate } from 'react-router-dom';
import './PlaceOrderScreen.css';

const PlaceOrderScreen = () => {
  const cart = useSelector((state) => state.cart);
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  // Calculate prices

  cart.itemsPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );

  cart.shippingAddress = cart.shippingAddress ? cart.shippingAddress : {};
  cart.shippingPrice = addDecimals(cart.itemsPrice > 1000 ? 0 : 150);
  cart.taxPrice = 0;

  cart.totalPrice = addDecimals(
    Number(cart.itemsPrice) + Number(cart.shippingPrice)
  );

  const orderCreate = useSelector((state) => state.orderCreate);
  const { order, success, error, loading } = orderCreate;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset order state when component mounts
  useEffect(() => {
    dispatch(resetOrderCreate());
  }, [dispatch]);

  // Reset order state when component unmounts (cleanup)
  useEffect(() => {
    return () => {
      dispatch(resetOrderCreate());
    };
  }, [dispatch]);

  useEffect(() => {
    // Check if user is logged in
    if (!userInfo) {
      navigate('/login?redirect=/placeorder');
      return;
    }

    if (success) {
      setIsSubmitting(false);
      navigate(`/order/${order._id}`);
    }
    if (error) {
      setIsSubmitting(false);
    }
  }, [success, order, navigate, error, userInfo]);

  const placeOrderHandler = () => {
    // Prevent multiple submissions
    if (isSubmitting || loading) {
      return;
    }

    // Check if user is logged in
    if (!userInfo) {
      navigate('/login?redirect=/placeorder');
      return;
    }

    setIsSubmitting(true);
    console.log('Placing order with user:', userInfo._id);
    console.log('Order data:', {
      orderItems: cart.cartItems,
      shippingAddress: cart.shippingAddress,
      paymentMethod: cart.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    dispatch(
      createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      })
    );
  };

  return (
    <div className='place-order-container'>
      <Container>
        <CheckoutSteps step1 step2 step3 step4 />

        <div className='place-order-header'>
          <h1 className='page-title'>
            <i className='fas fa-clipboard-check me-3'></i>
            Review Your Order
          </h1>
          <p className='page-subtitle'>
            Please review your order details before placing your order
          </p>
        </div>

        <Row className='g-4'>
          <Col lg={8}>
            <div className='order-details-section'>
              {/* Shipping Information */}
              <div className='info-card'>
                <div className='card-header'>
                  <h3>
                    <i className='fas fa-shipping-fast me-2'></i>
                    Shipping Information
                  </h3>
                </div>
                <div className='card-content'>
                  <div className='address-info'>
                    <div className='address-line'>
                      <i className='fas fa-map-marker-alt me-2'></i>
                      <span>
                        {cart.shippingAddress.address},{' '}
                        {cart.shippingAddress.city}{' '}
                        {cart.shippingAddress.postalCode},{' '}
                        {cart.shippingAddress.country}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className='info-card'>
                <div className='card-header'>
                  <h3>
                    <i className='fas fa-credit-card me-2'></i>
                    Payment Method
                  </h3>
                </div>
                <div className='card-content'>
                  <div className='payment-info'>
                    <div className='payment-method-badge'>
                      <i
                        className={`fas ${
                          cart.paymentMethod === 'Stripe'
                            ? 'fa-credit-card'
                            : 'fa-money-bill-wave'
                        } me-2`}
                      ></i>
                      <span>
                        {cart.paymentMethod === 'Stripe'
                          ? 'Credit/Debit Card via Stripe'
                          : 'Cash on Delivery'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className='info-card'>
                <div className='card-header'>
                  <h3>
                    <i className='fas fa-shopping-bag me-2'></i>
                    Order Items ({cart.cartItems.length})
                  </h3>
                </div>
                <div className='card-content'>
                  {cart.cartItems.length === 0 ? (
                    <div className='empty-cart'>
                      <i className='fas fa-shopping-cart'></i>
                      <p>Your cart is empty</p>
                    </div>
                  ) : (
                    <div className='order-items-list'>
                      {cart.cartItems.map((item, index) => (
                        <div key={index} className='order-item'>
                          <div className='item-image'>
                            <Image
                              src={
                                item.image.startsWith('http')
                                  ? item.image
                                  : item.image.startsWith('/uploads')
                                  ? item.image
                                  : item.image.startsWith('/images')
                                  ? item.image
                                  : `/uploads/${item.image}`
                              }
                              alt={item.name}
                              className='product-image'
                            />
                          </div>
                          <div className='item-details'>
                            <Link
                              to={`/product/${item.product}`}
                              className='item-name'
                            >
                              {item.name}
                            </Link>
                            <div className='item-quantity'>Qty: {item.qty}</div>
                          </div>
                          <div className='item-price'>
                            <div className='unit-price'>BDT {item.price}</div>
                            <div className='total-price'>
                              BDT {(item.qty * item.price).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>

          <Col lg={4}>
            <div className='order-summary-card'>
              <div className='summary-header'>
                <h3>
                  <i className='fas fa-calculator me-2'></i>
                  Order Summary
                </h3>
              </div>

              <div className='summary-content'>
                <div className='summary-row'>
                  <span className='label'>Items ({cart.cartItems.length})</span>
                  <span className='value'>BDT {cart.itemsPrice}</span>
                </div>

                <div className='summary-row'>
                  <span className='label'>
                    <i className='fas fa-truck me-1'></i>
                    Shipping
                  </span>
                  <span className='value'>BDT {cart.shippingPrice}</span>
                </div>

                <div className='summary-divider'></div>

                <div className='summary-row total-row'>
                  <span className='label'>Total Amount</span>
                  <span className='value total-amount'>
                    BDT {cart.totalPrice}
                  </span>
                </div>

                {error && (
                  <div className='error-message'>
                    <Message variant='danger'>{error}</Message>
                  </div>
                )}

                <Button
                  type='button'
                  className='place-order-btn'
                  disabled={
                    cart.cartItems.length === 0 || isSubmitting || loading
                  }
                  onClick={placeOrderHandler}
                >
                  {isSubmitting || loading ? (
                    <>
                      <i className='fas fa-spinner fa-spin me-2'></i>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <i className='fas fa-credit-card me-2'></i>
                      Place Order
                      <i className='fas fa-arrow-right ms-2'></i>
                    </>
                  )}
                </Button>

                <div className='security-badges'>
                  <div className='badge-item'>
                    <i className='fas fa-shield-alt'></i>
                    <span>Secure Payment</span>
                  </div>
                  <div className='badge-item'>
                    <i className='fas fa-lock'></i>
                    <span>256-bit SSL</span>
                  </div>
                  <div className='badge-item'>
                    <i className='fas fa-undo'></i>
                    <span>Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PlaceOrderScreen;
