import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Image,
  Card,
  Button,
  Badge,
  Container,
  Form,
  Modal,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  getOrderDetails,
  updateOrderStatus,
  resetOrderCreate,
} from '../actions/orderActions';
import { ORDER_PAY_RESET } from '../constants/orderConstants';
import StripeCheckoutModal from '../components/StripeCheckoutModal';
import { hasAdminPrivileges, formatOrderId } from '../utils/orderUtils';
import './OrderScreen.css';

const OrderScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;

  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }

    if (!order || successPay || order._id !== id) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, navigate, order, id, successPay, userInfo]);

  const handleStatusUpdate = () => {
    const effectiveStatus = getEffectiveCurrentStatus();
    if (newStatus && newStatus !== effectiveStatus) {
      dispatch(updateOrderStatus(order._id, newStatus, statusNotes));
      setShowStatusModal(false);
      setNewStatus('');
      setStatusNotes('');
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: { label: 'Pending', variant: 'warning' },
      payment_confirmed: { label: 'Payment Confirmed', variant: 'info' },
      processing: { label: 'Processing', variant: 'primary' },
      shipped: { label: 'Shipped', variant: 'info' },
      out_for_delivery: { label: 'Out for Delivery', variant: 'warning' },
      delivered: { label: 'Delivered', variant: 'success' },
      cancelled: { label: 'Cancelled', variant: 'danger' },
    };
    return statusMap[status] || { label: status, variant: 'secondary' };
  };

  // Helper function to get effective current status (handles legacy orders)
  const getEffectiveCurrentStatus = () => {
    // If order has currentStatus, use it
    if (order.currentStatus) {
      return order.currentStatus;
    }

    // Fallback for legacy orders
    if (order.isDelivered) {
      return 'delivered';
    } else if (order.isPaid) {
      return 'processing';
    } else {
      return 'pending';
    }
  };

  // Helper function to get available status options with proper styling
  const getStatusOptions = () => {
    const currentStatus = getEffectiveCurrentStatus();
    const statusFlow = [
      'pending',
      'payment_confirmed',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
    ];

    const currentIndex = statusFlow.indexOf(currentStatus);

    const statusLabels = {
      pending: 'Pending',
      payment_confirmed: 'Payment Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };

    return Object.entries(statusLabels).map(([value, label]) => {
      const statusIndex = statusFlow.indexOf(value);
      const isCurrent = value === currentStatus;
      const isPast = statusIndex !== -1 && statusIndex < currentIndex;
      const isCancelled = value === 'cancelled';

      // Special rule: If current status is 'delivered', disable all other options
      // This prevents changing from delivered status to any other status
      const isDeliveredAndChanging =
        currentStatus === 'delivered' && value !== 'delivered';

      // Determine if this option should be disabled
      const isDisabled = isPast || isCurrent || isDeliveredAndChanging;

      // Create display label with indicators
      let displayLabel = label;
      if (isCurrent) {
        displayLabel = `${label} (Current)`;
      } else if (isPast) {
        displayLabel = `${label} (Completed)`;
      } else if (isDeliveredAndChanging) {
        displayLabel = `${label} (Cannot change from delivered)`;
      }

      return {
        value,
        label: displayLabel,
        disabled: isDisabled,
        isCurrent,
        isPast,
        isCancelled,
        isDeliveredAndChanging,
      };
    });
  };
  const getOrderStatus = () => {
    if (order.isPaid && order.isDelivered) {
      return {
        status: 'Completed',
        variant: 'success',
        icon: 'fas fa-check-circle',
      };
    } else if (order.isPaid && !order.isDelivered) {
      return { status: 'Processing', variant: 'warning', icon: 'fas fa-clock' };
    } else if (order.paymentMethod === 'CashOnDelivery') {
      return {
        status: 'Cash on Delivery',
        variant: 'info',
        icon: 'fas fa-money-bill-wave',
      };
    } else {
      return {
        status: 'Pending Payment',
        variant: 'danger',
        icon: 'fas fa-exclamation-circle',
      };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Function to format order ID for display consistently
  const formatOrderId = (orderId) => {
    if (!orderId) return '';
    return `#${orderId.substring(0, 8).toUpperCase()}`;
  };

  if (loading) {
    return (
      <Container fluid className='py-4'>
        <Loader />
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className='py-4'>
        <Message variant='danger'>{error}</Message>
      </Container>
    );
  }

  // If order is not yet loaded (undefined or empty), show loader to avoid rendering errors
  if (!order || Object.keys(order || {}).length === 0) {
    return (
      <Container fluid className='py-4'>
        <Loader />
      </Container>
    );
  }

  const itemsPrice =
    order.itemsPrice ||
    order.orderItems
      .reduce((acc, item) => acc + item.price * item.qty, 0)
      .toFixed(2);

  const orderStatus = getOrderStatus();

  return (
    <Container fluid className='py-4'>
      {/* Header Section */}
      <div className='mb-4'>
        <Row className='align-items-center mb-3'>
          <Col>
            <div className='d-flex align-items-center gap-3 mb-2'>
              <Button
                variant='outline-black'
                size='sm'
                onClick={() => navigate(-1)}
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#000000ff',
                }}
              >
                <i className='fas fa-arrow-left me-2'></i>
                Back
              </Button>
              <h2 className='text-black mb-0'>
                Order {formatOrderId(order._id)}
              </h2>
              <Badge
                bg={orderStatus.variant}
                className='d-flex align-items-center gap-1'
                style={{
                  fontSize: '0.85rem',
                  padding: '0.5rem 1rem',
                }}
              >
                <i className={orderStatus.icon}></i>
                {orderStatus.status}
              </Badge>
            </div>
            <p className='text-black mb-0'>
              <i className='fas fa-calendar me-2'></i>
              Placed on {formatDate(order.createdAt)}
            </p>
          </Col>
        </Row>
      </div>

      <Row className='g-4'>
        {/* Left Column - Order Details */}
        <Col lg={8}>
          {/* Customer & Shipping Information */}
          <Card
            className='order-card mb-4'
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '15px',
            }}
          >
            <Card.Body>
              <h5 className='text-black mb-3'>
                <i className='fas fa-shipping-fast me-2'></i>
                Shipping Information
              </h5>
              <Row className='g-3'>
                <Col md={6}>
                  <div className='info-section'>
                    <h6 style={{ color: '#000000' }}>
                      <i className='fas fa-user me-2'></i>
                      Customer Details
                    </h6>
                    <p className='mb-1' style={{ color: '#000000' }}>
                      <strong>Name:</strong> {order.user?.name || 'N/A'}
                    </p>
                    <p className='mb-0' style={{ color: '#000000' }}>
                      <strong>Email:</strong>{' '}
                      <a
                        href={`mailto:${order.user?.email}`}
                        style={{ color: '#17a2b8', textDecoration: 'none' }}
                      >
                        {order.user?.email || 'N/A'}
                      </a>
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className='info-section'>
                    <h6 style={{ color: '#000000' }}>
                      <i className='fas fa-map-marker-alt me-2'></i>
                      Delivery Address
                    </h6>
                    <p className='mb-0' style={{ color: '#000000' }}>
                      {order.shippingAddress?.address}
                      <br />
                      {order.shippingAddress?.city}{' '}
                      {order.shippingAddress?.postalCode}
                      <br />
                      {order.shippingAddress?.district},{' '}
                      {order.shippingAddress?.country}
                    </p>
                  </div>
                </Col>
              </Row>

              {/* Delivery Status */}
              <div className='mt-3'>
                <div
                  className='p-3 rounded'
                  style={{
                    background: order.isDelivered
                      ? 'rgba(40, 167, 69, 0.2)'
                      : 'rgba(255, 193, 7, 0.2)',
                    border: `2px solid ${
                      order.isDelivered ? '#28a745' : '#ffc107'
                    }`,
                  }}
                >
                  <div className='d-flex align-items-center'>
                    <i
                      className={`fas ${
                        order.isDelivered ? 'fa-check-circle' : 'fa-clock'
                      } ${
                        order.isDelivered ? 'text-success' : 'text-warning'
                      } me-3`}
                      style={{ fontSize: '1.5rem' }}
                    ></i>
                    <div>
                      <h6
                        className='mb-1'
                        style={{
                          color: order.isDelivered ? '#28a745' : '#856404',
                          fontWeight: '600',
                        }}
                      >
                        {order.isDelivered ? 'Delivered' : 'Pending Delivery'}
                      </h6>
                      <small className='text-black'>
                        {order.isDelivered
                          ? `Delivered on ${formatDate(order.deliveredAt)}`
                          : 'Your order will be delivered soon'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Payment Information */}
          <Card
            className='order-card mb-4'
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '15px',
            }}
          >
            <Card.Body>
              <h5 className='text-black mb-3'>
                <i className='fas fa-credit-card me-2'></i>
                Payment Information
              </h5>
              <Row>
                <Col md={6}>
                  <p className='mb-2' style={{ color: '#000000' }}>
                    <strong>Payment Method:</strong>{' '}
                    {order.paymentMethod || 'Not specified'}
                  </p>
                </Col>
              </Row>

              {/* Payment Status */}
              <div
                className='p-3 rounded'
                style={{
                  background: order.isPaid
                    ? 'rgba(40, 167, 69, 0.2)'
                    : order.paymentMethod === 'CashOnDelivery'
                    ? 'rgba(23, 162, 184, 0.2)'
                    : 'rgba(220, 53, 69, 0.2)',
                  border: `2px solid ${
                    order.isPaid
                      ? '#28a745'
                      : order.paymentMethod === 'CashOnDelivery'
                      ? '#17a2b8'
                      : '#dc3545'
                  }`,
                }}
              >
                <div className='d-flex align-items-center'>
                  <i
                    className={`fas ${
                      order.isPaid
                        ? 'fa-check-circle'
                        : order.paymentMethod === 'CashOnDelivery'
                        ? 'fa-money-bill-wave'
                        : 'fa-times-circle'
                    } ${
                      order.isPaid
                        ? 'text-success'
                        : order.paymentMethod === 'CashOnDelivery'
                        ? 'text-info'
                        : 'text-danger'
                    } me-3`}
                    style={{ fontSize: '1.5rem' }}
                  ></i>
                  <div>
                    <h6
                      className='mb-1'
                      style={{
                        color: order.isPaid
                          ? '#28a745'
                          : order.paymentMethod === 'CashOnDelivery'
                          ? '#17a2b8'
                          : '#dc3545',
                        fontWeight: '600',
                      }}
                    >
                      {order.isPaid
                        ? 'Payment Confirmed'
                        : order.paymentMethod === 'CashOnDelivery'
                        ? 'Cash on Delivery Order'
                        : 'Payment Pending'}
                    </h6>
                    <small className='text-black'>
                      {order.isPaid
                        ? `Paid on ${formatDate(order.paidAt)}`
                        : order.paymentMethod === 'CashOnDelivery'
                        ? 'Payment will be collected upon delivery'
                        : 'Payment is required to process your order'}
                    </small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Order Items */}
          <Card
            className='order-card'
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '15px',
            }}
          >
            <Card.Body>
              <h5 className='text-black mb-3'>
                <i className='fas fa-pills me-2'></i>
                Order Items ({order.orderItems?.length || 0})
              </h5>
              {order.orderItems?.length === 0 ? (
                <div className='text-center py-4'>
                  <i
                    className='fas fa-box-open text-muted mb-3'
                    style={{ fontSize: '3rem' }}
                  ></i>
                  <h6 className='text-white'>No items in this order</h6>
                </div>
              ) : (
                <div className='order-items-list'>
                  {order.orderItems.map((item, index) => (
                    <div
                      key={index}
                      className='order-item-card'
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Row className='align-items-center'>
                        <Col xs={3} md={2}>
                          <div className='product-image-container'>
                            <Image
                              src={
                                item.image?.startsWith('http')
                                  ? item.image
                                  : item.image?.startsWith('/uploads')
                                  ? item.image
                                  : item.image?.startsWith('/images')
                                  ? item.image
                                  : `/uploads/${item.image}`
                              }
                              alt={item.name}
                              className='product-image'
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                              }}
                            />
                          </div>
                        </Col>
                        <Col xs={9} md={6}>
                          <div>
                            <Link
                              to={`/product/${item.product}`}
                              style={{
                                color: '#000000',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '1rem',
                              }}
                              className='product-name-link'
                            >
                              {item.name}
                            </Link>
                            <div className='mt-1'>
                              <small className='text-black'>
                                <i className='fas fa-tag me-1'></i>
                                Unit Price: ৳
                                {parseFloat(item.price).toLocaleString()}
                              </small>
                            </div>
                          </div>
                        </Col>
                        <Col xs={12} md={4}>
                          <div className='text-md-end mt-2 mt-md-0'>
                            <div style={{ color: '#000000' }}>
                              <strong>
                                {item.qty} × ৳
                                {parseFloat(item.price).toLocaleString()} =
                                <span
                                  style={{
                                    color: '#28a745',
                                    fontSize: '1.1rem',
                                  }}
                                >
                                  ৳{(item.qty * item.price).toLocaleString()}
                                </span>
                              </strong>
                            </div>
                            <small className='text-muted'>
                              Quantity: {item.qty}
                            </small>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Order Summary */}
        <Col lg={4}>
          <Card
            className='order-summary-card'
            style={{
              background: 'linear-gradient(135deg, #2c3e50, #34495e)',
              backdropFilter: 'blur(15px)',
              border: '2px solid #3498db',
              borderRadius: '15px',
            }}
          >
            <Card.Body>
              <h5 style={{ color: '#000000', marginBottom: '1.5rem' }}>
                <i className='fas fa-calculator me-2'></i>
                Order Summary
              </h5>

              {/* Price Breakdown */}
              <div className='price-breakdown mb-4'>
                <div className='d-flex justify-content-between mb-2'>
                  <span style={{ color: '#000000' }}>Items Subtotal:</span>
                  <span style={{ color: '#000000', fontWeight: '500' }}>
                    ৳{parseFloat(itemsPrice).toLocaleString()}
                  </span>
                </div>
                <div className='d-flex justify-content-between mb-2'>
                  <span style={{ color: '#000000' }}>Shipping:</span>
                  <span style={{ color: '#000000', fontWeight: '500' }}>
                    {parseFloat(order.shippingPrice) === 0 ? (
                      <span style={{ color: '#28a745' }}>Free</span>
                    ) : (
                      `৳${parseFloat(order.shippingPrice).toLocaleString()}`
                    )}
                  </span>
                </div>
                <hr style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                <div className='d-flex justify-content-between'>
                  <span
                    style={{
                      color: '#000000',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                    }}
                  >
                    Total:
                  </span>
                  <span
                    style={{
                      color: '#28a745',
                      fontSize: '1.4rem',
                      fontWeight: '700',
                    }}
                  >
                    ৳{parseFloat(order.totalPrice).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Action */}
              {!order.isPaid && order.paymentMethod !== 'CashOnDelivery' && (
                <div className='mb-3'>
                  {loadingPay ? (
                    <div className='text-center py-3'>
                      <Loader />
                    </div>
                  ) : (
                    <Button
                      className='w-100'
                      size='lg'
                      onClick={() => setShowPaymentModal(true)}
                      style={{
                        background: 'linear-gradient(135deg, #28a745, #20c997)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '1rem',
                        fontWeight: '600',
                        fontSize: '1.1rem',
                      }}
                    >
                      <i className='fas fa-credit-card me-2'></i>
                      Pay Now - ৳{parseFloat(order.totalPrice).toLocaleString()}
                    </Button>
                  )}
                </div>
              )}

              {/* Cash on Delivery Notice */}
              {!order.isPaid && order.paymentMethod === 'CashOnDelivery' && (
                <div className='mb-3'>
                  <div
                    className='p-3 rounded text-center'
                    style={{
                      background: 'rgba(23, 162, 184, 0.2)',
                      border: '2px solid #17a2b8',
                      borderRadius: '10px',
                    }}
                  >
                    <i
                      className='fas fa-money-bill-wave text-info mb-2'
                      style={{ fontSize: '2rem' }}
                    ></i>
                    <h6 style={{ color: '#17a2b8', fontWeight: '600' }}>
                      Cash on Delivery
                    </h6>
                    <p className='mb-0' style={{ color: '#000000' }}>
                      You will pay ৳
                      {parseFloat(order.totalPrice).toLocaleString()} when your
                      order is delivered
                    </p>
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {hasAdminPrivileges(userInfo) && (
                <div className='admin-actions'>
                  <h6 style={{ color: '#000000', marginBottom: '1rem' }}>
                    <i className='fas fa-user-shield me-2'></i>
                    Admin Actions
                  </h6>

                  {/* Current Status Display */}
                  <div className='mb-3'>
                    <small className='text-muted'>Current Status:</small>
                    <div>
                      <Badge
                        bg={
                          getStatusDisplay(getEffectiveCurrentStatus()).variant
                        }
                        className='me-2'
                      >
                        {getStatusDisplay(getEffectiveCurrentStatus()).label}
                      </Badge>
                    </div>
                  </div>

                  {/* Update Status Button */}
                  <div className='mb-2'>
                    <Button
                      variant='primary'
                      onClick={() => setShowStatusModal(true)}
                      className='w-100'
                      style={{
                        background: 'linear-gradient(135deg, #2E86AB, #A23B72)',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                      }}
                    >
                      <i className='fas fa-edit me-2'></i>
                      Update Order Status
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stripe Checkout Modal */}
      <StripeCheckoutModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderId={order._id}
        totalPrice={order.totalPrice}
      />

      {/* Status Update Modal */}
      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        centered
        className='status-modal'
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className='fas fa-edit me-2'></i>
            Update Order Status
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label style={{ color: '#ffffff', fontWeight: '600' }}>
                Current Status
              </Form.Label>
              <div className='current-status-display'>
                <div className='d-flex align-items-center'>
                  <Badge
                    bg={getStatusDisplay(getEffectiveCurrentStatus()).variant}
                    className='me-2'
                    style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}
                  >
                    <i className='fas fa-circle me-2'></i>
                    {getStatusDisplay(getEffectiveCurrentStatus()).label}
                  </Badge>
                  <small className='text-white' style={{ opacity: 0.9 }}>
                    This is the current order status
                  </small>
                </div>
              </div>
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label style={{ color: '#ffffff', fontWeight: '600' }}>
                New Status
              </Form.Label>
              <Form.Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value=''>Select new status...</option>
                {getStatusOptions().map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    style={{
                      backgroundColor: option.isCurrent
                        ? '#e7f3ff'
                        : option.isPast
                        ? '#f8f9fa'
                        : option.isDeliveredAndChanging
                        ? '#ffe6e6'
                        : 'white',
                      color: option.disabled ? '#6c757d' : 'black',
                      fontWeight: option.isCurrent ? 'bold' : 'normal',
                    }}
                  >
                    {option.label}
                  </option>
                ))}
              </Form.Select>
              <small
                className='status-help-text d-block'
                style={{ color: '#b8c5d1' }}
              >
                <i className='fas fa-info-circle me-1'></i>
                {getEffectiveCurrentStatus() === 'delivered'
                  ? 'Orders marked as delivered cannot be changed to other statuses.'
                  : 'You can only move forward in the order process or cancel the order.'}
              </small>
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label style={{ color: '#ffffff', fontWeight: '600' }}>
                Notes (Optional)
              </Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder='Add any notes about this status update...'
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={handleStatusUpdate}
            disabled={!newStatus || newStatus === getEffectiveCurrentStatus()}
          >
            <i className='fas fa-save me-2'></i>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderScreen;
