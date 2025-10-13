import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import { listUsers, deleteUser } from '../actions/userActions';
import './UserListScreen.css';

const UserListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const userList = useSelector((state) => state.userList);
  const { loading, error, users } = userList;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userDelete = useSelector((state) => state.userDelete);
  const { success: successDelete } = userDelete;

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listUsers());
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, userInfo, successDelete]);

  // Filter and sort users
  const getFilteredAndSortedUsers = () => {
    if (!users) return [];

    let filteredUsers = users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user._id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        filterRole === '' ||
        (filterRole === 'super_admin' && user.role === 'super_admin') ||
        (filterRole === 'operator' && user.role === 'operator') ||
        (filterRole === 'normal_user' &&
          (user.role === 'normal_user' || !user.role)) || // Include legacy users as normal users
        (filterRole === 'legacy' && !user.role); // New filter for legacy users

      return matchesSearch && matchesRole;
    });

    // Sort users
    filteredUsers.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'role':
          const roleOrder = { super_admin: 3, operator: 2, normal_user: 1 };
          aValue = roleOrder[a.role] || (a.isAdmin ? 2 : 1);
          bValue = roleOrder[b.role] || (b.isAdmin ? 2 : 1);
          break;
        case 'date':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          return 0;
      }

      if (sortOrder === 'desc') {
        [aValue, bValue] = [bValue, aValue];
      }

      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue);
      }
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    });

    return filteredUsers;
  };

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id));
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterRole('');
    setSortBy('name');
    setSortOrder('asc');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEmailClick = (email) => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=Medi-ghor: Customer Support&body=Hello,\n\nWe hope you're doing well.\n\nBest regards,\nMedi-ghor Team`;
    window.open(gmailUrl, '_blank');
  };

  const getRoleInfo = (user) => {
    if (user.role) {
      switch (user.role) {
        case 'super_admin':
          return { text: 'Super Admin', bg: 'danger', icon: 'fas fa-crown' };
        case 'operator':
          return { text: 'Operator', bg: 'warning', icon: 'fas fa-user-cog' };
        case 'normal_user':
          return { text: 'User', bg: 'primary', icon: 'fas fa-user' };
        default:
          return { text: 'User', bg: 'primary', icon: 'fas fa-user' };
      }
    } else {
      // Legacy users without role field are treated as normal users
      return { text: 'User (Legacy)', bg: 'secondary', icon: 'fas fa-user' };
    }
  };

  const canManageUser = (targetUser) => {
    if (!userInfo) return false;

    // Super admin can manage everyone
    if (userInfo.role === 'super_admin') return true;

    // Operators can only manage normal users and legacy users
    if (userInfo.role === 'operator') {
      return (
        targetUser.role === 'normal_user' || !targetUser.role // Legacy users without role field are treated as normal users
      );
    }

    // Legacy admin with super_admin role can manage everyone
    if (userInfo.isAdmin && userInfo.role === 'super_admin') return true;

    return false;
  };

  const filteredUsers = getFilteredAndSortedUsers();

  if (loading) {
    return (
      <Container fluid className='py-4'>
        <Loader />
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className='py-4'>
        <Message variant='danger'>{error}</Message>
      </Container>
    );
  }

  return (
    <Container fluid className='py-4'>
      {/* Header Section */}
      <div className='mb-4'>
        <Row className='align-items-center mb-3'>
          <Col>
            <h2 className='text-black mb-0'>
              <i className='fas fa-users me-3'></i>
              User Management
            </h2>
            <p className='text-black mb-0'>
              Manage and monitor all registered users
            </p>
          </Col>
          <Col xs='auto'>
            <div className='d-flex gap-2'>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                size='sm'
                onClick={() => setViewMode('grid')}
              >
                <i className='fas fa-th me-1'></i>
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                size='sm'
                onClick={() => setViewMode('list')}
              >
                <i className='fas fa-list me-1'></i>
                List
              </Button>
            </div>
          </Col>
        </Row>

        {/* Statistics Row */}
        <Row className='mb-4'>
          <Col md={userInfo?.role === 'operator' ? 4 : 3}>
            <Card
              className='stats-card h-100'
              style={{
                background: 'linear-gradient(135deg, #3498db, #2980b9)',
                border: 'none',
                borderRadius: '15px',
              }}
            >
              <Card.Body className='text-center text-white'>
                <i className='fas fa-users fa-2x mb-2'></i>
                <h4 className='mb-0'>{users?.length || 0}</h4>
                <small>Total Users</small>
              </Card.Body>
            </Card>
          </Col>
          {/* Hide Super Admin stats from operators */}
          {userInfo?.role !== 'operator' && (
            <Col md={3}>
              <Card
                className='stats-card h-100'
                style={{
                  background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                  border: 'none',
                  borderRadius: '15px',
                }}
              >
                <Card.Body className='text-center text-white'>
                  <i className='fas fa-crown fa-2x mb-2'></i>
                  <h4 className='mb-0'>
                    {users?.filter((user) => user.role === 'super_admin')
                      .length || 0}
                  </h4>
                  <small>Super Admins</small>
                </Card.Body>
              </Card>
            </Col>
          )}
          <Col md={userInfo?.role === 'operator' ? 4 : 3}>
            <Card
              className='stats-card h-100'
              style={{
                background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                border: 'none',
                borderRadius: '15px',
              }}
            >
              <Card.Body className='text-center text-white'>
                <i className='fas fa-user-cog fa-2x mb-2'></i>
                <h4 className='mb-0'>
                  {users?.filter((user) => user.role === 'operator').length ||
                    0}
                </h4>
                <small>Operators</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={userInfo?.role === 'operator' ? 4 : 3}>
            <Card
              className='stats-card h-100'
              style={{
                background: 'linear-gradient(135deg, #3498db, #2980b9)',
                border: 'none',
                borderRadius: '15px',
              }}
            >
              <Card.Body className='text-center text-white'>
                <i className='fas fa-user fa-2x mb-2'></i>
                <h4 className='mb-0'>
                  {users?.filter(
                    (user) =>
                      user.role === 'normal_user' ||
                      (!user.role && !user.isAdmin)
                  ).length || 0}
                </h4>
                <small>Normal Users</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Controls Section */}
      <Card
        className='mb-4'
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '15px',
        }}
      >
        <Card.Body>
          <Row className='g-3'>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text
                  style={{
                    background: 'rgba(52, 152, 219, 0.1)',
                    border: '1px solid rgba(52, 152, 219, 0.3)',
                    color: '#000000',
                  }}
                >
                  <i className='fas fa-search'></i>
                </InputGroup.Text>
                <Form.Control
                  type='text'
                  placeholder='Search by name, email, or ID...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(52, 152, 219, 0.3)',
                    color: '#000000',
                  }}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <div className='d-flex gap-2'>
                <Button
                  variant={showFilters ? 'primary' : 'outline-primary'}
                  onClick={() => setShowFilters(!showFilters)}
                  className='flex-fill'
                >
                  <i className='fas fa-filter me-2'></i>
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <Button variant='outline-secondary' onClick={resetFilters}>
                  <i className='fas fa-undo'></i>
                </Button>
              </div>
            </Col>
          </Row>

          {/* Advanced Filters */}
          {showFilters && (
            <Row
              className='mt-3 pt-3'
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ color: '#000000', fontWeight: '500' }}>
                    <i className='fas fa-user-tag me-2'></i>
                    User Role
                  </Form.Label>
                  <Form.Select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(52, 152, 219, 0.3)',
                      color: '#000000',
                    }}
                  >
                    <option value=''>All Roles</option>
                    {/* Hide Super Admin filter option from operators */}
                    {userInfo?.role !== 'operator' && (
                      <option value='super_admin'>Super Admin</option>
                    )}
                    <option value='operator'>Operator</option>
                    <option value='normal_user'>Normal User</option>
                    <option value='legacy'>Legacy User (No Role)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ color: '#000000', fontWeight: '500' }}>
                    <i className='fas fa-sort me-2'></i>
                    Sort By
                  </Form.Label>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(52, 152, 219, 0.3)',
                      color: '#000000',
                    }}
                  >
                    <option value='name'>Name</option>
                    <option value='email'>Email</option>
                    <option value='role'>Role</option>
                    <option value='date'>Join Date</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ color: '#000000', fontWeight: '500' }}>
                    <i className='fas fa-sort-amount-down me-2'></i>
                    Sort Order
                  </Form.Label>
                  <Form.Select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(52, 152, 219, 0.3)',
                      color: '#000000',
                    }}
                  >
                    <option value='asc'>Ascending</option>
                    <option value='desc'>Descending</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Users Display */}
      {filteredUsers.length === 0 ? (
        <Card
          className='text-center py-5'
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '15px',
          }}
        >
          <Card.Body>
            <i className='fas fa-user-slash fa-3x text-black mb-3'></i>
            <h5 className='text-black'>No Users Found</h5>
            <p className='text-black'>
              {searchTerm || filterRole
                ? 'Try adjusting your search criteria or filters'
                : 'No users are registered yet'}
            </p>
            {(searchTerm || filterRole) && (
              <Button variant='primary' onClick={resetFilters}>
                <i className='fas fa-undo me-2'></i>
                Clear Filters
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Row className='g-4'>
              {filteredUsers.map((user) => (
                <Col key={user._id} lg={4} md={6} sm={12}>
                  <Card
                    className='user-card h-100'
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '15px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Card.Body className='p-4'>
                      <div className='d-flex align-items-center mb-3'>
                        <div
                          className='user-avatar me-3'
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: user.isAdmin
                              ? 'linear-gradient(135deg, #e74c3c, #c0392b)'
                              : 'linear-gradient(135deg, #3498db, #2980b9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            color: 'white',
                          }}
                        >
                          <i
                            className={
                              user.isAdmin
                                ? 'fas fa-user-shield'
                                : 'fas fa-user'
                            }
                          ></i>
                        </div>
                        <div className='flex-grow-1'>
                          <h5
                            className='mb-1'
                            style={{ color: '#000000', fontWeight: '600' }}
                          >
                            {user.name || 'N/A'}
                          </h5>
                          <Badge
                            bg={getRoleInfo(user).bg}
                            className='d-flex align-items-center gap-1 w-auto'
                            style={{
                              width: 'fit-content',
                              fontSize: '0.75rem',
                            }}
                          >
                            <i className={getRoleInfo(user).icon}></i>
                            {getRoleInfo(user).text}
                          </Badge>
                        </div>
                      </div>

                      <div className='user-details mb-3'>
                        <div className='mb-2'>
                          <small className='text-black'>
                            <i className='fas fa-envelope me-2'></i>
                            Email
                          </small>
                          <p
                            className='mb-0'
                            style={{
                              color: '#000000',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleEmailClick(user.email)}
                            title='Click to compose email in Gmail'
                          >
                            {user.email || 'N/A'}
                          </p>
                        </div>
                        <div className='mb-2'>
                          <small className='text-black'>
                            <i className='fas fa-id-card me-2'></i>
                            User ID
                          </small>
                          <p
                            className='mb-0'
                            style={{
                              color: '#000000',
                              fontSize: '0.85rem',
                              fontFamily: 'monospace',
                            }}
                          >
                            {user._id?.slice(-8) || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <small className='text-black'>
                            <i className='fas fa-calendar me-2'></i>
                            Joined
                          </small>
                          <p
                            className='mb-0'
                            style={{ color: '#000000', fontSize: '0.9rem' }}
                          >
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className='d-flex gap-2'>
                        {canManageUser(user) ? (
                          <>
                            <LinkContainer
                              to={`/admin/user/${user._id}/edit`}
                              className='flex-fill'
                            >
                              <Button
                                variant='outline-primary'
                                size='sm'
                                className='w-100'
                                style={{
                                  borderColor: 'rgba(52, 152, 219, 0.5)',
                                  color: '#3498db',
                                }}
                              >
                                <i className='fas fa-edit me-2'></i>
                                Edit
                              </Button>
                            </LinkContainer>
                            <Button
                              variant='outline-danger'
                              size='sm'
                              onClick={() => deleteHandler(user._id)}
                              style={{
                                borderColor: 'rgba(231, 76, 60, 0.5)',
                                color: '#e74c3c',
                              }}
                            >
                              <i className='fas fa-trash'></i>
                            </Button>
                          </>
                        ) : (
                          <Badge
                            bg='secondary'
                            className='text-white w-100 py-2'
                          >
                            <i className='fas fa-shield-alt me-2'></i>
                            Protected User
                          </Badge>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '15px',
              }}
            >
              <Card.Body className='p-0'>
                <div className='table-responsive'>
                  <table className='table table-hover mb-0'>
                    <thead
                      style={{
                        background: 'rgba(52, 152, 219, 0.1)',
                        borderBottom: '2px solid rgba(52, 152, 219, 0.3)',
                      }}
                    >
                      <tr>
                        <th
                          className='px-4 py-3'
                          style={{ color: '#000000', fontWeight: '600' }}
                        >
                          User
                        </th>
                        <th
                          className='px-4 py-3'
                          style={{ color: '#000000', fontWeight: '600' }}
                        >
                          Email
                        </th>
                        <th
                          className='px-4 py-3'
                          style={{ color: '#000000', fontWeight: '600' }}
                        >
                          Role
                        </th>
                        <th
                          className='px-4 py-3'
                          style={{ color: '#000000', fontWeight: '600' }}
                        >
                          Join Date
                        </th>
                        <th
                          className='px-4 py-3'
                          style={{ color: '#000000', fontWeight: '600' }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <tr
                          key={user._id}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.3s ease',
                          }}
                          className='table-row-hover'
                        >
                          <td className='px-4 py-3'>
                            <div className='d-flex align-items-center'>
                              <div
                                className='user-avatar me-3'
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  background: user.isAdmin
                                    ? 'linear-gradient(135deg, #e74c3c, #c0392b)'
                                    : 'linear-gradient(135deg, #3498db, #2980b9)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.2rem',
                                  color: 'white',
                                }}
                              >
                                <i
                                  className={
                                    user.isAdmin
                                      ? 'fas fa-user-shield'
                                      : 'fas fa-user'
                                  }
                                ></i>
                              </div>
                              <div>
                                <div
                                  style={{
                                    color: '#000000',
                                    fontWeight: '600',
                                  }}
                                >
                                  {user.name || 'N/A'}
                                </div>
                                <small
                                  className='text-muted'
                                  style={{ fontFamily: 'monospace' }}
                                >
                                  ID: {user._id?.slice(-8)}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className='px-4 py-3'>
                            <span
                              style={{ color: '#000000', cursor: 'pointer' }}
                              onClick={() => handleEmailClick(user.email)}
                              title='Click to compose email in Gmail'
                            >
                              {user.email || 'N/A'}
                            </span>
                          </td>
                          <td className='px-4 py-3'>
                            <Badge
                              bg={getRoleInfo(user).bg}
                              className='d-flex align-items-center gap-1'
                              style={{
                                width: 'fit-content',
                                fontSize: '0.75rem',
                              }}
                            >
                              <i className={getRoleInfo(user).icon}></i>
                              {getRoleInfo(user).text}
                            </Badge>
                          </td>
                          <td
                            className='px-4 py-3'
                            style={{ color: '#000000' }}
                          >
                            {formatDate(user.createdAt)}
                          </td>
                          <td className='px-4 py-3'>
                            <div className='d-flex gap-2'>
                              {canManageUser(user) ? (
                                <>
                                  <LinkContainer
                                    to={`/admin/user/${user._id}/edit`}
                                  >
                                    <Button
                                      variant='outline-primary'
                                      size='sm'
                                      style={{
                                        borderColor: 'rgba(52, 152, 219, 0.5)',
                                        color: '#3498db',
                                      }}
                                    >
                                      <i className='fas fa-edit'></i>
                                    </Button>
                                  </LinkContainer>
                                  <Button
                                    variant='outline-danger'
                                    size='sm'
                                    onClick={() => deleteHandler(user._id)}
                                    style={{
                                      borderColor: 'rgba(231, 76, 60, 0.5)',
                                      color: '#e74c3c',
                                    }}
                                  >
                                    <i className='fas fa-trash'></i>
                                  </Button>
                                </>
                              ) : (
                                <Badge bg='secondary' className='text-white'>
                                  <i className='fas fa-shield-alt me-1'></i>
                                  Protected
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default UserListScreen;
