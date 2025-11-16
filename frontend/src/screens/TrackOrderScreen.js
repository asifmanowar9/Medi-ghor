import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  Badge,
  Alert,
  ProgressBar,
  Image,
} from 'react-bootstrap';
import {
  getOrderDetails,
  trackOrder,
  resetOrderDetails,
} from '../actions/orderActions';
import Message from '../components/Message';
import Loader from '../components/Loader';
import './TrackOrderScreen.css';

const TrackOrderScreen = () => {
  const [trackingId, setTrackingId] = useState('');
  const [searchAttempted, setSearchAttempted] = useState(false);

  const { id: urlOrderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { loading, order, error } = orderDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (urlOrderId && urlOrderId.trim().length > 0) {
      setTrackingId(urlOrderId);
      dispatch(trackOrder(urlOrderId));
      setSearchAttempted(true);
    } else {
      // Clear any previous order data when no ID is provided
      dispatch(resetOrderDetails());
      setSearchAttempted(false);
    }
  }, [dispatch, urlOrderId]);

  // Function to format order ID for display consistently
  const formatOrderId = (orderId) => {
    if (!orderId) return '';
    // Use first 8 characters for consistency
    return `#${orderId.substring(0, 8).toUpperCase()}`;
  };

  const validateOrderId = (id) => {
    // Remove any spaces and special characters except alphanumeric
    const cleanId = id.replace(/[^a-zA-Z0-9]/g, '');
    return cleanId.length >= 4; // At least 4 characters for meaningful search
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const cleanId = trackingId.trim().replace(/[^a-zA-Z0-9]/g, '');

    if (cleanId && validateOrderId(cleanId)) {
      dispatch(trackOrder(cleanId));
      setSearchAttempted(true);
      navigate(`/track-order/${cleanId}`);
    } else {
      setSearchAttempted(true);
      // This will trigger an error display
    }
  };

  const getOrderStatus = () => {
    if (!order) return null;

    // Use new status system if available
    if (order.currentStatus) {
      const statusMap = {
        pending: {
          status: 'pending',
          label: 'Payment Pending',
          progress: 20,
          color: 'danger',
          icon: 'fas fa-clock',
          message: 'Please complete your payment to process this order.',
        },
        payment_confirmed: {
          status: 'payment_confirmed',
          label: 'Payment Confirmed',
          progress: 40,
          color: 'info',
          icon: 'fas fa-credit-card',
          message: 'Payment received. Your order is being prepared.',
        },
        processing: {
          status: 'processing',
          label: 'Processing & Preparing',
          progress: 60,
          color: 'warning',
          icon: 'fas fa-box',
          message:
            'Your medicines are being carefully prepared and quality checked.',
        },
        shipped: {
          status: 'shipped',
          label: 'Shipped',
          progress: 80,
          color: 'info',
          icon: 'fas fa-shipping-fast',
          message: 'Your order has been shipped and is on the way!',
        },
        out_for_delivery: {
          status: 'out_for_delivery',
          label: 'Out for Delivery',
          progress: 90,
          color: 'info',
          icon: 'fas fa-truck',
          message: 'Your order is on the way to your delivery address!',
        },
        delivered: {
          status: 'delivered',
          label: 'Successfully Delivered',
          progress: 100,
          color: 'success',
          icon: 'fas fa-check-circle',
          message: 'Your order has been delivered successfully!',
        },
        cancelled: {
          status: 'cancelled',
          label: 'Order Cancelled',
          progress: 0,
          color: 'danger',
          icon: 'fas fa-times-circle',
          message: 'This order has been cancelled.',
        },
      };

      return statusMap[order.currentStatus] || statusMap.pending;
    }

    // Legacy status logic (fallback)
    if (order.isDelivered) {
      return {
        status: 'delivered',
        label: 'Successfully Delivered',
        progress: 100,
        color: 'success',
        icon: 'fas fa-check-circle',
        message: 'Your order has been delivered successfully!',
      };
    } else if (order.isPaid) {
      // Check if it's been more than 2 days since payment - might be shipped
      const daysSincePayment =
        (Date.now() - new Date(order.paidAt).getTime()) / (1000 * 60 * 60 * 24);

      if (daysSincePayment > 2) {
        return {
          status: 'shipped',
          label: 'Out for Delivery',
          progress: 80,
          color: 'info',
          icon: 'fas fa-truck',
          message: 'Your order is on the way to your delivery address!',
        };
      } else {
        return {
          status: 'processing',
          label: 'Processing & Preparing',
          progress: 60,
          color: 'warning',
          icon: 'fas fa-box',
          message:
            'Your medicines are being carefully prepared and quality checked.',
        };
      }
    } else {
      return {
        status: 'pending',
        label: 'Payment Pending',
        progress: 20,
        color: 'danger',
        icon: 'fas fa-clock',
        message: 'Please complete your payment to process this order.',
      };
    }
  };

  const getTimelineSteps = () => {
    if (!order) return [];

    // Use new status history if available, otherwise fall back to legacy logic
    if (order.statusHistory && order.statusHistory.length > 0) {
      const statusMap = {
        pending: {
          title: 'Order Placed',
          description: 'Order confirmed and received',
          icon: 'fas fa-shopping-cart',
        },
        payment_confirmed: {
          title: 'Payment Confirmed',
          description: `Payment of ৳${order.totalPrice} received via ${order.paymentMethod}`,
          icon: 'fas fa-credit-card',
        },
        processing: {
          title: 'Order Processing',
          description: 'Your medicines are being prepared and quality checked',
          icon: 'fas fa-box-open',
        },
        shipped: {
          title: 'Shipped',
          description: 'Package prepared and dispatched from our facility',
          icon: 'fas fa-shipping-fast',
        },
        out_for_delivery: {
          title: 'Out for Delivery',
          description: 'Package was dispatched and on the way to your location',
          icon: 'fas fa-truck',
        },
        delivered: {
          title: 'Delivered',
          description: `Successfully delivered to ${
            order.shippingAddress?.address || 'delivery address'
          }`,
          icon: 'fas fa-check-circle',
        },
        cancelled: {
          title: 'Cancelled',
          description: 'Order has been cancelled',
          icon: 'fas fa-times-circle',
        },
      };

      // Convert status history to timeline steps
      const completedStatuses = order.statusHistory.map(
        (status) => status.status
      );
      const allStatuses = [
        'pending',
        'payment_confirmed',
        'processing',
        'shipped',
        'out_for_delivery',
        'delivered',
      ];

      const timelineSteps = allStatuses
        .map((status) => {
          const statusInfo = statusMap[status];
          const historyItem = order.statusHistory.find(
            (h) => h.status === status
          );
          const isCompleted = completedStatuses.includes(status);

          return {
            ...statusInfo,
            status: status,
            date: historyItem?.timestamp,
            completed: isCompleted,
            notes: historyItem?.notes,
          };
        })
        .filter((step) => {
          // For cancelled orders, only show the cancelled status
          if (order.currentStatus === 'cancelled') {
            return step.status === 'cancelled';
          }

          // For non-cancelled orders, only show normal flow statuses
          // Exclude cancelled status from normal flow
          if (step.status === 'cancelled') {
            return false;
          }

          // Only show steps up to current status + next step
          const currentIndex = allStatuses.indexOf(order.currentStatus);
          const stepIndex = allStatuses.indexOf(step.status);
          return stepIndex <= currentIndex + 1;
        });

      // If the order is cancelled, add the cancelled step separately
      if (order.currentStatus === 'cancelled') {
        const cancelledHistoryItem = order.statusHistory.find(
          (h) => h.status === 'cancelled'
        );

        return [
          {
            ...statusMap.cancelled,
            status: 'cancelled',
            date: cancelledHistoryItem?.timestamp,
            completed: true,
            notes: cancelledHistoryItem?.notes,
          },
        ];
      }

      return timelineSteps;
    }

    // Legacy timeline logic (fallback)
    const orderDate = new Date(order.createdAt);
    const paymentDate = order.paidAt ? new Date(order.paidAt) : null;
    const deliveredDate = order.deliveredAt
      ? new Date(order.deliveredAt)
      : null;

    // Calculate estimated dates based on order status
    const estimatedProcessingDate = paymentDate
      ? new Date(paymentDate.getTime() + 24 * 60 * 60 * 1000)
      : null; // +1 day
    const estimatedShippingDate = paymentDate
      ? new Date(paymentDate.getTime() + 2 * 24 * 60 * 60 * 1000)
      : null; // +2 days
    const estimatedDeliveryDate = paymentDate
      ? new Date(paymentDate.getTime() + 5 * 24 * 60 * 60 * 1000)
      : null; // +5 days

    const steps = [
      {
        title: 'Order Placed',
        description: `Order confirmed and received at ${orderDate.toLocaleTimeString()}`,
        date: order.createdAt,
        completed: true,
        icon: 'fas fa-shopping-cart',
      },
      {
        title: 'Payment Confirmed',
        description: order.isPaid
          ? `Payment of ৳${order.totalPrice} received via ${order.paymentMethod}`
          : `Awaiting payment of ৳${order.totalPrice} via ${order.paymentMethod}`,
        date: order.paidAt,
        completed: order.isPaid,
        icon: 'fas fa-credit-card',
      },
      {
        title: 'Order Processing',
        description: order.isPaid
          ? 'Your medicines are being prepared and quality checked'
          : 'Will begin processing after payment confirmation',
        date: order.isPaid
          ? estimatedProcessingDate
            ? estimatedProcessingDate.toISOString()
            : null
          : null,
        completed: order.isPaid,
        icon: 'fas fa-box-open',
      },
      {
        title: 'Out for Delivery',
        description: order.isDelivered
          ? 'Package was dispatched and on the way to your location'
          : order.isPaid
          ? 'Will be dispatched after processing'
          : 'Pending payment confirmation',
        date:
          order.isDelivered && deliveredDate
            ? new Date(
                deliveredDate.getTime() - 24 * 60 * 60 * 1000
              ).toISOString() // -1 day from delivery
            : order.isPaid
            ? estimatedShippingDate
              ? estimatedShippingDate.toISOString()
              : null
            : null,
        completed: order.isDelivered,
        icon: 'fas fa-truck',
      },
      {
        title: 'Delivered',
        description: order.isDelivered
          ? `Successfully delivered to ${order.shippingAddress.address}`
          : order.isPaid
          ? `Estimated delivery by ${
              estimatedDeliveryDate
                ? estimatedDeliveryDate.toLocaleDateString()
                : 'TBD'
            }`
          : 'Delivery pending payment confirmation',
        date: order.deliveredAt,
        completed: order.isDelivered,
        icon: 'fas fa-home',
      },
    ];

    return steps;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Pending';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusInfo = getOrderStatus();
  const timelineSteps = getTimelineSteps();

  return (
    <div className='track-order-screen'>
      <Container>
        {/* Header Section */}
        <div className='track-header'>
          <Row className='align-items-center mb-4'>
            <Col>
              <h1 className='page-title'>
                <i className='fas fa-search-location me-3'></i>
                Track Your Order
              </h1>
              <p className='page-subtitle'>
                Enter your order ID to track the status and location of your
                order
              </p>
            </Col>
          </Row>

          {/* Search Form */}
          <Card className='search-card mb-4'>
            <Card.Body>
              <Form onSubmit={submitHandler}>
                <Row className='g-3 align-items-end'>
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>
                        <i className='fas fa-barcode me-2'></i>
                        Order ID / Tracking Number
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className='fas fa-hashtag'></i>
                        </InputGroup.Text>
                        <Form.Control
                          type='text'
                          placeholder='Enter order ID (e.g., 67a1b2c3d4e5f678 or 67a1b2c3)'
                          value={trackingId}
                          onChange={(e) => setTrackingId(e.target.value)}
                          className='track-input'
                          maxLength={24}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Button
                      type='submit'
                      className='track-btn w-100'
                      disabled={!trackingId.trim()}
                    >
                      <i className='fas fa-search me-2'></i>
                      Track Order
                    </Button>
                  </Col>
                </Row>
              </Form>

              {/* Help Section */}
              <div className='mt-3'>
                <small className='text-muted'>
                  <i className='fas fa-info-circle me-1'></i>
                  <strong>Where to find your Order ID:</strong> Check your email
                  confirmation or visit your Profile → Order History
                </small>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Loading State */}
        {loading && searchAttempted && (
          <div className='text-center py-5'>
            <Loader />
            <p className='mt-3 text-muted'>Searching for your order...</p>
          </div>
        )}

        {/* Error State */}
        {error && searchAttempted && (
          <Alert variant='danger' className='error-alert'>
            <i className='fas fa-exclamation-triangle me-2'></i>
            <strong>Order Not Found</strong>
            <div className='mt-2'>
              <p className='mb-2'>
                We couldn't find an order with ID:{' '}
                <strong>"{trackingId}"</strong>
              </p>
              <div className='search-tips'>
                <strong>Search Tips:</strong>
                <ul className='mt-1 mb-2'>
                  <li>Try using the first 8-12 characters of your order ID</li>
                  <li>
                    Order IDs are case-insensitive (e.g., "68dab28b" or
                    "68DAB28B")
                  </li>
                  <li>
                    Check your email confirmation for the correct order ID
                  </li>
                  <li>
                    {userInfo ? (
                      <>
                        Visit your{' '}
                        <a href='/profile' className='text-decoration-none'>
                          profile page
                        </a>{' '}
                        to see your order history
                      </>
                    ) : (
                      <>
                        <a href='/login' className='text-decoration-none'>
                          Log in
                        </a>{' '}
                        to access your order history
                      </>
                    )}
                  </li>
                </ul>
              </div>
              <small className='text-muted'>
                Still having trouble? Contact our support team for assistance.
              </small>
            </div>
          </Alert>
        )}

        {/* Invalid Input Warning */}
        {searchAttempted &&
          trackingId &&
          !validateOrderId(trackingId.trim().replace(/[^a-zA-Z0-9]/g, '')) && (
            <Alert variant='warning' className='error-alert'>
              <i className='fas fa-info-circle me-2'></i>
              <strong>Invalid Order ID Format</strong>
              <div className='mt-2'>
                <p className='mb-1'>
                  Please enter a valid order ID (at least 4 characters, letters
                  and numbers only).
                </p>
                <small className='text-muted'>
                  Example: 67a1b2c3d4e5f678 or just 67a1b2c3
                </small>
              </div>
            </Alert>
          )}

        {/* Order Found - Display Tracking Information */}
        {order && !loading && (
          <div className='tracking-results'>
            {/* Order Status Card */}
            <Card className='status-card mb-4'>
              <Card.Body>
                <Row className='align-items-center'>
                  <Col md={8}>
                    <div className='status-info'>
                      <div className='d-flex align-items-center mb-3'>
                        <div className={`status-icon ${statusInfo.color}`}>
                          <i className={statusInfo.icon}></i>
                        </div>
                        <div className='ms-3'>
                          <h4 className='status-title mb-1'>
                            Order {formatOrderId(order._id)}
                          </h4>
                          <Badge
                            bg={statusInfo.color}
                            className='status-badge mb-2'
                          >
                            {statusInfo.label}
                          </Badge>
                          <p className='status-message text-black mb-0'>
                            {statusInfo.message}
                          </p>
                        </div>
                      </div>

                      <div className='progress-section'>
                        <div className='d-flex justify-content-between align-items-center mb-2'>
                          <span className='progress-label'>Order Progress</span>
                          <span className='progress-percentage'>
                            {statusInfo.progress}%
                          </span>
                        </div>
                        <ProgressBar
                          now={statusInfo.progress}
                          variant={statusInfo.color}
                          className='custom-progress'
                        />
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className='text-md-end'>
                    <div className='order-summary'>
                      <div className='summary-item'>
                        <small className='text-black'>Order Date</small>
                        <div className='fw-bold'>
                          <span style={{ color: 'black' }}>
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className='summary-item mt-2'>
                        <small className='text-black'>Total Amount</small>
                        <div className='fw-bold text-success'>
                          <span style={{ color: 'black' }}>
                            ৳{order.totalPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Row className='g-4'>
              {/* Timeline */}
              <Col lg={8}>
                <Card className='timeline-card'>
                  <Card.Header>
                    <h5 className='mb-0'>
                      <i className='fas fa-route me-2'></i>
                      Order Timeline
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className='order-timeline'>
                      {timelineSteps.map((step, index) => (
                        <div
                          key={index}
                          className={`timeline-item ${
                            step.completed ? 'completed' : 'pending'
                          }`}
                        >
                          <div className='timeline-marker'>
                            <i className={step.icon}></i>
                          </div>
                          <div className='timeline-content'>
                            <div className='timeline-header'>
                              <h6 className='timeline-title'>{step.title}</h6>
                              <small className='timeline-date'>
                                {formatDate(step.date)}
                              </small>
                            </div>
                            <p className='timeline-description'>
                              {step.description}
                            </p>
                            <div className='timeline-notes'>
                              <small style={{ color: '#333' }}>
                                <i className='fas fa-sticky-note me-1'></i>
                                <strong>Note:</strong>{' '}
                                {step.notes && step.notes.trim()
                                  ? step.notes
                                  : 'N/A'}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Order Details */}
              <Col lg={4}>
                <Card className='details-card mb-4'>
                  <Card.Header>
                    <h6 className='mb-0'>
                      <i className='fas fa-info-circle me-2'></i>
                      Order Details
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className='detail-item'>
                      <span className='detail-label'>Order ID:</span>
                      <span className='detail-value'>
                        {formatOrderId(order._id)}
                      </span>
                    </div>
                    <div className='detail-item'>
                      <span className='detail-label'>Payment Method:</span>
                      <span className='detail-value'>
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div className='detail-item'>
                      <span className='detail-label'>Items:</span>
                      <span className='detail-value'>
                        {order.orderItems.length} item(s)
                      </span>
                    </div>
                    <div className='detail-item'>
                      <span className='detail-label'>Shipping:</span>
                      <span className='detail-value'>
                        ৳{order.shippingPrice}
                      </span>
                    </div>
                  </Card.Body>
                </Card>

                {/* Shipping Address */}
                <Card className='address-card'>
                  <Card.Header>
                    <h6 className='mb-0'>
                      <i className='fas fa-map-marker-alt me-2'></i>
                      Delivery Address
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className='address-info'>
                      <p className='mb-1'>{order.shippingAddress.address}</p>
                      <p className='mb-1'>
                        {order.shippingAddress.city},{' '}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p className='mb-0 text-muted'>
                        {order.shippingAddress.country}
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Order Items */}
            <Card className='items-card mt-4'>
              <Card.Header>
                <h5 className='mb-0'>
                  <i className='fas fa-box-open me-2'></i>
                  Order Items ({order.orderItems.length})
                </h5>
              </Card.Header>
              <Card.Body>
                <div className='order-items'>
                  {order.orderItems.map((item, index) => (
                    <div key={index} className='order-item'>
                      <Row className='align-items-center'>
                        <Col xs={2}>
                          <div className='item-image'>
                            <Image
                              src={item.image}
                              alt={item.name}
                              fluid
                              rounded
                            />
                          </div>
                        </Col>
                        <Col xs={6}>
                          <h6 className='item-name'>{item.name}</h6>
                          <small className='text-black'>
                            Quantity: {item.qty}
                          </small>
                        </Col>
                        <Col xs={4} className='text-end'>
                          <div className='item-price'>
                            <span className='price'>৳{item.price}</span>
                            <div>
                              <small className='text-black'>
                                Total: ৳{(item.qty * item.price).toFixed(2)}
                              </small>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
        )}

        {/* Help Section */}
        <Card className='help-card mt-5'>
          <Card.Body>
            <Row className='g-4'>
              <Col md={4}>
                <div className='help-item text-center'>
                  <i className='fas fa-question-circle text-primary mb-2'></i>
                  <h6>Need Help?</h6>
                  <p className='text-muted mb-0'>
                    Contact our support team for assistance with your order
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className='help-item text-center'>
                  <i className='fas fa-phone text-success mb-2'></i>
                  <h6>Call Support</h6>
                  <p className='text-muted mb-0'>
                    +880-123-456789
                    <br />
                    Available 24/7
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className='help-item text-center'>
                  <i className='fas fa-envelope text-info mb-2'></i>
                  <h6>Email Us</h6>
                  <p className='text-muted mb-0'>
                    support@medi-ghor.com
                    <br />
                    We'll respond within 24 hours
                  </p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default TrackOrderScreen;
