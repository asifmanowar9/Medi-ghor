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
  Alert,
  InputGroup,
  Badge,
  Modal,
  Spinner,
} from 'react-bootstrap';
import CheckoutSteps from '../components/CheckoutSteps';
import { saveShippingAddress } from '../actions/cartActions';
import { resetOrderCreate } from '../actions/orderActions';
import {
  getSavedAddresses,
  addSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
} from '../actions/userActions';
import {
  USER_ADDRESS_ADD_RESET,
  USER_ADDRESS_UPDATE_RESET,
} from '../constants/userConstants';
import '../styles/ShippingScreen.css';

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userAddresses = useSelector((state) => state.userAddresses);
  const { loading: addressesLoading, addresses = [] } = userAddresses;

  const userAddressAdd = useSelector((state) => state.userAddressAdd);
  const { loading: addLoading, success: addSuccess, error: addError } = userAddressAdd;

  const userAddressUpdate = useSelector((state) => state.userAddressUpdate);
  const { loading: updateLoading, success: updateSuccess, error: updateError } = userAddressUpdate;

  const userAddressDelete = useSelector((state) => state.userAddressDelete);
  const { loading: deleteLoading } = userAddressDelete;

  // Form states - Start with empty form for new orders
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  // Country is fixed as Bangladesh
  const country = 'Bangladesh';
  const [phone, setPhone] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Saved addresses modal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [deletingAddressId, setDeletingAddressId] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Bangladesh Districts by Division
  const districtsByDivision = {
    Dhaka: [
      'Dhaka',
      'Faridpur',
      'Gazipur',
      'Gopalganj',
      'Kishoreganj',
      'Madaripur',
      'Manikganj',
      'Munshiganj',
      'Narayanganj',
      'Narsingdi',
      'Rajbari',
      'Shariatpur',
      'Tangail',
    ],
    Chittagong: [
      'Bandarban',
      'Brahmanbaria',
      'Chandpur',
      'Chittagong',
      'Comilla',
      "Cox's Bazar",
      'Feni',
      'Khagrachhari',
      'Lakshmipur',
      'Noakhali',
      'Rangamati',
    ],
    Rajshahi: [
      'Bogura',
      'Joypurhat',
      'Naogaon',
      'Natore',
      'Nawabganj',
      'Pabna',
      'Rajshahi',
      'Sirajgonj',
    ],
    Khulna: [
      'Bagerhat',
      'Chuadanga',
      'Jessore',
      'Jhenaidah',
      'Khulna',
      'Kushtia',
      'Magura',
      'Meherpur',
      'Narail',
      'Satkhira',
    ],
    Barishal: [
      'Barguna',
      'Barishal',
      'Bhola',
      'Jhalokati',
      'Patuakhali',
      'Pirojpur',
    ],
    Sylhet: ['Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'],
    Rangpur: [
      'Dinajpur',
      'Gaibandha',
      'Kurigram',
      'Lalmonirhat',
      'Nilphamari',
      'Panchagarh',
      'Rangpur',
      'Thakurgaon',
    ],
    Mymensingh: ['Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur'],
  };

  // Get districts for selected city/division
  const getDistrictsForCity = (selectedCity) => {
    return districtsByDivision[selectedCity] || [];
  };

  // Calculate totals
  const subtotal =
    cartItems?.reduce((acc, item) => acc + item.qty * item.price, 0) || 0;
  const totalItems = cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0;

  // Calculate delivery fee: 150tk if order < 1000tk, free if >= 1000tk
  const deliveryFee = subtotal >= 1000 ? 0 : 150;
  const finalTotal = subtotal + deliveryFee;

  // Reset order state when starting new checkout process
  useEffect(() => {
    dispatch(resetOrderCreate());
    if (userInfo) {
      dispatch(getSavedAddresses());
    }
  }, [dispatch, userInfo]);

  // Handle save/update success
  useEffect(() => {
    if (addSuccess) {
      setShowSaveModal(false);
      setAddressLabel('');
      setIsDefaultAddress(false);
      dispatch({ type: USER_ADDRESS_ADD_RESET });
    }
    if (updateSuccess) {
      setShowEditModal(false);
      setEditingAddressId(null);
      setAddressLabel('');
      setIsDefaultAddress(false);
      dispatch({ type: USER_ADDRESS_UPDATE_RESET });
    }
  }, [addSuccess, updateSuccess, dispatch]);

  // Check if user has items in cart
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Function to clear form
  const clearForm = () => {
    setAddress('');
    setCity('');
    setDistrict('');
    setPostalCode('');
    setPhone('');
    setLandmark('');
    setDeliveryInstructions('');
    setErrors({});
  };

  // Function to load a saved address into the form
  const loadSavedAddress = (savedAddr) => {
    setAddress(savedAddr.address || '');
    setCity(savedAddr.city || '');
    setDistrict(savedAddr.district || '');
    setPostalCode(savedAddr.postalCode || '');
    setPhone(savedAddr.phone || '');
    setLandmark(savedAddr.landmark || '');
    setDeliveryInstructions(savedAddr.deliveryInstructions || '');
  };

  // Function to save current form as new address
  const handleSaveAddress = () => {
    if (!address.trim() || !city.trim() || !district.trim() || !phone.trim()) {
      return;
    }

    const addressData = {
      address: address.trim(),
      city: city.trim(),
      district: district.trim(),
      postalCode: postalCode.trim(),
      country: country,
      phone: phone.trim(),
      landmark: landmark.trim(),
      deliveryInstructions: deliveryInstructions.trim(),
      label: addressLabel.trim() || 'Address',
      isDefault: isDefaultAddress,
    };

    dispatch(addSavedAddress(addressData));
  };

  // Function to update existing address
  const handleUpdateAddress = () => {
    if (!editingAddressId) return;

    const addressData = {
      address: address.trim(),
      city: city.trim(),
      district: district.trim(),
      postalCode: postalCode.trim(),
      country: country,
      phone: phone.trim(),
      landmark: landmark.trim(),
      deliveryInstructions: deliveryInstructions.trim(),
      label: addressLabel.trim() || 'Address',
      isDefault: isDefaultAddress,
    };

    dispatch(updateSavedAddress(editingAddressId, addressData));
  };

  // Function to delete saved address
  const handleDeleteAddress = () => {
    if (deletingAddressId) {
      dispatch(deleteSavedAddress(deletingAddressId));
      setShowDeleteModal(false);
      setDeletingAddressId(null);
    }
  };

  // Function to open edit modal for an address
  const openEditModal = (savedAddr) => {
    loadSavedAddress(savedAddr);
    setAddressLabel(savedAddr.label || '');
    setIsDefaultAddress(savedAddr.isDefault || false);
    setEditingAddressId(savedAddr._id);
    setShowEditModal(true);
  };

  // Function to open delete confirmation modal
  const openDeleteModal = (addressId) => {
    setDeletingAddressId(addressId);
    setShowDeleteModal(true);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'Division is required';
    if (!district.trim()) newErrors.district = 'District is required';
    if (!postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^(\+8801|01)[3-9]\d{8}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Bangladeshi phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const shippingData = {
        address: address.trim(),
        city: city.trim(),
        district: district.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        phone: phone.trim(),
        landmark: landmark.trim(),
        deliveryInstructions: deliveryInstructions.trim(),
      };

      await dispatch(saveShippingAddress(shippingData));
      navigate('/payment');
    } catch (error) {
      console.error('Error saving shipping address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.startsWith('880')) {
      value = '+' + value;
    } else if (value.startsWith('01') && value.length <= 11) {
      // Keep as is for local format
    }
    setPhone(value);
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  // Predefined addresses (could come from user profile)
  const quickAddresses = [
    {
      name: 'Dhaka Medical College Area',
      address: 'Dhaka Medical College Hospital Road',
      city: 'Dhaka',
      district: 'Dhaka',
      postalCode: '1000',
    },
    {
      name: 'Chittagong Medical College',
      address: 'Medical College Road, Chittagong',
      city: 'Chittagong',
      district: 'Chittagong',
      postalCode: '4203',
    },
    {
      name: 'Rajshahi Medical College',
      address: 'Medical College Road, Rajshahi',
      city: 'Rajshahi',
      district: 'Rajshahi',
      postalCode: '6000',
    },
  ];

  return (
    <div className='shipping-screen'>
      <Container fluid className='px-3 px-lg-5'>
        {/* Checkout Steps */}
        <div className='checkout-steps-wrapper'>
          <CheckoutSteps step1 step2 />
        </div>

        {/* Page Header */}
        <div className='shipping-header'>
          <Row className='align-items-center'>
            <Col>
              <div className='d-flex align-items-center mb-4'>
                <Button
                  variant='outline-secondary'
                  size='sm'
                  onClick={() => navigate('/cart')}
                  className='me-3'
                >
                  <i
                    style={{ color: 'white' }}
                    className='fas fa-arrow-left me-2'
                  ></i>
                  <span style={{ color: 'white' }}>Back to Cart</span>
                </Button>
                <div>
                  <h1 className='shipping-title'>
                    <i className='fas fa-shipping-fast me-3'></i>
                    <span style={{ color: 'white' }}>Delivery Information</span>
                  </h1>
                  <p className='shipping-subtitle'>
                    Please provide your delivery address to ensure safe medicine
                    delivery
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <Row>
          {/* Shipping Form */}
          <Col lg={8}>
            <Card className='shipping-form-card'>
              <Card.Header className='shipping-form-header'>
                <h5 className='mb-0'>
                  <i className='fas fa-map-marker-alt me-2'></i>
                  Shipping Address
                </h5>
                <Badge bg='info' className='ms-2'>
                  <i className='fas fa-shield-alt me-1'></i>
                  Secure & Confidential
                </Badge>
              </Card.Header>
              <Card.Body>
                {/* Saved Addresses Section */}
                {userInfo && (
                  <div className='saved-addresses-section mb-4'>
                    <div className='d-flex justify-content-between align-items-center mb-3'>
                      <h6 className='mb-0' style={{ color: '#ffffffff' }}>
                        <i className='fas fa-bookmark me-2'></i>
                        Saved Addresses ({addresses.length}/3)
                      </h6>
                      {addresses.length < 3 && address.trim() && city.trim() && district.trim() && phone.trim() && (
                        <Button
                          variant='outline-success'
                          size='sm'
                          onClick={() => setShowSaveModal(true)}
                        >
                          <i className='fas fa-save me-1'></i>
                          Save Current Address
                        </Button>
                      )}
                    </div>

                    {addressesLoading ? (
                      <div className='text-center py-3'>
                        <Spinner animation='border' size='sm' />
                        <span className='ms-2' style={{ color: '#000' }}>Loading saved addresses...</span>
                      </div>
                    ) : addresses.length > 0 ? (
                      <Row>
                        {addresses.map((savedAddr) => (
                          <Col md={4} key={savedAddr._id} className='mb-2'>
                            <Card
                              className={`saved-address-card ${savedAddr.isDefault ? 'default-address' : ''}`}
                              style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                              <Card.Body className='p-2'>
                                <div className='d-flex justify-content-between align-items-start mb-1'>
                                  <strong style={{ color: '#ffffffff' }}>
                                    {savedAddr.label || 'Address'}
                                    {savedAddr.isDefault && (
                                      <Badge bg='success' className='ms-1' style={{ fontSize: '0.7rem' }}>
                                        Default
                                      </Badge>
                                    )}
                                  </strong>
                                </div>
                                <p className='mb-1' style={{ fontSize: '0.75rem', color: '#ffffffff' }}>
                                  {savedAddr.address}, {savedAddr.district}, {savedAddr.city}
                                </p>
                                <p className='mb-2' style={{ fontSize: '0.75rem', color: '#ffffffff' }}>
                                  <i className='fas fa-phone me-1'></i>
                                  {savedAddr.phone}
                                </p>
                                <div className='d-flex gap-1'>
                                  <Button
                                    variant='primary'
                                    size='sm'
                                    onClick={() => loadSavedAddress(savedAddr)}
                                    style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                                  >
                                    <i className='fas fa-check me-1'></i>
                                    Use
                                  </Button>
                                  <Button
                                    variant='outline-secondary'
                                    size='sm'
                                    onClick={() => openEditModal(savedAddr)}
                                    style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                                  >
                                    <i className='fas fa-edit'></i>
                                  </Button>
                                  <Button
                                    variant='outline-danger'
                                    size='sm'
                                    onClick={() => openDeleteModal(savedAddr._id)}
                                    disabled={deleteLoading}
                                    style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                                  >
                                    <i className='fas fa-trash'></i>
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <Alert variant='info' className='py-2'>
                        <i className='fas fa-info-circle me-2'></i>
                        <span style={{ color: '#000' }}>No saved addresses yet. Fill out the form and click "Save Current Address" to save.</span>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Quick Address Selection */}
                <div className='quick-addresses mb-4'>
                  <h6 className='quick-address-title'>
                    <i className='fas fa-clock me-2'></i>
                    <span style={{ color: 'white' }}>
                      Quick Select (Medical Areas)
                    </span>
                  </h6>
                  <Row>
                    {quickAddresses.map((addr, index) => (
                      <Col md={4} key={index} className='mb-2'>
                        <Button
                          variant='outline-primary'
                          size='sm'
                          className='quick-address-btn w-100'
                          onClick={() => {
                            setAddress(addr.address);
                            setCity(addr.city);
                            setDistrict(addr.district);
                            setPostalCode(addr.postalCode);
                          }}
                        >
                          <i className='fas fa-hospital me-1'></i>
                          {addr.name}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </div>

                <Form onSubmit={submitHandler}>
                  <Row>
                    {/* Address */}
                    <Col md={12} className='mb-3'>
                      <Form.Group>
                        <Form.Label className='shipping-label required'>
                          <i className='fas fa-home me-2'></i>
                          <span style={{ color: 'white' }}>Full Address</span>
                        </Form.Label>
                        <Form.Control
                          type='text'
                          placeholder='House/Flat No., Street, Area'
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            if (errors.address)
                              setErrors({ ...errors, address: '' });
                          }}
                          isInvalid={!!errors.address}
                          className='shipping-input'
                        />
                        <Form.Control.Feedback type='invalid'>
                          {errors.address}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Division and District */}
                    <Col md={6} className='mb-3'>
                      <Form.Group>
                        <Form.Label className='shipping-label required'>
                          <i className='fas fa-map me-2'></i>
                          <span style={{ color: 'white' }}>Division</span>
                        </Form.Label>
                        <Form.Select
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value);
                            setDistrict(''); // Clear district when division changes
                            if (errors.city) setErrors({ ...errors, city: '' });
                            if (errors.district)
                              setErrors({ ...errors, district: '' });
                          }}
                          isInvalid={!!errors.city}
                          className='shipping-input'
                        >
                          <option value=''>Select Division</option>
                          <option value='Dhaka'>Dhaka</option>
                          <option value='Chittagong'>Chittagong</option>
                          <option value='Rajshahi'>Rajshahi</option>
                          <option value='Khulna'>Khulna</option>
                          <option value='Barishal'>Barishal</option>
                          <option value='Sylhet'>Sylhet</option>
                          <option value='Rangpur'>Rangpur</option>
                          <option value='Mymensingh'>Mymensingh</option>
                        </Form.Select>
                        <Form.Control.Feedback type='invalid'>
                          {errors.city}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6} className='mb-3'>
                      <Form.Group>
                        <Form.Label className='shipping-label required'>
                          <i className='fas fa-city me-2'></i>
                          <span style={{ color: 'white' }}>District</span>
                        </Form.Label>
                        <Form.Select
                          value={district}
                          onChange={(e) => {
                            setDistrict(e.target.value);
                            if (errors.district)
                              setErrors({ ...errors, district: '' });
                          }}
                          isInvalid={!!errors.district}
                          className='shipping-input'
                          disabled={!city}
                        >
                          <option value=''>Select District</option>
                          {getDistrictsForCity(city).map((districtName) => (
                            <option key={districtName} value={districtName}>
                              {districtName}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type='invalid'>
                          {errors.district}
                        </Form.Control.Feedback>
                        {!city && (
                          <Form.Text className='text-muted'>
                            <i className='fas fa-info-circle me-1'></i>
                            Please select a division first
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Postal Code */}
                    <Col md={6} className='mb-3'>
                      <Form.Group>
                        <Form.Label className='shipping-label required'>
                          <i className='fas fa-mail-bulk me-2'></i>
                          <span style={{ color: 'white' }}>Postal Code</span>
                        </Form.Label>
                        <Form.Control
                          type='text'
                          placeholder='e.g., 1000'
                          value={postalCode}
                          onChange={(e) => {
                            setPostalCode(e.target.value.replace(/\D/g, ''));
                            if (errors.postalCode)
                              setErrors({ ...errors, postalCode: '' });
                          }}
                          isInvalid={!!errors.postalCode}
                          className='shipping-input'
                          maxLength='4'
                        />
                        <Form.Control.Feedback type='invalid'>
                          {errors.postalCode}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Phone Number */}
                    <Col md={12} className='mb-3'>
                      <Form.Group>
                        <Form.Label className='shipping-label required'>
                          <i className='fas fa-phone me-2'></i>
                          <span style={{ color: 'white' }}>Phone Number</span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <i className='fas fa-mobile-alt'></i>
                          </InputGroup.Text>
                          <Form.Control
                            type='tel'
                            placeholder='01XXXXXXXXX'
                            value={phone}
                            onChange={handlePhoneChange}
                            isInvalid={!!errors.phone}
                            className='shipping-input'
                            maxLength='14'
                          />
                          <Form.Control.Feedback type='invalid'>
                            {errors.phone}
                          </Form.Control.Feedback>
                        </InputGroup>
                        <Form.Text className='text-muted'>
                          <i className='fas fa-info-circle me-1'></i>
                          Required for delivery coordination
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    {/* Landmark */}
                    <Col md={12} className='mb-3'>
                      <Form.Group>
                        <Form.Label className='shipping-label'>
                          <i className='fas fa-map-pin me-2'></i>
                          <span style={{ color: 'white' }}>
                            Landmark (Optional)
                          </span>
                        </Form.Label>
                        <Form.Control
                          type='text'
                          placeholder='e.g., Near City Hospital, Opposite Pharmacy'
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          className='shipping-input'
                        />
                      </Form.Group>
                    </Col>

                    {/* Delivery Instructions */}
                    <Col md={12} className='mb-4'>
                      <Form.Group>
                        <Form.Label className='shipping-label'>
                          <i className='fas fa-clipboard-list me-2'></i>
                          <span style={{ color: 'white' }}>
                            Delivery Instructions (Optional)
                          </span>
                        </Form.Label>
                        <Form.Control
                          as='textarea'
                          rows={3}
                          placeholder='Special instructions for delivery (e.g., gate code, preferred time, etc.)'
                          value={deliveryInstructions}
                          onChange={(e) =>
                            setDeliveryInstructions(e.target.value)
                          }
                          className='shipping-input'
                          maxLength='200'
                        />
                        <Form.Text className='text-muted'>
                          {deliveryInstructions.length}/200 characters
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Medical Delivery Notice */}
                  <Alert variant='info' className='medical-notice'>
                    <Alert.Heading>
                      <i className='fas fa-medical-kit me-2'></i>
                      Medical Delivery Notice
                    </Alert.Heading>
                    <p className='mb-2'>
                      • All medicines are delivered in secure,
                      temperature-controlled packaging
                    </p>
                    <p className='mb-2'>
                      • Prescription medicines require verification upon
                      delivery
                    </p>
                    <p className='mb-0'>
                      • Our delivery team maintains strict confidentiality
                      protocols
                    </p>
                  </Alert>

                  <div className='form-actions'>
                    <Button
                      variant='outline-secondary'
                      onClick={() => navigate('/cart')}
                      className='me-3'
                      disabled={isLoading}
                    >
                      <i
                        style={{ color: 'white' }}
                        className='fas fa-arrow-left me-2'
                      ></i>
                      <span style={{ color: 'white' }}>Back to Cart</span>
                    </Button>
                    <Button
                      type='submit'
                      variant='primary'
                      className='continue-btn'
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <i className='fas fa-spinner fa-spin me-2'></i>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className='fas fa-credit-card me-2'></i>
                          Continue to Payment
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Order Summary Sidebar */}
          <Col lg={4}>
            <Card className='order-summary-sidebar'>
              <Card.Header className='order-summary-sidebar-header'>
                <h5 className='mb-0'>
                  <i className='fas fa-receipt me-2'></i>
                  Order Summary
                </h5>
              </Card.Header>
              <Card.Body>
                <div className='order-items-count'>
                  <div className='d-flex justify-content-between align-items-center'>
                    <span>Items ({totalItems})</span>
                    <span className='fw-bold'>৳{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className='delivery-info mt-3'>
                  <div className='d-flex justify-content-between align-items-center'>
                    <span>
                      <i className='fas fa-shipping-fast me-1'></i>
                      Delivery
                    </span>
                    {deliveryFee === 0 ? (
                      <span className='text-success fw-bold'>FREE</span>
                    ) : (
                      <span className='fw-bold'>৳{deliveryFee.toFixed(2)}</span>
                    )}
                  </div>
                  <small style={{ color: 'white' }} className='text-muted'>
                    {deliveryFee === 0
                      ? 'Free delivery on orders ≥ ৳1,000'
                      : `৳${(1000 - subtotal).toFixed(
                          2
                        )} more for free delivery`}
                  </small>
                </div>

                <hr />

                <div className='total-amount'>
                  <div className='d-flex justify-content-between align-items-center'>
                    <strong>Total</strong>
                    <strong className='text-danger fs-5'>
                      ৳{finalTotal.toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className='security-badges mt-4'>
                  <h6 className='security-title'>
                    <i className='fas fa-shield-alt me-2'></i>
                    <span style={{ color: 'white' }}>Your Safety Matters</span>
                  </h6>
                  <Row className='text-center'>
                    <Col xs={4}>
                      <div className='security-badge'>
                        <i className='fas fa-lock'></i>
                        <small>Secure</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className='security-badge'>
                        <i className='fas fa-user-shield'></i>
                        <small>Private</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className='security-badge'>
                        <i className='fas fa-certificate'></i>
                        <small>Verified</small>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Save Address Modal */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className='fas fa-save me-2'></i>
            Save Address
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {addError && <Alert variant='danger'>{addError}</Alert>}
          <Form.Group className='mb-3'>
            <Form.Label style={{ color: 'white' }}>Address Label</Form.Label>
            <Form.Control
              type='text'
              placeholder='e.g., Home, Office, Parents House'
              value={addressLabel}
              onChange={(e) => setAddressLabel(e.target.value)}
              maxLength={30}
            />
            <Form.Text className='text-muted'>
              Give this address a name for easy identification
            </Form.Text>
          </Form.Group>
          <Form.Group>
            <Form.Check
              type='checkbox'
              label='Set as default address'
              checked={isDefaultAddress}
              onChange={(e) => setIsDefaultAddress(e.target.checked)}
            />
          </Form.Group>
          <hr />
          <div className='saved-address-preview'>
            <p className='mb-1'><strong>Address:</strong> {address}</p>
            <p className='mb-1'><strong>District:</strong> {district}, {city}</p>
            <p className='mb-1'><strong>Postal Code:</strong> {postalCode}</p>
            <p className='mb-0'><strong>Phone:</strong> {phone}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowSaveModal(false)}>
            Cancel
          </Button>
          <Button variant='primary' onClick={handleSaveAddress} disabled={addLoading}>
            {addLoading ? (
              <>
                <Spinner animation='border' size='sm' className='me-2' />
                Saving...
              </>
            ) : (
              <>
                <i className='fas fa-save me-2'></i>
                Save Address
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Address Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className='fas fa-edit me-2'></i>
            Edit Address
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {updateError && <Alert variant='danger'>{updateError}</Alert>}
          <Form.Group className='mb-3'>
            <Form.Label style={{color:'white'}}>Address Label</Form.Label>
            <Form.Control
              type='text'
              placeholder='e.g., Home, Office, Parents House'
              value={addressLabel}
              onChange={(e) => setAddressLabel(e.target.value)}
              maxLength={30}
            />
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Check
              type='checkbox'
              label='Set as default address'
              checked={isDefaultAddress}
              onChange={(e) => setIsDefaultAddress(e.target.checked)}
            />
          </Form.Group>
          <hr />
          <Row>
            <Col md={12} className='mb-3'>
              <Form.Group>
                <Form.Label style={{color:'white'}}>Full Address</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='House/Flat No., Street, Area'
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6} className='mb-3'>
              <Form.Group>
                <Form.Label style={{color:'white'}}>Division</Form.Label>
                <Form.Select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setDistrict('');
                  }}
                >
                  <option value=''>Select Division</option>
                  <option value='Dhaka'>Dhaka</option>
                  <option value='Chittagong'>Chittagong</option>
                  <option value='Rajshahi'>Rajshahi</option>
                  <option value='Khulna'>Khulna</option>
                  <option value='Barishal'>Barishal</option>
                  <option value='Sylhet'>Sylhet</option>
                  <option value='Rangpur'>Rangpur</option>
                  <option value='Mymensingh'>Mymensingh</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className='mb-3'>
              <Form.Group>
                <Form.Label style={{color:'white'}}>District</Form.Label>
                <Form.Select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!city}
                >
                  <option value=''>Select District</option>
                  {getDistrictsForCity(city).map((districtName) => (
                    <option key={districtName} value={districtName}>
                      {districtName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className='mb-3'>
              <Form.Group>
                <Form.Label style={{color:'white'}}>Postal Code</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='e.g., 1000'
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                  maxLength='4'
                />
              </Form.Group>
            </Col>
            <Col md={6} className='mb-3'>
              <Form.Group>
                <Form.Label style={{color:'white'}}>Phone Number</Form.Label>
                <Form.Control
                  type='tel'
                  placeholder='01XXXXXXXXX'
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength='14'
                />
              </Form.Group>
            </Col>
            <Col md={12} className='mb-3'>
              <Form.Group>
                <Form.Label style={{color:'white'}}>Landmark (Optional)</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='e.g., Near City Hospital'
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={12} className='mb-3'>
              <Form.Group>
                <Form.Label style={{color:'white'}}>Delivery Instructions (Optional)</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={2}
                  placeholder='Special instructions for delivery'
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  maxLength='200'
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant='primary' onClick={handleUpdateAddress} disabled={updateLoading}>
            {updateLoading ? (
              <>
                <Spinner animation='border' size='sm' className='me-2' />
                Updating...
              </>
            ) : (
              <>
                <i className='fas fa-save me-2'></i>
                Update Address
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className='fas fa-trash me-2 text-danger'></i>
            Delete Address
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this saved address?</p>
          <p className='text-muted mb-0'>This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant='danger' onClick={handleDeleteAddress} disabled={deleteLoading}>
            {deleteLoading ? (
              <>
                <Spinner animation='border' size='sm' className='me-2' />
                Deleting...
              </>
            ) : (
              <>
                <i className='fas fa-trash me-2'></i>
                Delete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShippingScreen;
