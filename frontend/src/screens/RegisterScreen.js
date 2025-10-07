import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form,
  Button,
  Row,
  Col,
  InputGroup,
  Container,
  Card,
  ProgressBar,
} from 'react-bootstrap';
import {
  register,
  googleLogin,
  firebaseRegister,
} from '../actions/userActions';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { validatePassword } from '../utils/passwordValidator';
import './RegisterScreen.css';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    message: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formStep, setFormStep] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userRegister = useSelector((state) => state.userRegister);
  const { loading, userInfo, error } = userRegister;

  const redirect = location.search
    ? new URLSearchParams(location.search).get('redirect') || '/'
    : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Only validate if there's a password entered
    if (newPassword) {
      setPasswordStrength(validatePassword(newPassword));
    } else {
      setPasswordStrength({ isValid: false, message: '' });
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getPasswordStrengthColor = () => {
    if (!password) return 'secondary';
    if (passwordStrength.isValid) return 'success';
    if (password.length < 4) return 'danger';
    if (password.length < 8) return 'warning';
    return 'info';
  };

  const getPasswordStrengthPercentage = () => {
    if (!password) return 0;
    if (passwordStrength.isValid) return 100;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const canProceedToStep2 = () => {
    return name.trim() && email.trim() && email.includes('@');
  };

  const canSubmit = () => {
    return (
      passwordStrength.isValid &&
      password === confirmPassword &&
      canProceedToStep2()
    );
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Reset previous error messages
    setMessage(null);

    // Validate password meets requirements
    const passwordValidation = validatePassword(password);

    if (!passwordValidation.isValid) {
      setMessage(passwordValidation.message);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Use Firebase registration with email verification
      const result = await dispatch(firebaseRegister(name, email, password));

      if (result && result.needsVerification) {
        // Redirect to email verification screen
        navigate('/verify-email');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
    setIsLoading(false);
  };

  const handleGoogleRegister = async () => {
    try {
      setIsLoading(true);
      await dispatch(googleLogin());
      setIsLoading(false);
    } catch (error) {
      setMessage(error.message || 'Google registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className='register-container'>
      <Container fluid className='h-100'>
        <Row className='h-100 justify-content-center align-items-center'>
          {/* Left Side - Branding */}
          <Col lg={6} className='d-none d-lg-flex'>
            <div className='branding-section'>
              <div className='brand-content'>
                {/* Brand Header Section */}
                <div className='brand-header'>
                  <div className='brand-logo'>
                    <div className='logo-circle'>
                      <i className='fas fa-prescription-bottle-alt'></i>
                    </div>
                    <h2 className='brand-title'>Join Medi-ghor</h2>
                    <p className='brand-subtitle'>
                      Start your healthy journey with us
                    </p>
                  </div>
                </div>

                {/* Benefits Section */}
                <div className='benefits-section'>
                  <div className='benefits-list'>
                    <div className='benefit-item'>
                      <div className='benefit-icon'>
                        <i className='fas fa-check-circle'></i>
                      </div>
                      <div className='benefit-text'>
                        <h5>Free Account Creation</h5>
                        <p>No hidden charges or subscription fees</p>
                      </div>
                    </div>

                    <div className='benefit-item'>
                      <div className='benefit-icon'>
                        <i className='fas fa-prescription'></i>
                      </div>
                      <div className='benefit-text'>
                        <h5>Prescription Management</h5>
                        <p>Upload and manage your prescriptions digitally</p>
                      </div>
                    </div>

                    <div className='benefit-item'>
                      <div className='benefit-icon'>
                        <i className='fas fa-history'></i>
                      </div>
                      <div className='benefit-text'>
                        <h5>Order History</h5>
                        <p>Track all your medical purchases in one place</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Registration Form */}
          <Col lg={6}>
            <div className='register-form-section'>
              <Card
                className='register-card'
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  maxWidth: '550px',
                  margin: '0 auto',
                }}
              >
                <Card.Body className='p-5'>
                  {/* Mobile Logo */}
                  <div className='d-lg-none text-center mb-4'>
                    <div className='mobile-logo'>
                      <i className='fas fa-prescription-bottle-alt'></i>
                    </div>
                    <h3 className='text-black mb-0'>Join Medi-ghor</h3>
                    <p className='text-muted'>Start your healthy journey</p>
                  </div>

                  {/* Progress Indicator */}
                  <div className='mb-4'>
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <span style={{ color: '#000000', fontWeight: '600' }}>
                        Step {formStep} of 2
                      </span>
                      <span style={{ color: '#3498db', fontSize: '0.9rem' }}>
                        {formStep === 1
                          ? 'Basic Information'
                          : 'Security Setup'}
                      </span>
                    </div>
                    <ProgressBar
                      now={(formStep / 2) * 100}
                      style={{ height: '6px', borderRadius: '3px' }}
                      variant='info'
                    />
                  </div>

                  <div className='text-center mb-4'>
                    <h2 className='text-black mb-2'>
                      <i className='fas fa-user-plus me-3'></i>
                      Create Account
                    </h2>
                    <p className='text-muted mb-0'>
                      {formStep === 1
                        ? 'Tell us about yourself'
                        : 'Set up your password'}
                    </p>
                  </div>

                  {message && (
                    <div className='mb-3'>
                      <Message variant='danger'>{message}</Message>
                    </div>
                  )}
                  {error && (
                    <div className='mb-3'>
                      <Message variant='danger'>{error}</Message>
                    </div>
                  )}
                  {(loading || isLoading) && (
                    <div className='text-center mb-3'>
                      <Loader />
                    </div>
                  )}

                  <Form onSubmit={submitHandler}>
                    {formStep === 1 && (
                      <>
                        <Form.Group controlId='name' className='mb-4'>
                          <Form.Label
                            style={{
                              color: '#000000',
                              fontWeight: '600',
                              marginBottom: '0.75rem',
                            }}
                          >
                            <i className='fas fa-user me-2'></i>
                            Full Name
                          </Form.Label>
                          <InputGroup className='input-group-modern'>
                            <InputGroup.Text
                              style={{
                                background: 'rgba(46, 204, 113, 0.1)',
                                border: '1px solid rgba(46, 204, 113, 0.3)',
                                borderRight: 'none',
                                color: '#27ae60',
                              }}
                            >
                              <i className='fas fa-id-card'></i>
                            </InputGroup.Text>
                            <Form.Control
                              type='text'
                              placeholder='Enter your full name'
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(46, 204, 113, 0.3)',
                                borderLeft: 'none',
                                color: '#000000',
                                padding: '0.75rem 1rem',
                                fontSize: '1rem',
                              }}
                              required
                            />
                          </InputGroup>
                        </Form.Group>

                        <Form.Group controlId='email' className='mb-4'>
                          <Form.Label
                            style={{
                              color: '#000000',
                              fontWeight: '600',
                              marginBottom: '0.75rem',
                            }}
                          >
                            <i className='fas fa-envelope me-2'></i>
                            Email Address
                          </Form.Label>
                          <InputGroup className='input-group-modern'>
                            <InputGroup.Text
                              style={{
                                background: 'rgba(52, 152, 219, 0.1)',
                                border: '1px solid rgba(52, 152, 219, 0.3)',
                                borderRight: 'none',
                                color: '#3498db',
                              }}
                            >
                              <i className='fas fa-at'></i>
                            </InputGroup.Text>
                            <Form.Control
                              type='email'
                              placeholder='Enter your email address'
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(52, 152, 219, 0.3)',
                                borderLeft: 'none',
                                color: '#000000',
                                padding: '0.75rem 1rem',
                                fontSize: '1rem',
                              }}
                              required
                            />
                          </InputGroup>
                        </Form.Group>

                        <Button
                          type='button'
                          className='w-100 mb-3'
                          size='lg'
                          disabled={!canProceedToStep2()}
                          onClick={() => setFormStep(2)}
                          style={{
                            background: canProceedToStep2()
                              ? 'linear-gradient(135deg, #27ae60, #229954)'
                              : 'rgba(52, 152, 219, 0.3)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '1rem',
                            fontWeight: '600',
                            fontSize: '1.1rem',
                            boxShadow: canProceedToStep2()
                              ? '0 8px 16px rgba(46, 204, 113, 0.3)'
                              : 'none',
                          }}
                        >
                          <i className='fas fa-arrow-right me-2'></i>
                          Continue to Password Setup
                        </Button>
                      </>
                    )}

                    {formStep === 2 && (
                      <>
                        <Form.Group controlId='password' className='mb-4'>
                          <Form.Label
                            style={{
                              color: '#000000',
                              fontWeight: '600',
                              marginBottom: '0.75rem',
                            }}
                          >
                            <i className='fas fa-lock me-2'></i>
                            Password
                          </Form.Label>
                          <InputGroup className='input-group-modern'>
                            <InputGroup.Text
                              style={{
                                background: 'rgba(155, 89, 182, 0.1)',
                                border: '1px solid rgba(155, 89, 182, 0.3)',
                                borderRight: 'none',
                                color: '#9b59b6',
                              }}
                            >
                              <i className='fas fa-key'></i>
                            </InputGroup.Text>
                            <Form.Control
                              type={showPassword ? 'text' : 'password'}
                              placeholder='Create a strong password'
                              value={password}
                              onChange={handlePasswordChange}
                              style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(155, 89, 182, 0.3)',
                                borderLeft: 'none',
                                borderRight: 'none',
                                color: '#000000',
                                padding: '0.75rem 1rem',
                                fontSize: '1rem',
                              }}
                              required
                            />
                            <Button
                              variant='outline-secondary'
                              onClick={toggleShowPassword}
                              aria-label={
                                showPassword ? 'Hide password' : 'Show password'
                              }
                              style={{
                                background: 'rgba(155, 89, 182, 0.1)',
                                border: '1px solid rgba(155, 89, 182, 0.3)',
                                borderLeft: 'none',
                                color: '#9b59b6',
                              }}
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

                          {/* Password Strength Indicator */}
                          {password && (
                            <div className='mt-2'>
                              <div className='d-flex justify-content-between align-items-center mb-1'>
                                <small
                                  style={{
                                    color: '#000000',
                                    fontWeight: '500',
                                  }}
                                >
                                  Password Strength
                                </small>
                                <small
                                  style={{
                                    color:
                                      getPasswordStrengthColor() === 'success'
                                        ? '#27ae60'
                                        : '#e74c3c',
                                  }}
                                >
                                  {passwordStrength.isValid ? 'Strong' : 'Weak'}
                                </small>
                              </div>
                              <ProgressBar
                                now={getPasswordStrengthPercentage()}
                                variant={getPasswordStrengthColor()}
                                style={{ height: '4px', borderRadius: '2px' }}
                              />
                              {!passwordStrength.isValid && password && (
                                <Form.Text
                                  style={{
                                    color: '#e74c3c',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  <i className='fas fa-exclamation-triangle me-1'></i>
                                  {passwordStrength.message ||
                                    'Password must contain uppercase, lowercase, number, and special character'}
                                </Form.Text>
                              )}
                              {passwordStrength.isValid && (
                                <Form.Text
                                  style={{
                                    color: '#27ae60',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  <i className='fas fa-check-circle me-1'></i>
                                  Password meets all requirements
                                </Form.Text>
                              )}
                            </div>
                          )}
                        </Form.Group>

                        <Form.Group
                          controlId='confirmPassword'
                          className='mb-4'
                        >
                          <Form.Label
                            style={{
                              color: '#000000',
                              fontWeight: '600',
                              marginBottom: '0.75rem',
                            }}
                          >
                            <i className='fas fa-shield-alt me-2'></i>
                            Confirm Password
                          </Form.Label>
                          <InputGroup className='input-group-modern'>
                            <InputGroup.Text
                              style={{
                                background: 'rgba(243, 156, 18, 0.1)',
                                border: '1px solid rgba(243, 156, 18, 0.3)',
                                borderRight: 'none',
                                color: '#f39c12',
                              }}
                            >
                              <i className='fas fa-lock'></i>
                            </InputGroup.Text>
                            <Form.Control
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder='Confirm your password'
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(243, 156, 18, 0.3)',
                                borderLeft: 'none',
                                borderRight: 'none',
                                color: '#000000',
                                padding: '0.75rem 1rem',
                                fontSize: '1rem',
                              }}
                              required
                            />
                            <Button
                              variant='outline-secondary'
                              onClick={toggleShowConfirmPassword}
                              aria-label={
                                showConfirmPassword
                                  ? 'Hide password'
                                  : 'Show password'
                              }
                              style={{
                                background: 'rgba(243, 156, 18, 0.1)',
                                border: '1px solid rgba(243, 156, 18, 0.3)',
                                borderLeft: 'none',
                                color: '#f39c12',
                              }}
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
                          {confirmPassword && password !== confirmPassword && (
                            <Form.Text
                              style={{ color: '#e74c3c', fontSize: '0.85rem' }}
                            >
                              <i className='fas fa-times-circle me-1'></i>
                              Passwords do not match
                            </Form.Text>
                          )}
                          {confirmPassword &&
                            password === confirmPassword &&
                            password && (
                              <Form.Text
                                style={{
                                  color: '#27ae60',
                                  fontSize: '0.85rem',
                                }}
                              >
                                <i className='fas fa-check-circle me-1'></i>
                                Passwords match
                              </Form.Text>
                            )}
                        </Form.Group>

                        <div className='d-flex gap-2 mb-4'>
                          <Button
                            type='button'
                            variant='outline-secondary'
                            className='flex-fill'
                            onClick={() => setFormStep(1)}
                            style={{
                              borderRadius: '12px',
                              fontWeight: '600',
                              padding: '0.75rem',
                            }}
                          >
                            <i className='fas fa-arrow-left me-2'></i>
                            Back
                          </Button>
                          <Button
                            type='submit'
                            className='flex-fill'
                            size='lg'
                            disabled={!canSubmit() || loading || isLoading}
                            style={{
                              background: canSubmit()
                                ? 'linear-gradient(135deg, #9b59b6, #8e44ad)'
                                : 'rgba(155, 89, 182, 0.3)',
                              border: 'none',
                              borderRadius: '12px',
                              fontWeight: '600',
                              fontSize: '1.1rem',
                              boxShadow: canSubmit()
                                ? '0 8px 16px rgba(155, 89, 182, 0.3)'
                                : 'none',
                            }}
                          >
                            {loading || isLoading ? (
                              <>
                                <i className='fas fa-spinner fa-spin me-2'></i>
                                Creating...
                              </>
                            ) : (
                              <>
                                <i className='fas fa-user-plus me-2'></i>
                                Create Account
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </Form>

                  {/* Divider */}
                  <div className='d-flex align-items-center my-4'>
                    <hr className='flex-grow-1' />
                    <span
                      className='px-3 text-muted'
                      style={{ fontSize: '0.9rem' }}
                    >
                      OR
                    </span>
                    <hr className='flex-grow-1' />
                  </div>

                  {/* Google Sign-Up Button */}
                  <Button
                    variant='light'
                    className='w-100 mb-3'
                    size='lg'
                    onClick={handleGoogleRegister}
                    disabled={loading || isLoading}
                    style={{
                      background: 'white',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '1rem',
                      fontWeight: '600',
                      color: '#333',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(0, 0, 0, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <img
                      src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
                      alt='Google'
                      style={{
                        width: '20px',
                        height: '20px',
                        marginRight: '10px',
                      }}
                    />
                    Sign up with Google
                  </Button>

                  <div className='text-center'>
                    <div
                      className='p-3'
                      style={{
                        background: 'rgba(52, 152, 219, 0.1)',
                        border: '1px solid rgba(52, 152, 219, 0.2)',
                        borderRadius: '12px',
                      }}
                    >
                      <p
                        className='mb-2'
                        style={{ color: '#000000', fontSize: '0.95rem' }}
                      >
                        <i className='fas fa-sign-in-alt me-2 text-primary'></i>
                        Already have an account?
                      </p>
                      <Link
                        to={redirect ? `/login?redirect=${redirect}` : '/login'}
                        className='btn btn-outline-primary'
                        style={{
                          borderRadius: '8px',
                          fontWeight: '600',
                          padding: '0.5rem 2rem',
                        }}
                      >
                        <i className='fas fa-sign-in-alt me-2'></i>
                        Sign In Instead
                      </Link>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterScreen;
