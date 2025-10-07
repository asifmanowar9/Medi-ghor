import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import './ForgotPasswordScreen.css';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setMessage(
        'Password reset email sent! Please check your inbox and follow the instructions.'
      );
      setEmail('');
    } catch (err) {
      console.error('Password reset error:', err);

      // Handle different error codes
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/too-many-requests':
          setError('Too many requests. Please try again later');
          break;
        default:
          setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='forgot-password-container'>
      <Container className='py-5'>
        <div
          className='d-flex justify-content-center align-items-center'
          style={{ minHeight: 'calc(100vh - 200px)' }}
        >
          <Card
            className='forgot-password-card'
            style={{
              maxWidth: '500px',
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
                  className='icon-wrapper mb-4'
                  style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto',
                    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(231, 76, 60, 0.3)',
                  }}
                >
                  <i
                    className='fas fa-key'
                    style={{ fontSize: '2rem', color: 'white' }}
                  ></i>
                </div>
                <h2 className='text-dark mb-2'>
                  <strong>Forgot Password?</strong>
                </h2>
                <p className='text-muted' style={{ fontSize: '0.95rem' }}>
                  No worries! Enter your email address and we'll send you
                  instructions to reset your password.
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

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId='email' className='mb-4'>
                  <Form.Label className='text-dark fw-semibold'>
                    <i className='fas fa-envelope me-2'></i>
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='Enter your email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '2px solid #e0e0e0',
                      fontSize: '1rem',
                    }}
                  />
                </Form.Group>

                <Button
                  type='submit'
                  variant='primary'
                  size='lg'
                  className='w-100 mb-3'
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    boxShadow: '0 8px 16px rgba(231, 76, 60, 0.3)',
                  }}
                >
                  {loading ? (
                    <>
                      <i className='fas fa-spinner fa-spin me-2'></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className='fas fa-paper-plane me-2'></i>
                      Send Reset Link
                    </>
                  )}
                </Button>
              </Form>

              <div
                className='mt-4 pt-4 text-center'
                style={{ borderTop: '1px solid #e0e0e0' }}
              >
                <Link
                  to='/login'
                  className='text-decoration-none'
                  style={{
                    color: '#3498db',
                    fontWeight: '600',
                    fontSize: '1rem',
                  }}
                >
                  <i className='fas fa-arrow-left me-2'></i>
                  Back to Login
                </Link>
              </div>

              <div className='mt-3 text-center'>
                <small className='text-muted'>
                  <i className='fas fa-info-circle me-2'></i>
                  You'll receive an email with instructions to reset your
                  password
                </small>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default ForgotPasswordScreen;
