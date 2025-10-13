import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  Alert,
  InputGroup,
  Modal,
} from 'react-bootstrap';
import { addToCart, removeFromCart } from '../actions/cartActions';
import { resetOrderCreate } from '../actions/orderActions';
import { useCartAuth } from '../hooks/useCartAuth';
import '../styles/CartScreen.css';

const CartScreen = () => {
  const { id: productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useCartAuth();

  // Local state for modals and interactions
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Parse quantity from URL search params
  const qty = new URLSearchParams(location.search).get('qty')
    ? Number(new URLSearchParams(location.search).get('qty'))
    : 1;

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  useEffect(() => {
    if (productId) {
      dispatch(addToCart(productId, qty));
    }
  }, [dispatch, productId, qty]);

  const handleRemoveConfirmation = (item) => {
    setItemToRemove(item);
    setShowRemoveModal(true);
  };

  const confirmRemoveFromCart = () => {
    if (itemToRemove) {
      dispatch(removeFromCart(itemToRemove.product));
      setShowRemoveModal(false);
      setItemToRemove(null);
    }
  };

  const cancelRemove = () => {
    setShowRemoveModal(false);
    setItemToRemove(null);
  };

  const handleQuantityChange = async (productId, newQty) => {
    setIsLoading(true);
    try {
      await dispatch(addToCart(productId, newQty));
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkoutHandler = () => {
    // Reset any previous order state when starting new checkout
    dispatch(resetOrderCreate());
    navigate('/login?redirect=shipping');
  };

  const continueShopping = () => {
    navigate('/products');
  };

  // Update the image source logic:
  const getImagePath = (image) => {
    if (image.startsWith('http')) return image;
    if (image.startsWith('/uploads')) return image;
    if (image.startsWith('/images')) return image;
    return `/uploads/${image}`;
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  );
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // Calculate delivery fee - free for orders above 1000, otherwise 150
  const deliveryFee = subtotal > 1000 ? 0 : 150;
  const finalTotal = subtotal + deliveryFee;

  return (
    <div className='cart-screen'>
      <Container fluid className='px-3 px-lg-5'>
        {/* Page Header */}
        <div className='cart-header'>
          <Row className='align-items-center'>
            <Col>
              <div className='d-flex align-items-center mb-3'>
                <Button
                  variant='outline-secondary'
                  size='sm'
                  onClick={() => navigate(-1)}
                  className='me-3'
                >
                  <i
                    style={{ color: 'white' }}
                    className='fas fa-arrow-left me-2'
                  ></i>
                  <span style={{ color: 'white' }}>Back</span>
                </Button>
                <div>
                  <h1 className='cart-title'>
                    <i className='fas fa-shopping-cart me-3'></i>
                    <span style={{ color: 'white' }}>Your Cart</span>
                  </h1>
                  <p className='cart-subtitle'>
                    Review your selected medicines and proceed to checkout
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className='empty-cart-container'>
            <Card className='empty-cart-card'>
              <Card.Body className='text-center py-5'>
                <div className='empty-cart-icon mb-4'>
                  <i className='fas fa-shopping-cart'></i>
                </div>
                <h3 style={{ color: 'white' }} className='empty-cart-title'>
                  Your cart is empty
                </h3>
                <p style={{ color: 'white' }} className='empty-cart-subtitle'>
                  Looks like you haven't added any medicines to your cart yet.
                  <br />
                  Explore our wide range of authentic medicines and health
                  products.
                </p>
                <div className='empty-cart-actions'>
                  <Button
                    variant='primary'
                    size='lg'
                    onClick={continueShopping}
                    className='me-3'
                  >
                    <i className='fas fa-pills me-2'></i>
                    Browse Medicines
                  </Button>
                  <Link to='/' className='btn btn-outline-secondary btn-lg'>
                    <i className='fas fa-home me-2'></i>
                    Go Home
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <Row>
            {/* Cart Items */}
            <Col lg={8}>
              <Card className='cart-items-card mb-4'>
                <Card.Header className='cart-items-header'>
                  <div className='d-flex justify-content-between align-items-center'>
                    <h5 className='mb-0'>
                      <i className='fas fa-list me-2'></i>
                      Cart Items
                    </h5>
                    <Badge bg='primary' className='items-count-badge'>
                      {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body className='p-0'>
                  {cartItems.map((item, index) => (
                    <div
                      key={item.product}
                      className={`cart-item ${
                        index !== cartItems.length - 1 ? 'border-bottom' : ''
                      }`}
                    >
                      <Row className='align-items-center g-3'>
                        {/* Product Image */}
                        <Col xs={12} sm={3} md={2}>
                          <div className='cart-item-image'>
                            <img
                              src={getImagePath(item.image)}
                              alt={item.name}
                              className='img-fluid'
                            />
                          </div>
                        </Col>

                        {/* Product Info */}
                        <Col xs={12} sm={9} md={6}>
                          <div className='cart-item-info'>
                            <Link
                              to={`/product/${item.product}`}
                              className='cart-item-title'
                            >
                              {item.name}
                            </Link>
                            <div className='cart-item-details'>
                              <span className='cart-item-price'>
                                ৳{item.price.toFixed(2)} each
                              </span>
                              {item.brand && (
                                <span className='cart-item-brand'>
                                  <i className='fas fa-industry me-1'></i>
                                  {item.brand}
                                </span>
                              )}
                            </div>
                            {item.countInStock < 10 && (
                              <Alert
                                variant='warning'
                                className='stock-warning mb-0 mt-2'
                              >
                                <i className='fas fa-exclamation-triangle me-1'></i>
                                Only {item.countInStock} left in stock
                              </Alert>
                            )}
                          </div>
                        </Col>

                        {/* Quantity Controls */}
                        <Col xs={6} md={2}>
                          <div className='quantity-controls'>
                            <label className='quantity-label'>Quantity</label>
                            <InputGroup size='sm'>
                              <Button
                                variant='outline-secondary'
                                disabled={item.qty <= 1 || isLoading}
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product,
                                    item.qty - 1
                                  )
                                }
                              >
                                <i className='fas fa-minus'></i>
                              </Button>
                              <Form.Control
                                type='number'
                                min='1'
                                max={item.countInStock}
                                value={item.qty}
                                disabled={isLoading}
                                onChange={(e) => {
                                  const newQty = parseInt(e.target.value) || 1;
                                  if (
                                    newQty >= 1 &&
                                    newQty <= item.countInStock &&
                                    newQty !== item.qty
                                  ) {
                                    handleQuantityChange(item.product, newQty);
                                  }
                                }}
                                onBlur={(e) => {
                                  const newQty = parseInt(e.target.value) || 1;
                                  const validQty = Math.max(
                                    1,
                                    Math.min(item.countInStock, newQty)
                                  );
                                  if (validQty !== item.qty) {
                                    handleQuantityChange(
                                      item.product,
                                      validQty
                                    );
                                  }
                                }}
                                className='text-center'
                                style={{ fontSize: '0.9rem' }}
                              />
                              <Button
                                variant='outline-secondary'
                                disabled={
                                  item.qty >= Math.min(item.countInStock, 12) ||
                                  isLoading
                                }
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product,
                                    item.qty + 1
                                  )
                                }
                              >
                                <i className='fas fa-plus'></i>
                              </Button>
                            </InputGroup>
                          </div>
                        </Col>

                        {/* Total Price and Actions */}
                        <Col xs={6} md={2}>
                          <div className='cart-item-actions'>
                            <div className='item-total-price'>
                              ৳{(item.qty * item.price).toFixed(2)}
                            </div>
                            <Button
                              variant='outline-danger'
                              size='sm'
                              onClick={() => handleRemoveConfirmation(item)}
                              className='remove-btn'
                            >
                              <i className='fas fa-trash me-1'></i>
                              Remove
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>

            {/* Order Summary */}
            <Col lg={4}>
              <Card className='order-summary-card'>
                <Card.Header className='order-summary-header'>
                  <h5 className='mb-0'>
                    <i className='fas fa-receipt me-2'></i>
                    Order Summary
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className='order-summary-details'>
                    <div className='summary-row'>
                      <span style={{ color: 'white' }}>
                        Items ({totalItems})
                      </span>
                      <span style={{ color: 'white' }}>
                        ৳{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className='summary-row'>
                      <span style={{ color: 'white' }}>Delivery</span>
                      {deliveryFee === 0 ? (
                        <span
                          className='text-success'
                          style={{ color: '#28a745' }}
                        >
                          <i className='fas fa-shipping-fast me-1'></i>
                          FREE
                        </span>
                      ) : (
                        <span style={{ color: 'white' }}>
                          ৳{deliveryFee.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {deliveryFee > 0 && (
                      <div className='delivery-notice mt-2'>
                        <small style={{ color: '#ffc107' }}>
                          <i className='fas fa-info-circle me-1'></i>
                          Add ৳{(1000 - subtotal).toFixed(2)} more for FREE
                          delivery!
                        </small>
                      </div>
                    )}
                    <hr className='summary-divider' />
                    <div className='summary-row total-row'>
                      <strong style={{ color: 'white', fontSize: '1.2rem' }}>
                        Total
                      </strong>
                      <strong
                        className='total-amount'
                        style={{ color: '#e74c3c', fontSize: '1.4rem' }}
                      >
                        ৳{finalTotal.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <div className='checkout-section'>
                    <Button
                      variant='primary'
                      size='lg'
                      className='checkout-btn w-100 mb-3'
                      onClick={checkoutHandler}
                    >
                      <i className='fas fa-credit-card me-2'></i>
                      Proceed to Checkout
                    </Button>
                    <Button
                      variant='outline-secondary'
                      className='continue-shopping-btn w-100'
                      onClick={continueShopping}
                    >
                      <i className='fas fa-plus me-2'></i>
                      <span style={{ color: 'white' }}>Continue Shopping</span>
                    </Button>
                  </div>

                  <div className='trust-badges mt-4'>
                    <Row className='text-center'>
                      <Col xs={4}>
                        <div className='trust-badge'>
                          <i className='fas fa-shield-alt'></i>
                          <small>Secure</small>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div className='trust-badge'>
                          <i className='fas fa-truck'></i>
                          <small>Fast Delivery</small>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div className='trust-badge'>
                          <i className='fas fa-certificate'></i>
                          <small>Authentic</small>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Remove Confirmation Modal */}
        <Modal show={showRemoveModal} onHide={cancelRemove} centered>
          <Modal.Header closeButton className='remove-modal-header'>
            <Modal.Title>
              <i className='fas fa-exclamation-triangle text-warning me-2'></i>
              Remove Item
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {itemToRemove && (
              <div className='remove-confirmation'>
                <p>Are you sure you want to remove this item from your cart?</p>
                <div className='removing-item-preview'>
                  <img
                    src={getImagePath(itemToRemove.image)}
                    alt={itemToRemove.name}
                    className='removing-item-image'
                  />
                  <div className='removing-item-details'>
                    <h6>{itemToRemove.name}</h6>
                    <p className='text-muted'>Quantity: {itemToRemove.qty}</p>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant='outline-secondary' onClick={cancelRemove}>
              Keep in Cart
            </Button>
            <Button variant='danger' onClick={confirmRemoveFromCart}>
              <i className='fas fa-trash me-1'></i>
              Remove Item
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default CartScreen;
