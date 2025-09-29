import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  Tab,
  Tabs,
  Table,
} from 'react-bootstrap';
import { getUserDetails, updateUserProfile } from '../actions/userActions';
import { LinkContainer } from 'react-router-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listMyOrders } from '../actions/orderActions';
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants';
import './ProfileScreen.css';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userDetails = useSelector((state) => state.userDetails);
  const { loading, user, error } = userDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userUpdateProfile = useSelector((state) => state.userUpdateProfile);
  const { success } = userUpdateProfile;

  const orderListMy = useSelector((state) => state.orderListMy);
  const { loading: loadingOrders, error: errorOrders, orders } = orderListMy;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      if (!user || !user.name || success) {
        dispatch({ type: USER_UPDATE_PROFILE_RESET });
        dispatch(getUserDetails('profile'));
        dispatch(listMyOrders());
      } else {
        setName(user.name);
        setEmail(user.email);
      }
    }
  }, [dispatch, navigate, user, userInfo, success]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      dispatch(updateUserProfile({ id: user._id, name, email, password }));
    }
  };

  const getOrderStatusBadge = (order) => {
    if (order.isDelivered) {
      return <Badge bg='success'>Delivered</Badge>;
    } else if (order.isPaid) {
      return <Badge bg='warning'>Processing</Badge>;
    } else {
      return <Badge bg='danger'>Pending Payment</Badge>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to format order ID for display consistently
  const formatOrderId = (orderId) => {
    if (!orderId) return '';
    return `#${orderId.substring(0, 8).toUpperCase()}`;
  };

  return (
    <div className='profile-screen-container'>
      <Container>
        {/* Profile Header */}
        <div className='profile-header mb-4'>
          <Row className='align-items-center'>
            <Col>
              <div className='d-flex align-items-center'>
                <div className='profile-avatar'>
                  <i className='fas fa-user-circle'></i>
                </div>
                <div className='ms-3'>
                  <h1 className='profile-title mb-0'>
                    Welcome, {user?.name || 'User'}
                  </h1>
                  <p className='profile-subtitle text-muted'>
                    Manage your account settings and view your orders
                  </p>
                </div>
              </div>
            </Col>
            <Col xs='auto'>
              <div className='profile-stats'>
                <div className='stat-item text-center'>
                  <div className='stat-number'>{orders?.length || 0}</div>
                  <div className='stat-label'>Total Orders</div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Profile Content */}
        <Row className='g-4'>
          <Col lg={4}>
            {/* Profile Information Card */}
            <Card className='profile-info-card h-100'>
              <Card.Body>
                <div className='text-center mb-4'>
                  <div className='profile-avatar-large'>
                    <i className='fas fa-user-circle'></i>
                  </div>
                  <h4 className='mt-3 mb-1'>{user?.name}</h4>
                  <p className='text-muted mb-0'>{user?.email}</p>
                  <Badge bg='primary' className='mt-2'>
                    <i className='fas fa-shield-alt me-1'></i>
                    Verified User
                  </Badge>
                </div>

                <div className='profile-quick-stats'>
                  <div className='quick-stat-item'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <span>
                        <i className='fas fa-shopping-bag text-primary me-2'></i>
                        Total Orders
                      </span>
                      <Badge bg='light' text='dark'>
                        {orders?.length || 0}
                      </Badge>
                    </div>
                  </div>
                  <div className='quick-stat-item'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <span>
                        <i className='fas fa-check-circle text-success me-2'></i>
                        Delivered Orders
                      </span>
                      <Badge bg='light' text='dark'>
                        {orders?.filter((order) => order.isDelivered).length ||
                          0}
                      </Badge>
                    </div>
                  </div>
                  <div className='quick-stat-item'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <span>
                        <i className='fas fa-calendar-alt text-info me-2'></i>
                        Member Since
                      </span>
                      <Badge bg='light' text='dark'>
                        {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            {/* Profile Tabs */}
            <Card className='profile-content-card'>
              <Card.Body>
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className='custom-tabs mb-4'
                >
                  <Tab
                    eventKey='profile'
                    title={
                      <span>
                        <i className='fas fa-user me-2'></i>
                        Profile Settings
                      </span>
                    }
                  >
                    <div className='tab-content-wrapper'>
                      {message && <Alert variant='danger'>{message}</Alert>}
                      {error && <Alert variant='danger'>{error}</Alert>}
                      {success && (
                        <Alert variant='success'>
                          <i className='fas fa-check-circle me-2'></i>
                          Profile Updated Successfully
                        </Alert>
                      )}
                      {loading && <Loader />}

                      <Form onSubmit={submitHandler}>
                        <Row className='g-3'>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>
                                <i className='fas fa-user me-2'></i>
                                Full Name
                              </Form.Label>
                              <Form.Control
                                type='text'
                                placeholder='Enter your full name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className='modern-input'
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>
                                <i className='fas fa-envelope me-2'></i>
                                Email Address
                              </Form.Label>
                              <Form.Control
                                type='email'
                                placeholder='Enter your email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='modern-input'
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>
                                <i className='fas fa-lock me-2'></i>
                                New Password
                              </Form.Label>
                              <InputGroup>
                                <Form.Control
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder='Enter new password'
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className='modern-input'
                                />
                                <Button
                                  variant='outline-secondary'
                                  onClick={() => setShowPassword(!showPassword)}
                                  className='password-toggle-btn'
                                >
                                  <i
                                    className={
                                      showPassword
                                        ? 'fas fa-eye-slash'
                                        : 'fas fa-eye'
                                    }
                                  ></i>
                                </Button>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>
                                <i className='fas fa-lock me-2'></i>
                                Confirm Password
                              </Form.Label>
                              <InputGroup>
                                <Form.Control
                                  type={
                                    showConfirmPassword ? 'text' : 'password'
                                  }
                                  placeholder='Confirm new password'
                                  value={confirmPassword}
                                  onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                  }
                                  className='modern-input'
                                />
                                <Button
                                  variant='outline-secondary'
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                  className='password-toggle-btn'
                                >
                                  <i
                                    className={
                                      showConfirmPassword
                                        ? 'fas fa-eye-slash'
                                        : 'fas fa-eye'
                                    }
                                  ></i>
                                </Button>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className='form-actions mt-4'>
                          <Button type='submit' className='update-btn'>
                            <i className='fas fa-save me-2'></i>
                            Update Profile
                          </Button>
                          <Button
                            variant='outline-secondary'
                            className='ms-2'
                            onClick={() => {
                              setName(user?.name || '');
                              setEmail(user?.email || '');
                              setPassword('');
                              setConfirmPassword('');
                              setMessage(null);
                            }}
                          >
                            <i className='fas fa-undo me-2'></i>
                            Reset
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </Tab>

                  <Tab
                    eventKey='orders'
                    title={
                      <span>
                        <i className='fas fa-shopping-bag me-2'></i>
                        Order History
                      </span>
                    }
                  >
                    <div className='tab-content-wrapper'>
                      {loadingOrders ? (
                        <div className='text-center py-5'>
                          <Loader />
                        </div>
                      ) : errorOrders ? (
                        <Alert variant='danger'>
                          <i className='fas fa-exclamation-triangle me-2'></i>
                          {errorOrders}
                        </Alert>
                      ) : orders?.length === 0 ? (
                        <div className='empty-orders text-center py-5'>
                          <i className='fas fa-shopping-bag text-muted mb-3'></i>
                          <h4 className='text-muted'>No Orders Yet</h4>
                          <p className='text-muted mb-4'>
                            You haven't placed any orders yet. Start shopping to
                            see your orders here.
                          </p>
                          <LinkContainer to='/products'>
                            <Button variant='primary'>
                              <i className='fas fa-shopping-cart me-2'></i>
                              Start Shopping
                            </Button>
                          </LinkContainer>
                        </div>
                      ) : (
                        <div className='orders-list'>
                          {orders.map((order) => (
                            <Card key={order._id} className='order-card mb-3'>
                              <Card.Body>
                                <Row className='align-items-center'>
                                  <Col md={2}>
                                    <div className='order-id'>
                                      <small className='text-muted'>
                                        Order ID
                                      </small>
                                      <div className='fw-bold'>
                                        {formatOrderId(order._id)}
                                      </div>
                                    </div>
                                  </Col>
                                  <Col md={2}>
                                    <div className='order-date'>
                                      <small className='text-muted'>Date</small>
                                      <div>{formatDate(order.createdAt)}</div>
                                    </div>
                                  </Col>
                                  <Col md={2}>
                                    <div className='order-total'>
                                      <small className='text-muted'>
                                        Total
                                      </small>
                                      <div className='fw-bold text-success'>
                                        ৳{order.totalPrice}
                                      </div>
                                    </div>
                                  </Col>
                                  <Col md={2}>
                                    <div className='order-payment'>
                                      <small className='text-muted'>
                                        Payment
                                      </small>
                                      <div>
                                        {order.isPaid ? (
                                          <Badge bg='success'>
                                            <i className='fas fa-check me-1'></i>
                                            Paid
                                          </Badge>
                                        ) : (
                                          <Badge bg='danger'>
                                            <i className='fas fa-times me-1'></i>
                                            Pending
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </Col>
                                  <Col md={2}>
                                    <div className='order-status'>
                                      <small className='text-muted'>
                                        Status
                                      </small>
                                      <div>{getOrderStatusBadge(order)}</div>
                                    </div>
                                  </Col>
                                  <Col md={2} className='text-end'>
                                    <LinkContainer to={`/order/${order._id}`}>
                                      <Button
                                        variant='outline-primary'
                                        size='sm'
                                      >
                                        <i className='fas fa-eye me-1'></i>
                                        View Details
                                      </Button>
                                    </LinkContainer>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfileScreen;
