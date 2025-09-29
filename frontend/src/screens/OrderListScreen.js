import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Button,
  Row,
  Col,
  Card,
  Badge,
  InputGroup,
  Form,
  Container,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listOrders } from '../actions/orderActions';
import './OrderListScreen.css';

const OrderListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Local state for UI
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filtering and sorting state
  const [filterStatus, setFilterStatus] = React.useState('');
  const [filterPayment, setFilterPayment] = React.useState('');
  const [filterDelivery, setFilterDelivery] = React.useState('');
  const [sortBy, setSortBy] = React.useState('date');
  const [sortOrder, setSortOrder] = React.useState('desc');
  const [showFilters, setShowFilters] = React.useState(false);

  const orderList = useSelector((state) => state.orderList);
  const { loading, error, orders } = orderList;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (
      userInfo &&
      (userInfo.isAdmin ||
        userInfo.role === 'operator' ||
        userInfo.role === 'super_admin')
    ) {
      dispatch(listOrders());
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, userInfo]);

  // Filter and sort orders
  const getFilteredAndSortedOrders = () => {
    if (!orders) return [];

    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filters
    if (filterStatus) {
      if (filterStatus === 'completed') {
        filtered = filtered.filter(
          (order) => order.isPaid && order.isDelivered
        );
      } else if (filterStatus === 'processing') {
        filtered = filtered.filter(
          (order) => order.isPaid && !order.isDelivered
        );
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter((order) => !order.isPaid);
      }
    }

    if (filterPayment) {
      if (filterPayment === 'paid') {
        filtered = filtered.filter((order) => order.isPaid);
      } else if (filterPayment === 'unpaid') {
        filtered = filtered.filter((order) => !order.isPaid);
      }
    }

    if (filterDelivery) {
      if (filterDelivery === 'delivered') {
        filtered = filtered.filter((order) => order.isDelivered);
      } else if (filterDelivery === 'pending') {
        filtered = filtered.filter((order) => !order.isDelivered);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'date':
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        case 'total':
          aVal = parseFloat(a.totalPrice);
          bVal = parseFloat(b.totalPrice);
          break;
        case 'customer':
          aVal = (a.user?.name || '').toLowerCase();
          bVal = (b.user?.name || '').toLowerCase();
          break;
        case 'status':
          aVal = a.isPaid && a.isDelivered ? 2 : a.isPaid ? 1 : 0;
          bVal = b.isPaid && b.isDelivered ? 2 : b.isPaid ? 1 : 0;
          break;
        default:
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  };

  const clearAllFilters = () => {
    setFilterStatus('');
    setFilterPayment('');
    setFilterDelivery('');
    setSortBy('date');
    setSortOrder('desc');
    setSearchTerm('');
  };

  const getOrderStatus = (order) => {
    if (order.isPaid && order.isDelivered) {
      return {
        status: 'Completed',
        variant: 'success',
        icon: 'fas fa-check-circle',
      };
    } else if (order.isPaid && !order.isDelivered) {
      return { status: 'Processing', variant: 'warning', icon: 'fas fa-clock' };
    } else {
      return {
        status: 'Pending',
        variant: 'danger',
        icon: 'fas fa-exclamation-circle',
      };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  return (
    <Container fluid className='py-4'>
      {/* Header Section */}
      <div className='mb-4'>
        <Row className='align-items-center mb-3'>
          <Col>
            <h2 className='text-white mb-0'>Orders Management</h2>
            <p className='text-muted mb-0'>
              {loading
                ? 'Loading...'
                : (() => {
                    const filteredOrders = getFilteredAndSortedOrders();
                    const totalOrders = orders?.length || 0;
                    const filteredCount = filteredOrders.length;
                    return filteredCount < totalOrders
                      ? `${filteredCount} of ${totalOrders} orders shown`
                      : `${totalOrders} orders found`;
                  })()}
              • Monitor and manage customer orders
            </p>
          </Col>
        </Row>

        {/* Search Bar */}
        <Card
          className='border-0 shadow-lg search-card mb-3'
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Card.Body className='py-3'>
            <InputGroup size='lg'>
              <Form.Control
                type='text'
                placeholder='🔍 Search by Order ID, Customer Name, or Email...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'black',
                  fontSize: '1.1rem',
                  fontWeight: '500',
                }}
                className='custom-input'
              />
              {searchTerm && (
                <Button
                  variant='outline-light'
                  onClick={() => setSearchTerm('')}
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <i className='fas fa-times'></i>
                </Button>
              )}
            </InputGroup>
          </Card.Body>
        </Card>

        {/* Filters and Sorting Section */}
        <Card
          className='border-0 shadow-lg mb-3'
          style={{
            background: 'linear-gradient(135deg, #2c3e50, #34495e)',
            backdropFilter: 'blur(15px)',
            border: '2px solid #3498db',
          }}
        >
          <Card.Body>
            {/* Filter Toggle Button */}
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <div className='d-flex align-items-center gap-3'>
                <Button
                  size='sm'
                  onClick={() => setShowFilters(!showFilters)}
                  style={{
                    background: showFilters
                      ? 'linear-gradient(135deg, #e74c3c, #c0392b)'
                      : 'linear-gradient(135deg, #3498db, #2980b9)',
                    border: 'none',
                    color: '#000000',
                    fontWeight: '600',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    boxShadow: showFilters
                      ? '0 2px 8px rgba(231, 76, 60, 0.4)'
                      : '0 2px 8px rgba(52, 152, 219, 0.4)',
                  }}
                >
                  <i className='fas fa-filter me-2'></i>
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>

                {/* Active filters count */}
                {(filterStatus || filterPayment || filterDelivery) && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                      color: '#000000',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '15px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      border: '2px solid #e67e22',
                      boxShadow: '0 2px 8px rgba(243, 156, 18, 0.3)',
                    }}
                  >
                    {
                      [filterStatus, filterPayment, filterDelivery].filter(
                        Boolean
                      ).length
                    }{' '}
                    active filters
                  </div>
                )}
              </div>

              {/* Sort Controls */}
              <div className='d-flex align-items-center gap-2'>
                <span
                  style={{
                    color: '#000000',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                  }}
                >
                  Sort by:
                </span>
                <Form.Select
                  size='sm'
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    background: 'linear-gradient(135deg, #34495e, #2c3e50)',
                    border: '2px solid #3498db',
                    color: '#ecf0f1',
                    width: '130px',
                    fontWeight: '600',
                  }}
                >
                  <option
                    value='date'
                    style={{ background: '#2c3e50', color: '#ecf0f1' }}
                  >
                    Date
                  </option>
                  <option
                    value='total'
                    style={{ background: '#2c3e50', color: '#ecf0f1' }}
                  >
                    Total
                  </option>
                  <option
                    value='customer'
                    style={{ background: '#2c3e50', color: '#ecf0f1' }}
                  >
                    Customer
                  </option>
                  <option
                    value='status'
                    style={{ background: '#2c3e50', color: '#ecf0f1' }}
                  >
                    Status
                  </option>
                </Form.Select>

                <Button
                  size='sm'
                  onClick={() =>
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  }
                  style={{
                    background:
                      sortOrder === 'asc'
                        ? 'linear-gradient(135deg, #27ae60, #229954)'
                        : 'linear-gradient(135deg, #e74c3c, #c0392b)',
                    border: 'none',
                    color: '#000000',
                    fontWeight: '600',
                    width: '45px',
                    height: '35px',
                    borderRadius: '8px',
                    boxShadow:
                      sortOrder === 'asc'
                        ? '0 2px 8px rgba(39, 174, 96, 0.3)'
                        : '0 2px 8px rgba(231, 76, 60, 0.3)',
                  }}
                >
                  <i
                    className={`fas fa-sort-${
                      sortOrder === 'asc' ? 'up' : 'down'
                    }`}
                  ></i>
                </Button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div
                className='border-top pt-3'
                style={{
                  borderColor: '#3498db !important',
                  borderWidth: '2px !important',
                }}
              >
                <Row className='g-3'>
                  {/* Status Filter */}
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label
                        style={{
                          color: '#000000',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                        }}
                        className='mb-2'
                      >
                        <i className='fas fa-list-alt me-1'></i>
                        Order Status
                      </Form.Label>
                      <Form.Select
                        size='sm'
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                          background:
                            'linear-gradient(135deg, #34495e, #2c3e50)',
                          border: '2px solid #3498db',
                          color: '#ecf0f1',
                          fontWeight: '500',
                        }}
                      >
                        <option
                          value=''
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          All Status
                        </option>
                        <option
                          value='completed'
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          Completed
                        </option>
                        <option
                          value='processing'
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          Processing
                        </option>
                        <option
                          value='pending'
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          Pending
                        </option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* Payment Filter */}
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label
                        style={{
                          color: '#000000',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                        }}
                        className='mb-2'
                      >
                        <i className='fas fa-credit-card me-1'></i>
                        Payment Status
                      </Form.Label>
                      <Form.Select
                        size='sm'
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
                        style={{
                          background:
                            'linear-gradient(135deg, #34495e, #2c3e50)',
                          border: '2px solid #3498db',
                          color: '#ecf0f1',
                          fontWeight: '500',
                        }}
                      >
                        <option
                          value=''
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          All Payments
                        </option>
                        <option
                          value='paid'
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          Paid
                        </option>
                        <option
                          value='unpaid'
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          Unpaid
                        </option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* Delivery Filter */}
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label
                        style={{
                          color: '#000000',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                        }}
                        className='mb-2'
                      >
                        <i className='fas fa-truck me-1'></i>
                        Delivery Status
                      </Form.Label>
                      <Form.Select
                        size='sm'
                        value={filterDelivery}
                        onChange={(e) => setFilterDelivery(e.target.value)}
                        style={{
                          background:
                            'linear-gradient(135deg, #34495e, #2c3e50)',
                          border: '2px solid #3498db',
                          color: '#ecf0f1',
                          fontWeight: '500',
                        }}
                      >
                        <option
                          value=''
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          All Deliveries
                        </option>
                        <option
                          value='delivered'
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          Delivered
                        </option>
                        <option
                          value='pending'
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          Pending Delivery
                        </option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* Clear Filters */}
                  <Col md={3} className='d-flex align-items-end'>
                    {(filterStatus ||
                      filterPayment ||
                      filterDelivery ||
                      sortBy !== 'date' ||
                      sortOrder !== 'desc' ||
                      searchTerm) && (
                      <Button
                        size='sm'
                        onClick={clearAllFilters}
                        className='w-100'
                        style={{
                          background:
                            'linear-gradient(135deg, #f39c12, #e67e22)',
                          border: 'none',
                          color: '#000000',
                          fontWeight: '600',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          boxShadow: '0 2px 8px rgba(243, 156, 18, 0.4)',
                        }}
                      >
                        <i className='fas fa-times me-2'></i>
                        Clear All
                      </Button>
                    )}
                  </Col>
                </Row>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Loading and Error Messages */}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          {/* Results Summary */}
          {!loading && orders && (
            <div className='mb-3'>
              <Row className='align-items-center'>
                <Col>
                  {(() => {
                    const filteredOrders = getFilteredAndSortedOrders();
                    const hasFilters =
                      filterStatus ||
                      filterPayment ||
                      filterDelivery ||
                      searchTerm;
                    const hasCustomSort =
                      sortBy !== 'date' || sortOrder !== 'desc';

                    return (
                      <div className='d-flex flex-wrap gap-2 align-items-center'>
                        <Badge bg='info' style={{ fontSize: '0.8rem' }}>
                          <i className='fas fa-shopping-bag me-1'></i>
                          {filteredOrders.length} order
                          {filteredOrders.length !== 1 ? 's' : ''}
                        </Badge>

                        {hasFilters && (
                          <Badge bg='warning' style={{ fontSize: '0.75rem' }}>
                            <i className='fas fa-filter me-1'></i>
                            Filtered
                          </Badge>
                        )}

                        {hasCustomSort && (
                          <Badge bg='success' style={{ fontSize: '0.75rem' }}>
                            <i
                              className={`fas fa-sort-${
                                sortOrder === 'asc' ? 'up' : 'down'
                              } me-1`}
                            ></i>
                            Sorted by {sortBy}
                          </Badge>
                        )}
                      </div>
                    );
                  })()}
                </Col>
              </Row>
            </div>
          )}

          {/* Orders Grid */}
          <Row className='g-3'>
            {(() => {
              const filteredOrders = getFilteredAndSortedOrders();
              return filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const orderStatus = getOrderStatus(order);
                  return (
                    <Col key={order._id} xs={12} md={6} lg={4}>
                      <Card
                        className='h-100 order-card border-0 shadow-sm'
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '15px',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Card.Body className='d-flex flex-column'>
                          <div className='flex-grow-1'>
                            {/* Order Header */}
                            <div className='d-flex justify-content-between align-items-start mb-3'>
                              <div>
                                <Card.Title
                                  className='mb-1'
                                  style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: '#000000',
                                  }}
                                >
                                  Order {formatOrderId(order._id)}
                                </Card.Title>
                                <small className='text-muted'>
                                  {formatDate(order.createdAt)}
                                </small>
                              </div>
                              <Badge
                                bg={orderStatus.variant}
                                className='d-flex align-items-center gap-1'
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.4rem 0.8rem',
                                }}
                              >
                                <i className={orderStatus.icon}></i>
                                {orderStatus.status}
                              </Badge>
                            </div>

                            {/* Customer Info */}
                            <div className='mb-3'>
                              <h6 className='mb-1' style={{ color: '#000000' }}>
                                <i className='fas fa-user me-2'></i>
                                {order.user?.name || 'Unknown Customer'}
                              </h6>
                              <small className='text-muted'>
                                <i className='fas fa-envelope me-1'></i>
                                {order.user?.email || 'No email'}
                              </small>
                            </div>

                            {/* Order Details */}
                            <div className='order-details mb-3'>
                              <Row className='g-2 text-sm'>
                                <Col xs={6}>
                                  <div className='d-flex align-items-center'>
                                    <i className='fas fa-tag me-2 text-success'></i>
                                    <div>
                                      <div
                                        className='fw-semibold'
                                        style={{ color: '#000000' }}
                                      >
                                        ৳
                                        {parseFloat(
                                          order.totalPrice
                                        ).toLocaleString()}
                                      </div>
                                      <small className='text-muted'>
                                        Total Amount
                                      </small>
                                    </div>
                                  </div>
                                </Col>
                                <Col xs={6}>
                                  <div className='d-flex align-items-center'>
                                    <i className='fas fa-boxes me-2 text-info'></i>
                                    <div>
                                      <div
                                        className='fw-semibold'
                                        style={{ color: '#000000' }}
                                      >
                                        {order.orderItems?.length || 0} items
                                      </div>
                                      <small className='text-muted'>
                                        Products
                                      </small>
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </div>

                            {/* Payment & Delivery Status */}
                            <div className='status-indicators mb-3'>
                              <Row className='g-2'>
                                <Col xs={6}>
                                  <div
                                    className='p-2 rounded text-center'
                                    style={{
                                      background: order.isPaid
                                        ? 'rgba(40, 167, 69, 0.2)'
                                        : 'rgba(220, 53, 69, 0.2)',
                                      border: `1px solid ${
                                        order.isPaid ? '#28a745' : '#dc3545'
                                      }`,
                                    }}
                                  >
                                    <i
                                      className={`fas ${
                                        order.isPaid
                                          ? 'fa-check-circle'
                                          : 'fa-times-circle'
                                      } ${
                                        order.isPaid
                                          ? 'text-success'
                                          : 'text-danger'
                                      }`}
                                    ></i>
                                    <div
                                      className='small mt-1'
                                      style={{ color: '#000000' }}
                                    >
                                      {order.isPaid ? 'Paid' : 'Unpaid'}
                                    </div>
                                    {order.isPaid && order.paidAt && (
                                      <small className='text-muted'>
                                        {formatDate(order.paidAt)}
                                      </small>
                                    )}
                                  </div>
                                </Col>
                                <Col xs={6}>
                                  <div
                                    className='p-2 rounded text-center'
                                    style={{
                                      background: order.isDelivered
                                        ? 'rgba(40, 167, 69, 0.2)'
                                        : 'rgba(255, 193, 7, 0.2)',
                                      border: `1px solid ${
                                        order.isDelivered
                                          ? '#28a745'
                                          : '#ffc107'
                                      }`,
                                    }}
                                  >
                                    <i
                                      className={`fas ${
                                        order.isDelivered
                                          ? 'fa-check-circle'
                                          : 'fa-clock'
                                      } ${
                                        order.isDelivered
                                          ? 'text-success'
                                          : 'text-warning'
                                      }`}
                                    ></i>
                                    <div
                                      className='small mt-1'
                                      style={{ color: '#000000' }}
                                    >
                                      {order.isDelivered
                                        ? 'Delivered'
                                        : 'Pending'}
                                    </div>
                                    {order.isDelivered && order.deliveredAt && (
                                      <small className='text-muted'>
                                        {formatDate(order.deliveredAt)}
                                      </small>
                                    )}
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className='d-flex gap-2'>
                            <Button
                              variant='outline-light'
                              size='sm'
                              className='flex-fill'
                              as={Link}
                              to={`/order/${order._id}`}
                              style={{
                                color: 'black',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                backdropFilter: 'blur(5px)',
                              }}
                            >
                              <i className='fas fa-eye me-1'></i>
                              View Details
                            </Button>
                            <Button
                              variant='outline-info'
                              size='sm'
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                const email = order.user?.email;
                                if (
                                  email &&
                                  email !== 'No email' &&
                                  email.trim() !== ''
                                ) {
                                  // Open Gmail compose directly with customer email
                                  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                                    email
                                  )}&su=${encodeURIComponent(
                                    'Order ' +
                                      formatOrderId(order._id) +
                                      ' - Customer Support'
                                  )}&body=${encodeURIComponent(
                                    'Dear ' +
                                      (order.user?.name || 'Customer') +
                                      ',\n\nRegarding your order ' +
                                      formatOrderId(order._id) +
                                      '.\n\nBest regards,\nMedi-ghor Support Team'
                                  )}`;

                                  // Open Gmail in new tab
                                  window.open(gmailUrl, '_blank');
                                } else {
                                  alert('No email available for this customer');
                                }
                              }}
                              style={{
                                borderColor: 'rgba(23, 162, 184, 0.5)',
                                color: '#17a2b8',
                              }}
                              title={`Email: ${
                                order.user?.email || 'Not available'
                              }`}
                            >
                              <i className='fas fa-envelope'></i>
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })
              ) : (
                <Col xs={12}>
                  <Card
                    className='text-center border-0 shadow-sm'
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '15px',
                      padding: '3rem',
                    }}
                  >
                    <Card.Body>
                      <i
                        className='fas fa-shopping-bag mb-3 text-muted'
                        style={{ fontSize: '3rem' }}
                      ></i>
                      <h5 className='mb-2' style={{ color: '#000000' }}>
                        {(() => {
                          const hasFilters =
                            filterStatus ||
                            filterPayment ||
                            filterDelivery ||
                            searchTerm;
                          if (orders && orders.length > 0 && hasFilters) {
                            return 'No Orders Match Filters';
                          } else if (searchTerm) {
                            return 'No Orders Found';
                          } else {
                            return 'No Orders Found';
                          }
                        })()}
                      </h5>
                      <p className='text-muted mb-3'>
                        {(() => {
                          const hasFilters =
                            filterStatus ||
                            filterPayment ||
                            filterDelivery ||
                            searchTerm;
                          if (orders && orders.length > 0 && hasFilters) {
                            return 'Try adjusting your filters to see more orders';
                          } else if (searchTerm) {
                            return `No orders match "${searchTerm}"`;
                          } else {
                            return 'Orders will appear here once customers start placing them';
                          }
                        })()}
                      </p>
                      {(() => {
                        const hasFilters =
                          filterStatus ||
                          filterPayment ||
                          filterDelivery ||
                          searchTerm;
                        if (orders && orders.length > 0 && hasFilters) {
                          return (
                            <Button
                              variant='outline-warning'
                              onClick={clearAllFilters}
                              style={{
                                borderColor: 'rgba(255, 193, 7, 0.5)',
                                color: '#ffc107',
                              }}
                            >
                              <i className='fas fa-times me-2'></i>
                              Clear Filters
                            </Button>
                          );
                        }
                        return null;
                      })()}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })()}
          </Row>
        </>
      )}
    </Container>
  );
};

export default OrderListScreen;
