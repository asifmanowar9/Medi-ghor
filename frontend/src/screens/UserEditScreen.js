import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Badge,
} from 'react-bootstrap';
import { getUserDetails, updateUser } from '../actions/userActions';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { USER_UPDATE_RESET } from '../constants/userConstants';
import './UserEditScreen.css';

const UserEditScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('normal_user');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userId } = useParams();

  const userDetails = useSelector((state) => state.userDetails);
  const { loading, user, error } = userDetails;

  const userUpdate = useSelector((state) => state.userUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = userUpdate;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: USER_UPDATE_RESET });
      navigate('/admin/userlist');
    } else {
      if (!user.name || user._id !== userId) {
        dispatch(getUserDetails(userId));
      } else {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role || 'normal_user');
      }
    }
  }, [user, dispatch, userId, successUpdate, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(updateUser({ _id: userId, name, email, role }));
    navigate('/admin/userlist');
  };

  const getRoleInfo = (userRole) => {
    switch (userRole) {
      case 'super_admin':
        return { text: 'Super Admin', bg: 'danger', icon: 'fas fa-crown' };
      case 'operator':
        return { text: 'Operator', bg: 'warning', icon: 'fas fa-user-cog' };
      case 'normal_user':
        return { text: 'User', bg: 'primary', icon: 'fas fa-user' };
      default:
        return { text: 'User (Legacy)', bg: 'secondary', icon: 'fas fa-user' };
    }
  };

  const canEditRole = (targetRole) => {
    if (!userInfo) return false;

    // Super admin can assign any role
    if (userInfo.role === 'super_admin') return true;

    // Operators can only assign normal_user role
    if (userInfo.role === 'operator') {
      return targetRole === 'normal_user';
    }

    // Legacy admin check
    if (userInfo.isAdmin && !userInfo.role) return true;

    return false;
  };

  const getAvailableRoles = () => {
    if (userInfo?.role === 'super_admin') {
      return [
        { value: 'normal_user', label: 'Normal User' },
        { value: 'operator', label: 'Operator' },
        { value: 'super_admin', label: 'Super Admin' },
      ];
    } else if (userInfo?.role === 'operator') {
      return [{ value: 'normal_user', label: 'Normal User' }];
    } else {
      return [
        { value: 'normal_user', label: 'Normal User' },
        { value: 'operator', label: 'Operator' },
      ];
    }
  };

  if (loading) {
    return (
      <Container fluid className='user-edit-container py-4'>
        <div
          className='d-flex justify-content-center align-items-center'
          style={{ minHeight: '60vh' }}
        >
          <Loader />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className='user-edit-container py-4'>
        <Row className='justify-content-center'>
          <Col md={8}>
            <Message variant='danger'>{error}</Message>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className='user-edit-container py-4'>
      {/* Header Section */}
      <Row className='mb-4'>
        <Col>
          <div className='d-flex align-items-center justify-content-between'>
            <div>
              <h1 className='page-title mb-2'>
                <i className='fas fa-user-edit me-3'></i>
                Edit User
              </h1>
              <p className='page-subtitle mb-0'>
                Manage user account settings and permissions
              </p>
            </div>
            <Link
              to='/admin/userlist'
              className='btn btn-outline-light back-btn'
            >
              <i className='fas fa-arrow-left me-2'></i>
              Back to Users
            </Link>
          </div>
        </Col>
      </Row>

      <Row className='justify-content-center'>
        <Col lg={8} xl={6}>
          <Card className='edit-user-card'>
            <Card.Body className='p-4'>
              {/* User Info Header */}
              {user && (
                <div className='user-info-header mb-4'>
                  <div className='d-flex align-items-center'>
                    <div className='user-avatar-large me-3'>
                      <i className='fas fa-user-circle'></i>
                    </div>
                    <div className='flex-grow-1'>
                      <h4 className='user-name mb-1'>{user.name}</h4>
                      <p className='user-email mb-2'>{user.email}</p>
                      <Badge
                        bg={getRoleInfo(user.role || 'normal_user').bg}
                        className='role-badge'
                      >
                        <i
                          className={`${
                            getRoleInfo(user.role || 'normal_user').icon
                          } me-1`}
                        ></i>
                        {getRoleInfo(user.role || 'normal_user').text}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              {loadingUpdate && (
                <div className='text-center mb-4'>
                  <Loader />
                </div>
              )}
              {errorUpdate && (
                <div className='mb-4'>
                  <Message variant='danger'>{errorUpdate}</Message>
                </div>
              )}

              {/* Edit Form */}
              <Form onSubmit={submitHandler}>
                {/* Basic Information Section */}
                <div className='form-section mb-4'>
                  <h5 className='section-title'>
                    <i className='fas fa-user me-2'></i>
                    Basic Information
                  </h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className='mb-3'>
                        <Form.Label className='form-label'>
                          <i className='fas fa-signature me-2'></i>
                          Full Name
                        </Form.Label>
                        <Form.Control
                          type='text'
                          placeholder='Enter full name'
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className='modern-input'
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className='mb-3'>
                        <Form.Label className='form-label'>
                          <i className='fas fa-envelope me-2'></i>
                          Email Address
                        </Form.Label>
                        <Form.Control
                          type='email'
                          placeholder='Enter email address'
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className='modern-input'
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Role Management Section */}
                <div className='form-section mb-4'>
                  <h5 className='section-title'>
                    <i className='fas fa-shield-alt me-2'></i>
                    Role & Permissions
                  </h5>
                  <Row>
                    <Col md={8}>
                      <Form.Group className='mb-3'>
                        <Form.Label className='form-label'>
                          <i className='fas fa-user-tag me-2'></i>
                          User Role
                        </Form.Label>
                        <Form.Select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          disabled={!canEditRole(role)}
                          className='modern-select'
                        >
                          {getAvailableRoles().map((roleOption) => (
                            <option
                              key={roleOption.value}
                              value={roleOption.value}
                            >
                              {roleOption.label}
                            </option>
                          ))}
                        </Form.Select>
                        {!canEditRole(role) && (
                          <div className='permission-notice mt-2'>
                            <i className='fas fa-exclamation-triangle me-2'></i>
                            You don't have permission to modify this user's
                            role.
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <div className='role-info-card'>
                        <h6 className='role-info-title'>Current Role</h6>
                        <Badge
                          bg={getRoleInfo(role).bg}
                          className='role-display-badge'
                        >
                          <i className={`${getRoleInfo(role).icon} me-1`}></i>
                          {getRoleInfo(role).text}
                        </Badge>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Action Buttons */}
                <div className='form-actions pt-3 border-top'>
                  <Row>
                    <Col sm={6}>
                      <Link
                        to='/admin/userlist'
                        className='btn btn-outline-secondary w-100 cancel-btn'
                      >
                        <i className='fas fa-times me-2'></i>
                        Cancel
                      </Link>
                    </Col>
                    <Col sm={6}>
                      <Button
                        type='submit'
                        variant='primary'
                        className='w-100 save-btn'
                        disabled={loadingUpdate}
                      >
                        {loadingUpdate ? (
                          <>
                            <i className='fas fa-spinner fa-spin me-2'></i>
                            Updating...
                          </>
                        ) : (
                          <>
                            <i className='fas fa-save me-2'></i>
                            Update User
                          </>
                        )}
                      </Button>
                    </Col>
                  </Row>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserEditScreen;
