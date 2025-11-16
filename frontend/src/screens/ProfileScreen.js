import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Modal,
  Image,
} from 'react-bootstrap';
import { getUserDetails, updateUserProfile } from '../actions/userActions';
import {
  listPrescriptions,
  deletePrescription,
} from '../actions/prescriptionActions';
import { LinkContainer } from 'react-router-bootstrap';
import Loader from '../components/Loader';
import { listMyOrders, resetOrderPay } from '../actions/orderActions';
import { ORDER_DELIVER_RESET } from '../constants/orderConstants';
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

  // Prescription states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const userDetails = useSelector((state) => state.userDetails);
  const { loading, user, error } = userDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userUpdateProfile = useSelector((state) => state.userUpdateProfile);
  const { success } = userUpdateProfile;

  const orderListMy = useSelector((state) => state.orderListMy);
  const { loading: loadingOrders, error: errorOrders, orders } = orderListMy;

  const orderPay = useSelector((state) => state.orderPay);
  const { success: successPay } = orderPay;

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { success: successDeliver } = orderDeliver;

  const prescriptionList = useSelector((state) => state.prescriptionList);
  const {
    loading: loadingPrescriptions,
    error: errorPrescriptions,
    prescriptions,
  } = prescriptionList;

  const prescriptionDelete = useSelector((state) => state.prescriptionDelete);
  const { loading: loadingDelete, success: successDelete } = prescriptionDelete;

  useEffect(() => {
    // Check URL params for active tab
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }

    if (!userInfo) {
      navigate('/login');
    } else {
      if (!user || !user.name || success) {
        dispatch({ type: USER_UPDATE_PROFILE_RESET });
        dispatch(getUserDetails('profile'));
        dispatch(listMyOrders());
        dispatch(listPrescriptions());
      } else {
        setName(user.name);
        setEmail(user.email);
      }
    }
  }, [dispatch, navigate, user, userInfo, success, searchParams]);

  // Re-fetch user's orders when payment or delivery status changes
  useEffect(() => {
    if (successPay || successDeliver) {
      dispatch(listMyOrders());
      // reset flags so we don't continuously re-fetch
      if (successPay) dispatch(resetOrderPay());
      if (successDeliver) dispatch({ type: ORDER_DELIVER_RESET });
    }
  }, [dispatch, successPay, successDeliver]);

  // When the Orders tab is active, poll for updates every 15 seconds
  // REMOVED: User doesn't want auto-refresh every 15 seconds
  // useEffect(() => {
  //   let intervalId = null;
  //   if (activeTab === 'orders') {
  //     // initial fetch
  //     dispatch(listMyOrders());
  //     intervalId = setInterval(() => {
  //       dispatch(listMyOrders());
  //     }, 15000);
  //   }
  //   return () => {
  //     if (intervalId) clearInterval(intervalId);
  //   };
  // }, [dispatch, activeTab]);

  useEffect(() => {
    if (successDelete) {
      dispatch(listPrescriptions());
      setShowDeleteModal(false);
      setPrescriptionToDelete(null);
    }
  }, [dispatch, successDelete]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      dispatch(updateUserProfile({ id: user._id, name, email, password }));
    }
  };

  const getOrderStatusBadge = (order) => {
    // Use currentStatus if available, fallback to legacy isPaid/isDelivered logic
    const status = order.currentStatus;

    if (status) {
      switch (status) {
        case 'pending':
          return <Badge bg='danger'>Pending Payment</Badge>;
        case 'payment_confirmed':
          return <Badge bg='info'>Payment Confirmed</Badge>;
        case 'processing':
          return <Badge bg='warning'>Processing</Badge>;
        case 'shipped':
          return <Badge bg='primary'>Shipped</Badge>;
        case 'out_for_delivery':
          return <Badge bg='warning'>Out for Delivery</Badge>;
        case 'delivered':
          return <Badge bg='success'>Delivered</Badge>;
        case 'cancelled':
          return <Badge bg='dark'>Cancelled</Badge>;
        default:
          return <Badge bg='secondary'>Unknown</Badge>;
      }
    }

    // Fallback to legacy logic for older orders
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

  // Prescription functions
  const handleDeletePrescription = (prescription) => {
    setPrescriptionToDelete(prescription);
    setShowDeleteModal(true);
  };

  const confirmDeletePrescription = () => {
    if (prescriptionToDelete) {
      dispatch(deletePrescription(prescriptionToDelete._id));
    }
  };

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const formatPrescriptionDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
                  <div className='stat-number'>
                    <span style={{ color: 'white' }}>
                      {orders?.length || 0}
                    </span>
                  </div>
                  <div className='stat-label'>
                    <span style={{ color: 'white' }}>Total Orders</span>+{' '}
                  </div>
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
                      <div className='d-flex justify-content-between align-items-center mb-3'>
                        <h5 className='mb-0'>
                          <i className='fas fa-shopping-bag me-2'></i>
                          Order History
                        </h5>
                        <Button
                          variant='outline-primary'
                          size='sm'
                          onClick={() => dispatch(listMyOrders())}
                          disabled={loadingOrders}
                        >
                          {loadingOrders ? (
                            <>
                              <i className='fas fa-spinner fa-spin me-1'></i>
                              Refreshing...
                            </>
                          ) : (
                            <>
                              <i className='fas fa-sync-alt me-1'></i>
                              Refresh Orders
                            </>
                          )}
                        </Button>
                      </div>

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
                                      <small className='text-black'>
                                        Order ID
                                      </small>
                                      <div className='fw-bold'>
                                        {formatOrderId(order._id)}
                                      </div>
                                    </div>
                                  </Col>
                                  <Col md={2}>
                                    <div className='order-date'>
                                      <small className='text-black'>Date</small>
                                      <div>{formatDate(order.createdAt)}</div>
                                    </div>
                                  </Col>
                                  <Col md={2}>
                                    <div className='order-total'>
                                      <small className='text-black'>
                                        Total
                                      </small>
                                      <div className='fw-bold text-success'>
                                        ৳{order.totalPrice}
                                      </div>
                                      {/* Show first few medicine names for quick reference */}
                                      {order.orderItems &&
                                        order.orderItems.length > 0 && (
                                          <div className='mt-2'>
                                            <small className='text-black'>
                                              {order.orderItems
                                                .slice(0, 3)
                                                .map((it) => it.name)
                                                .join(', ')}
                                              {order.orderItems.length > 3 && (
                                                <span>
                                                  {' '}
                                                  +{order.orderItems.length -
                                                    3}{' '}
                                                  more
                                                </span>
                                              )}
                                            </small>
                                          </div>
                                        )}
                                    </div>
                                  </Col>
                                  <Col md={2}>
                                    <div className='order-payment'>
                                      <small className='text-black'>
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
                                      <small className='text-black'>
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

                  <Tab
                    eventKey='prescriptions'
                    title={
                      <span>
                        <i className='fas fa-prescription-bottle-medical me-2'></i>
                        My Prescriptions
                      </span>
                    }
                  >
                    <div className='tab-content-wrapper'>
                      <div className='d-flex justify-content-between align-items-center mb-4'>
                        <h5 className='mb-0'>
                          <i className='fas fa-prescription-bottle-medical me-2'></i>
                          My Prescriptions
                        </h5>
                        <LinkContainer to='/upload-prescription'>
                          <Button className='upload-prescription-btn'>
                            <i className='fas fa-plus me-2'></i>
                            Upload New Prescription
                          </Button>
                        </LinkContainer>
                      </div>

                      {loadingPrescriptions ? (
                        <div className='text-center py-5'>
                          <Loader />
                        </div>
                      ) : errorPrescriptions ? (
                        <Alert variant='danger'>
                          <i className='fas fa-exclamation-triangle me-2'></i>
                          {errorPrescriptions}
                        </Alert>
                      ) : prescriptions?.length === 0 ? (
                        <div className='empty-prescriptions text-center py-5'>
                          <i className='fas fa-prescription-bottle-medical text-muted mb-3'></i>
                          <h4 className='text-black'>No Prescriptions Yet</h4>
                          <p className='text-black mb-4'>
                            Upload your medical prescriptions to keep them
                            organized and easily accessible.
                          </p>
                          <LinkContainer to='/upload-prescription'>
                            <Button className='upload-prescription-btn'>
                              <i className='fas fa-upload me-2'></i>
                              Upload Your First Prescription
                            </Button>
                          </LinkContainer>
                        </div>
                      ) : (
                        <div className='prescriptions-grid'>
                          {prescriptions?.map((prescription) => (
                            <Card
                              key={prescription._id}
                              className='prescription-card'
                            >
                              <Card.Body>
                                <div className='d-flex justify-content-between align-items-start mb-3'>
                                  <div>
                                    <h6 className='prescription-title mb-1'>
                                      {prescription.title}
                                    </h6>
                                    <small className='text-black'>
                                      <i className='fas fa-calendar me-1'></i>
                                      Uploaded on{' '}
                                      {formatDate(prescription.createdAt)}
                                    </small>
                                  </div>
                                  <div className='prescription-actions'>
                                    <Button
                                      variant='outline-primary'
                                      size='sm'
                                      onClick={() =>
                                        handleViewPrescription(prescription)
                                      }
                                      className='me-2'
                                    >
                                      <i className='fas fa-eye'></i>
                                    </Button>
                                    <Button
                                      variant='outline-danger'
                                      size='sm'
                                      onClick={() =>
                                        handleDeletePrescription(prescription)
                                      }
                                    >
                                      <i className='fas fa-trash'></i>
                                    </Button>
                                  </div>
                                </div>

                                {prescription.description && (
                                  <p className='prescription-description text-black mb-2'>
                                    {prescription.description}
                                  </p>
                                )}

                                <div className='prescription-details'>
                                  {prescription.doctorName && (
                                    <div className='detail-item'>
                                      <i className='fas fa-user-md text-primary me-1'></i>
                                      <small>
                                        Dr. {prescription.doctorName}
                                      </small>
                                    </div>
                                  )}
                                  {prescription.hospitalName && (
                                    <div className='detail-item'>
                                      <i className='fas fa-hospital text-info me-1'></i>
                                      <small>{prescription.hospitalName}</small>
                                    </div>
                                  )}
                                  {prescription.prescriptionDate && (
                                    <div className='detail-item'>
                                      <i className='fas fa-calendar-check text-success me-1'></i>
                                      <small>
                                        Prescribed:{' '}
                                        {formatPrescriptionDate(
                                          prescription.prescriptionDate
                                        )}
                                      </small>
                                    </div>
                                  )}
                                  {prescription.validUntil && (
                                    <div className='detail-item'>
                                      <i className='fas fa-calendar-times text-warning me-1'></i>
                                      <small>
                                        Valid until:{' '}
                                        {formatPrescriptionDate(
                                          prescription.validUntil
                                        )}
                                      </small>
                                    </div>
                                  )}
                                </div>

                                {prescription.medications &&
                                  prescription.medications.length > 0 && (
                                    <div className='medications-preview mt-3'>
                                      <small className='text-black mb-1 d-block'>
                                        <i className='fas fa-pills me-1'></i>
                                        Medications (
                                        {prescription.medications.length})
                                      </small>
                                      <div className='medications-list'>
                                        {prescription.medications
                                          .slice(0, 2)
                                          .map((med, index) => (
                                            <Badge
                                              key={index}
                                              bg='light'
                                              text='dark'
                                              className='me-1 mb-1'
                                            >
                                              {med.name}
                                            </Badge>
                                          ))}
                                        {prescription.medications.length >
                                          2 && (
                                          <Badge
                                            bg='secondary'
                                            className='me-1 mb-1'
                                          >
                                            +
                                            {prescription.medications.length -
                                              2}{' '}
                                            more
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                <div className='prescription-status mt-3'>
                                  <Badge
                                    bg={
                                      prescription.isActive
                                        ? 'success'
                                        : 'secondary'
                                    }
                                  >
                                    <i
                                      className={`fas ${
                                        prescription.isActive
                                          ? 'fa-check-circle'
                                          : 'fa-pause-circle'
                                      } me-1`}
                                    ></i>
                                    {prescription.isActive
                                      ? 'Active'
                                      : 'Inactive'}
                                  </Badge>
                                </div>
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

      {/* Prescription View Modal */}
      <Modal
        show={showPrescriptionModal}
        onHide={() => setShowPrescriptionModal(false)}
        size='lg'
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className='fas fa-prescription-bottle-medical me-2'></i>
            Prescription Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPrescription && (
            <div>
              <Row className='mb-4'>
                <Col md={6}>
                  <h5>{selectedPrescription.title}</h5>
                  {selectedPrescription.description && (
                    <p className='text-muted'>
                      {selectedPrescription.description}
                    </p>
                  )}
                </Col>
                <Col md={6} className='text-end'>
                  <Badge
                    bg={selectedPrescription.isActive ? 'success' : 'secondary'}
                    className='mb-2'
                  >
                    {selectedPrescription.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <br />
                  <small className='text-muted'>
                    Uploaded: {formatDate(selectedPrescription.createdAt)}
                  </small>
                </Col>
              </Row>

              <Row className='mb-4'>
                <Col md={6}>
                  {selectedPrescription.doctorName && (
                    <div className='mb-2'>
                      <strong>
                        <i className='fas fa-user-md me-2'></i>Doctor:
                      </strong>{' '}
                      Dr. {selectedPrescription.doctorName}
                    </div>
                  )}
                  {selectedPrescription.hospitalName && (
                    <div className='mb-2'>
                      <strong>
                        <i className='fas fa-hospital me-2'></i>Hospital:
                      </strong>{' '}
                      {selectedPrescription.hospitalName}
                    </div>
                  )}
                </Col>
                <Col md={6}>
                  {selectedPrescription.prescriptionDate && (
                    <div className='mb-2'>
                      <strong>
                        <i className='fas fa-calendar-check me-2'></i>
                        Prescribed:
                      </strong>{' '}
                      {formatPrescriptionDate(
                        selectedPrescription.prescriptionDate
                      )}
                    </div>
                  )}
                  {selectedPrescription.validUntil && (
                    <div className='mb-2'>
                      <strong>
                        <i className='fas fa-calendar-times me-2'></i>Valid
                        Until:
                      </strong>{' '}
                      {formatPrescriptionDate(selectedPrescription.validUntil)}
                    </div>
                  )}
                </Col>
              </Row>

              {selectedPrescription.medications &&
                selectedPrescription.medications.length > 0 && (
                  <div className='mb-4'>
                    <h6>
                      <i className='fas fa-pills me-2'></i>Medications
                    </h6>
                    <Table striped bordered hover size='sm'>
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPrescription.medications.map((med, index) => (
                          <tr key={index}>
                            <td>{med.name || '-'}</td>
                            <td>{med.dosage || '-'}</td>
                            <td>{med.frequency || '-'}</td>
                            <td>{med.duration || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

              {selectedPrescription.notes && (
                <div className='mb-4'>
                  <h6>
                    <i className='fas fa-sticky-note me-2'></i>Additional Notes
                  </h6>
                  <p className='text-muted'>{selectedPrescription.notes}</p>
                </div>
              )}

              <div className='text-center'>
                <h6>
                  <i className='fas fa-file-medical me-2'></i>Prescription Image
                </h6>
                <Image
                  src={selectedPrescription.image}
                  alt='Prescription'
                  fluid
                  rounded
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='secondary'
            onClick={() => setShowPrescriptionModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Prescription Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className='fas fa-exclamation-triangle text-warning me-2'></i>
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this prescription?</p>
          {prescriptionToDelete && (
            <div className='p-3 bg-light rounded'>
              <strong>{prescriptionToDelete.title}</strong>
              {prescriptionToDelete.doctorName && (
                <>
                  <br />
                  <small>Dr. {prescriptionToDelete.doctorName}</small>
                </>
              )}
            </div>
          )}
          <p className='mt-3 text-danger'>
            <i className='fas fa-warning me-1'></i>
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant='danger'
            onClick={confirmDeletePrescription}
            disabled={loadingDelete}
          >
            {loadingDelete ? (
              <>
                <i className='fas fa-spinner fa-spin me-1'></i>
                Deleting...
              </>
            ) : (
              <>
                <i className='fas fa-trash me-1'></i>
                Delete Prescription
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfileScreen;
