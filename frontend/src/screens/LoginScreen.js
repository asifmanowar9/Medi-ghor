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
} from 'react-bootstrap';
import { login, firebaseLogin, googleLogin } from '../actions/userActions';
import Message from '../components/Message';
import Loader from '../components/Loader';
import './LoginScreen.css';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { loading, userInfo, error } = userLogin;

  const redirectParam =
    new URLSearchParams(location.search).get('redirect') || '/';
  const redirect = redirectParam.startsWith('/')
    ? redirectParam
    : '/' + redirectParam;

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (email && password) {
      setIsLoading(true);
      setMessage(null);

      // Try traditional login first (for old accounts)
      try {
        await dispatch(login(email, password));
        setIsLoading(false);
        return; // Success, exit
      } catch (traditionalErr) {
        console.log('Traditional login failed, trying Firebase login...');
      }

      // Clear any error from traditional login before trying Firebase
      dispatch({ type: 'USER_LOGIN_FAIL', payload: null });

      // If traditional login fails, try Firebase login
      try {
        console.log('Attempting Firebase login for:', email);
        const result = await dispatch(firebaseLogin(email, password));

        // If email needs verification, redirect to verification page
        if (result && result.needsVerification) {
          navigate('/verify-email');
        }
        setIsLoading(false);
      } catch (firebaseErr) {
        console.error(
          'Both login methods failed. Firebase error:',
          firebaseErr
        );
        setMessage('Login failed. Please check your credentials.');
        setIsLoading(false);
      }
    } else {
      setMessage('Please enter email and password');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setMessage(null);
      await dispatch(googleLogin());
      setIsLoading(false);
      // Navigation will be handled by useEffect when userInfo updates
    } catch (error) {
      console.error('Google login error:', error);
      setMessage(error.message || 'Google login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className='login-container'>
      <Container fluid className='h-100'>
        <Row className='h-100 justify-content-center align-items-center'>
          {/* Left Side - Branding */}
          <Col lg={6} className='d-none d-lg-flex'>
            <div className='branding-section'>
              <div className='brand-content'>
                {/* Brand Logo and Title Section */}
                <div className='brand-header'>
                  <div className='brand-logo'>
                    <div className='logo-circle'>
                      <i className='fas fa-prescription-bottle-alt'></i>
                    </div>
                    <h2 className='brand-title'>Medi-ghor</h2>
                    <p className='brand-subtitle'>
                      Your Trusted Medical Partner
                    </p>
                  </div>
                </div>

                {/* Features List Section */}
                <div className='features-section'>
                  <div className='features-list'>
                    <div className='feature-item'>
                      <div className='feature-icon'>
                        <i className='fas fa-shield-alt'></i>
                      </div>
                      <div className='feature-text'>
                        <h5>Secure & Trusted</h5>
                        <p>Your medical information is safe with us</p>
                      </div>
                    </div>

                    <div className='feature-item'>
                      <div className='feature-icon'>
                        <i className='fas fa-truck'></i>
                      </div>
                      <div className='feature-text'>
                        <h5>Fast Delivery</h5>
                        <p>Get your medicines delivered to your doorstep</p>
                      </div>
                    </div>

                    {/* <div className='feature-item'>
                      <div className='feature-icon'>
                        <i className='fas fa-user-md'></i>
                      </div>
                      <div className='feature-text'>
                        <h5>Expert Care</h5>
                        <p>Professional medical guidance available</p>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Login Form */}
          <Col lg={6}>
            <div className='login-form-section'>
              <Card
                className='login-card'
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  maxWidth: '500px',
                  margin: '0 auto',
                }}
              >
                <Card.Body className='p-5'>
                  {/* Mobile Logo */}
                  <div className='d-lg-none text-center mb-4'>
                    <div className='mobile-logo'>
                      <i className='fas fa-prescription-bottle-alt'></i>
                    </div>
                    <h3 className='text-black mb-0'>Medi-ghor</h3>
                    <p className='text-muted'>Your Trusted Medical Partner</p>
                  </div>

                  <div className='text-center mb-4'>
                    <h2 className='text-black mb-2'>
                      <i className='fas fa-sign-in-alt me-3'></i>
                      Welcome Back
                    </h2>
                    <p className='text-muted mb-0'>
                      Sign in to access your medical dashboard
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

                    <Form.Group controlId='password' className='mb-4'>
                      <div className='d-flex justify-content-between align-items-center mb-2'>
                        <Form.Label
                          style={{
                            color: '#000000',
                            fontWeight: '600',
                            marginBottom: '0',
                          }}
                        >
                          <i className='fas fa-lock me-2'></i>
                          Password
                        </Form.Label>
                        <Link
                          to='/forgot-password'
                          className='text-decoration-none'
                          style={{
                            fontSize: '0.9rem',
                            color: '#3498db',
                            fontWeight: '500',
                          }}
                        >
                          <i className='fas fa-key me-1'></i>
                          Forgot Password?
                        </Link>
                      </div>
                      <InputGroup className='input-group-modern'>
                        <InputGroup.Text
                          style={{
                            background: 'rgba(52, 152, 219, 0.1)',
                            border: '1px solid rgba(52, 152, 219, 0.3)',
                            borderRight: 'none',
                            color: '#3498db',
                          }}
                        >
                          <i className='fas fa-key'></i>
                        </InputGroup.Text>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Enter your password'
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid rgba(52, 152, 219, 0.3)',
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
                            background: 'rgba(52, 152, 219, 0.1)',
                            border: '1px solid rgba(52, 152, 219, 0.3)',
                            borderLeft: 'none',
                            color: '#3498db',
                          }}
                        >
                          <i
                            className={
                              showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'
                            }
                          ></i>
                        </Button>
                      </InputGroup>
                      {showPasswordHelp && (
                        <div
                          className='mt-2 p-3'
                          style={{
                            background: 'rgba(52, 152, 219, 0.1)',
                            border: '1px solid rgba(52, 152, 219, 0.2)',
                            borderRadius: '8px',
                          }}
                        >
                          <Form.Text
                            style={{ color: '#2980b9', fontSize: '0.9rem' }}
                          >
                            <i className='fas fa-lightbulb me-2'></i>
                            <strong>Password Requirements:</strong>
                            <br />
                            • At least one uppercase letter
                            <br />
                            • At least one lowercase letter
                            <br />
                            • At least one number
                            <br />• At least one special character
                          </Form.Text>
                        </div>
                      )}
                    </Form.Group>

                    <Button
                      type='submit'
                      className='w-100 mb-4'
                      size='lg'
                      disabled={loading || isLoading}
                      style={{
                        background: 'linear-gradient(135deg, #3498db, #2980b9)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '1rem',
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        boxShadow: '0 8px 16px rgba(52, 152, 219, 0.3)',
                      }}
                    >
                      {loading || isLoading ? (
                        <>
                          <i className='fas fa-spinner fa-spin me-2'></i>
                          Signing In...
                        </>
                      ) : (
                        <>
                          <i className='fas fa-sign-in-alt me-2'></i>
                          Sign In to Your Account
                        </>
                      )}
                    </Button>
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

                  {/* Google Sign-In Button */}
                  <Button
                    variant='light'
                    className='w-100 mb-3'
                    size='lg'
                    onClick={handleGoogleLogin}
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
                    Continue with Google
                  </Button>

                  <div className='text-center'>
                    <div
                      className='p-3'
                      style={{
                        background: 'rgba(46, 204, 113, 0.1)',
                        border: '1px solid rgba(46, 204, 113, 0.2)',
                        borderRadius: '12px',
                      }}
                    >
                      <p
                        className='mb-2'
                        style={{ color: '#000000', fontSize: '0.95rem' }}
                      >
                        <i className='fas fa-user-plus me-2 text-success'></i>
                        Don't have an account yet?
                      </p>
                      <Link
                        to={
                          redirect
                            ? `/register?redirect=${redirect}`
                            : '/register'
                        }
                        className='btn btn-outline-success'
                        style={{
                          borderRadius: '8px',
                          fontWeight: '600',
                          padding: '0.5rem 2rem',
                        }}
                      >
                        <i className='fas fa-user-plus me-2'></i>
                        Create New Account
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

export default LoginScreen;
