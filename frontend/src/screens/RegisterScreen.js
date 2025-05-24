import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { register } from '../actions/userActions';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { validatePassword } from '../utils/passwordValidator';

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

  const submitHandler = (e) => {
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
    } else {
      dispatch(register(name, email, password));
    }
  };

  return (
    <FormContainer>
      <h1>Sign Up</h1>
      {message && <Message variant='danger'>{message}</Message>}
      {error && <Message variant='danger'>{error}</Message>}
      {loading && <Loader />}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId='name'>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type='name'
            placeholder='Enter name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId='email'>
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type='email'
            placeholder='Enter email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId='password' className='mt-3'>
          <Form.Label>Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              placeholder='Enter password'
              value={password}
              onChange={handlePasswordChange}
            ></Form.Control>
            <Button
              variant='outline-secondary'
              onClick={toggleShowPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <i
                className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}
              ></i>
            </Button>
          </InputGroup>
          {password && (
            <Form.Text
              className={
                passwordStrength.isValid ? 'text-success' : 'text-muted'
              }
            >
              {passwordStrength.isValid
                ? '✓ Password meets requirements'
                : 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'}
            </Form.Text>
          )}
        </Form.Group>

        <Form.Group controlId='confirmPassword' className='mt-3'>
          <Form.Label>Confirm Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='Confirm password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></Form.Control>
            <Button
              variant='outline-secondary'
              onClick={toggleShowConfirmPassword}
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
            >
              <i
                className={
                  showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'
                }
              ></i>
            </Button>
          </InputGroup>
        </Form.Group>

        <Button
          type='submit'
          variant='primary'
          className='mt-3'
          disabled={!passwordStrength.isValid}
        >
          Register
        </Button>
      </Form>

      <Row className='py-3'>
        <Col>
          Have an Account?{' '}
          <Link to={redirect ? `/login?redirect=${redirect}` : '/login'}>
            Login
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default RegisterScreen;
