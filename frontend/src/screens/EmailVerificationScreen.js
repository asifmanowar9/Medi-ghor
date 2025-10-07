import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { auth } from '../config/firebase';
import { sendEmailVerification } from 'firebase/auth';
import axios from 'axios';
import './EmailVerificationScreen.css';

const EmailVerificationScreen = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Get user email from Firebase current user
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
    }

    // Check if user is already verified
    const checkVerification = async () => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          // Redirect to login page
          setMessage('Email already verified! Redirecting to login page...');
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        }
      } else {
        navigate('/register');
      }
    };

    checkVerification();

    // Set up interval to check verification status
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          setMessage('Email verified! Redirecting to login page...');
          clearInterval(interval);
          // Redirect to login page where they can login properly
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        }
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [navigate]);

  const completeLogin = async (user) => {
    try {
      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Send to backend to complete login
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        '/api/users/firebase-login',
        {
          idToken,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          uid: user.uid,
        },
        config
      );

      // Dispatch login success
      dispatch({
        type: 'USER_LOGIN_SUCCESS',
        payload: data,
      });

      // Also dispatch to userLogin reducer
      dispatch({
        type: 'USER_FIREBASE_LOGIN_SUCCESS',
        payload: data,
      });

      localStorage.setItem('userInfo', JSON.stringify(data));

      // Load user cart and wishlist
      dispatch({ type: 'LOAD_USER_CART' });
      dispatch({ type: 'SYNC_WISHLIST_WITH_BACKEND' });

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Login completion error:', error);
      console.error('Error response:', error.response?.data);
      setError(
        'Verification successful but login failed. Please go to login page and sign in with your email and password.'
      );

      // Sign out from Firebase to allow fresh login
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  useEffect(() => {
    // Cooldown timer for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    try {
      setError('');
      setMessage('');
      const user = auth.currentUser;

      if (!user) {
        setError('No user found. Please register again.');
        return;
      }

      await sendEmailVerification(user);
      setMessage('Verification email sent! Please check your inbox.');
      setResendCooldown(60); // 60 seconds cooldown
    } catch (err) {
      console.error('Resend email error:', err);
      setError(err.message || 'Failed to send verification email');
    }
  };

  const handleCheckVerification = async () => {
    try {
      setIsChecking(true);
      setError('');
      setMessage('');

      const user = auth.currentUser;
      if (!user) {
        setError('No user found. Please register again.');
        setIsChecking(false);
        return;
      }

      await user.reload();

      if (user.emailVerified) {
        setMessage('Email verified! Redirecting to login page...');
        // Redirect to login page where they can login properly
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(
          'Email not verified yet. Please check your inbox and click the verification link.'
        );
        setIsChecking(false);
      }
    } catch (err) {
      console.error('Check verification error:', err);
      setError('Failed to check verification status');
      setIsChecking(false);
    }
  };

  return (
    <div className='email-verification-container'>
      <Container className='py-5'>
        <div
          className='d-flex justify-content-center align-items-center'
          style={{ minHeight: '70vh' }}
        >
          <Card
            className='verification-card'
            style={{
              maxWidth: '550px',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Card.Body className='p-5'>
              <div className='text-center mb-4'>
                <div
                  className='verification-icon mb-4'
                  style={{
                    width: '100px',
                    height: '100px',
                    margin: '0 auto',
                    background: 'linear-gradient(135deg, #3498db, #2980b9)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(52, 152, 219, 0.3)',
                  }}
                >
                  <i
                    className='fas fa-envelope-open-text'
                    style={{ fontSize: '3rem', color: 'white' }}
                  ></i>
                </div>
                <h2 className='text-dark mb-3'>
                  <strong>Verify Your Email</strong>
                </h2>
                <p className='text-muted' style={{ fontSize: '1rem' }}>
                  We've sent a verification link to <br />
                  <strong className='text-primary'>
                    {auth.currentUser?.email}
                  </strong>
                </p>
              </div>

              {message && (
                <Alert variant='success' className='mb-4'>
                  <i className='fas fa-check-circle me-2'></i>
                  {message}
                </Alert>
              )}

              {error && (
                <Alert variant='danger' className='mb-4'>
                  <i className='fas fa-exclamation-circle me-2'></i>
                  {error}
                </Alert>
              )}

              <div className='verification-steps mb-4'>
                <div className='step-item mb-3'>
                  <div className='d-flex align-items-start'>
                    <div
                      className='step-number me-3'
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #27ae60, #229954)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                      }}
                    >
                      1
                    </div>
                    <div>
                      <h6 className='text-dark mb-1'>Check Your Inbox</h6>
                      <p
                        className='text-muted mb-0'
                        style={{ fontSize: '0.9rem' }}
                      >
                        Open the email we sent to your address
                      </p>
                    </div>
                  </div>
                </div>

                <div className='step-item mb-3'>
                  <div className='d-flex align-items-start'>
                    <div
                      className='step-number me-3'
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #3498db, #2980b9)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                      }}
                    >
                      2
                    </div>
                    <div>
                      <h6 className='text-dark mb-1'>
                        Click Verification Link
                      </h6>
                      <p
                        className='text-muted mb-0'
                        style={{ fontSize: '0.9rem' }}
                      >
                        Click the button or link in the email
                      </p>
                    </div>
                  </div>
                </div>

                <div className='step-item'>
                  <div className='d-flex align-items-start'>
                    <div
                      className='step-number me-3'
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                      }}
                    >
                      3
                    </div>
                    <div>
                      <h6 className='text-dark mb-1'>Return Here</h6>
                      <p
                        className='text-muted mb-0'
                        style={{ fontSize: '0.9rem' }}
                      >
                        Come back to this page after verifying
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant='primary'
                size='lg'
                className='w-100 mb-3'
                onClick={handleCheckVerification}
                disabled={isChecking}
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
                {isChecking ? (
                  <>
                    <i className='fas fa-spinner fa-spin me-2'></i>
                    Checking...
                  </>
                ) : (
                  <>
                    <i className='fas fa-check-circle me-2'></i>
                    I've Verified My Email
                  </>
                )}
              </Button>

              <div className='text-center'>
                <p className='text-muted mb-2' style={{ fontSize: '0.9rem' }}>
                  Didn't receive the email?
                </p>
                <Button
                  variant='outline-primary'
                  onClick={handleResendEmail}
                  disabled={resendCooldown > 0}
                  style={{
                    borderRadius: '8px',
                    fontWeight: '600',
                    padding: '0.5rem 2rem',
                  }}
                >
                  {resendCooldown > 0 ? (
                    <>
                      <i className='fas fa-clock me-2'></i>
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <i className='fas fa-paper-plane me-2'></i>
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </div>

              <div
                className='mt-4 pt-4'
                style={{ borderTop: '1px solid #e0e0e0' }}
              >
                <div className='text-center'>
                  <small className='text-muted'>
                    <i className='fas fa-info-circle me-2'></i>
                    The page will automatically redirect once your email is
                    verified
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default EmailVerificationScreen;
