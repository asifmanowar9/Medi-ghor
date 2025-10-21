import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Form,
  InputGroup,
  Button,
  Badge,
  Offcanvas,
  Spinner,
} from 'react-bootstrap';
import { logout } from '../actions/userActions';
import { listCategories } from '../actions/categoryActions';
import SearchBox from './SearchBox';
import '../styles/ModernHeader.css';

const ModernHeader = () => {
  const dispatch = useDispatch();
  const [showCategories, setShowCategories] = useState(false);

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const wishlist = useSelector((state) => state.wishlist);
  const { wishlistItems } = wishlist;

  const categoryList = useSelector((state) => state.categoryList);
  const { loading: categoriesLoading, categories } = categoryList;

  const logoutHandler = () => {
    dispatch(logout());
  };

  useEffect(() => {
    if (!categoriesLoading && (!categories || categories.length === 0)) {
      dispatch(listCategories());
    }
  }, [dispatch]);

  return (
    <>
      {/* Top Bar */}
      <div className='top-bar'>
        <Container>
          <div className='d-flex justify-content-between align-items-center'>
            <div className='contact-info'>
              <span className='me-3'>
                <i className='fas fa-phone'></i> +880-123-456789
              </span>
              <span>
                <i className='fas fa-envelope'></i> info@medmart.com
              </span>
            </div>
            <div className='top-links'>
              <span className='me-3'>
                <i className='fas fa-truck'></i> Free Delivery on Orders Over
                ৳500
              </span>
              <span>
                <i className='fas fa-shield-alt'></i> 100% Authentic Products
              </span>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Header */}
      <header className='modern-header'>
        <Navbar bg='white' expand='lg' className='main-navbar shadow-sm'>
          <Container>
            {/* Logo */}
            <LinkContainer to='/'>
              <Navbar.Brand className='brand-logo'>
                <div className='logo-container'>
                  <i className='fas fa-plus-circle text-primary me-2'></i>
                  <span className='brand-text'>MedMart</span>
                  <small className='brand-tagline'>Your Health Partner</small>
                </div>
              </Navbar.Brand>
            </LinkContainer>

            {/* Categories Button */}
            <Button
              variant='outline-primary'
              className='categories-btn d-none d-lg-flex'
              onClick={() => setShowCategories(true)}
            >
              <i className='fas fa-bars me-2'></i>
              All Categories
            </Button>

            {/* Search Bar */}
            <div className='search-section'>
              <SearchBox />
            </div>

            {/* Right Side Icons */}
            <div className='header-icons d-flex align-items-center'>
              {/* AI Test Reports */}
              <LinkContainer
                to={userInfo ? '/chats' : '/login?redirect=/chats'}
              >
                <Nav.Link className='header-icon-link'>
                  <div className='icon-wrapper'>
                    <i className='fas fa-robot'></i>
                    <span className='icon-text'>AI Chat</span>
                  </div>
                </Nav.Link>
              </LinkContainer>

              {/* Track Order */}
              <LinkContainer to='/track-order'>
                <Nav.Link className='header-icon-link'>
                  <div className='icon-wrapper'>
                    <i className='fas fa-search-location'></i>
                    <span className='icon-text'>Track Order</span>
                  </div>
                </Nav.Link>
              </LinkContainer>

              {/* Wishlist */}
              <LinkContainer to='/wishlist'>
                <Nav.Link className='header-icon-link'>
                  <div className='icon-wrapper'>
                    <i className='fas fa-heart'></i>
                    {wishlistItems.length > 0 && (
                      <Badge bg='danger' className='icon-badge'>
                        {wishlistItems.length}
                      </Badge>
                    )}
                    <span className='icon-text'>Wishlist</span>
                  </div>
                </Nav.Link>
              </LinkContainer>

              {/* Cart */}
              <LinkContainer to='/cart'>
                <Nav.Link className='header-icon-link'>
                  <div className='icon-wrapper'>
                    <i className='fas fa-shopping-cart'></i>
                    {cartItems.length > 0 && (
                      <Badge bg='primary' className='icon-badge'>
                        {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                      </Badge>
                    )}
                    <span className='icon-text'>Cart</span>
                  </div>
                </Nav.Link>
              </LinkContainer>

              {/* User Account */}
              {userInfo ? (
                <NavDropdown
                  title={
                    <div className='user-info'>
                      <i className='fas fa-user-circle'></i>
                      <span style={{ color: 'black' }} className='user-name'>
                        {userInfo.name}
                      </span>
                    </div>
                  }
                  id='user-dropdown'
                  className='user-dropdown'
                >
                  <LinkContainer to='/profile'>
                    <NavDropdown.Item>
                      <i className='fas fa-user me-2'></i>My Profile
                    </NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>
                    <i className='fas fa-sign-out-alt me-2'></i>Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to='/login'>
                  <Nav.Link className='login-btn'>
                    <i className='fas fa-user'></i> Sign In
                  </Nav.Link>
                </LinkContainer>
              )}

              {/* Admin Menu */}
              {userInfo &&
                (userInfo.role === 'super_admin' ||
                  userInfo.role === 'operator' ||
                  userInfo.isAdmin) && (
                  <NavDropdown
                    title={
                      <span>
                        <i
                          className={
                            userInfo.role === 'super_admin'
                              ? 'fas fa-crown me-2'
                              : userInfo.role === 'operator'
                              ? 'fas fa-user-cog me-2'
                              : 'fas fa-user-shield me-2'
                          }
                        ></i>
                        {userInfo.role === 'super_admin'
                          ? 'Super Admin'
                          : userInfo.role === 'operator'
                          ? 'Operator'
                          : 'Admin'}
                      </span>
                    }
                    id='admin-dropdown'
                    className='admin-dropdown'
                  >
                    {/* Users management - available to all admin roles */}
                    <LinkContainer to='/admin/userlist'>
                      <NavDropdown.Item>
                        <i className='fas fa-users me-2'></i>Users
                      </NavDropdown.Item>
                    </LinkContainer>

                    {/* Products management - available to all admin roles */}
                    <LinkContainer to='/admin/productlist'>
                      <NavDropdown.Item>
                        <i className='fas fa-pills me-2'></i>Products
                      </NavDropdown.Item>
                    </LinkContainer>

                    {/* Orders management - available to all admin roles */}
                    <LinkContainer to='/admin/orderlist'>
                      <NavDropdown.Item>
                        <i className='fas fa-clipboard-list me-2'></i>Orders
                      </NavDropdown.Item>
                    </LinkContainer>

                    {/* Banner management - available to all admin roles */}
                    <LinkContainer to='/admin/bannerlist'>
                      <NavDropdown.Item>
                        <i className='fas fa-images me-2'></i>Banners
                      </NavDropdown.Item>
                    </LinkContainer>

                    {/* System Settings - only for Super Admin */}
                    {userInfo.role === 'super_admin' && (
                      <>
                        <NavDropdown.Divider />
                        <NavDropdown.Item disabled className='text-muted'>
                          <i className='fas fa-crown me-2'></i>Super Admin Only
                        </NavDropdown.Item>
                      </>
                    )}
                  </NavDropdown>
                )}
            </div>

            {/* Mobile Toggle */}
            <Navbar.Toggle aria-controls='mobile-navbar' className='ms-2' />
          </Container>
        </Navbar>

        {/* Mobile Menu */}
        <Navbar.Collapse id='mobile-navbar' className='mobile-menu'>
          <Container>
            <Nav className='mobile-nav'>
              <Nav.Link onClick={() => setShowCategories(true)}>
                <i className='fas fa-bars me-2'></i>Categories
              </Nav.Link>
              <LinkContainer to='/offers'>
                <Nav.Link>
                  <i className='fas fa-tags me-2'></i>Special Offers
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to='/brands'>
                <Nav.Link>
                  <i className='fas fa-award me-2'></i>Brands
                </Nav.Link>
              </LinkContainer>
            </Nav>
          </Container>
        </Navbar.Collapse>
      </header>

      {/* Categories Offcanvas */}
      <Offcanvas
        show={showCategories}
        onHide={() => setShowCategories(false)}
        placement='start'
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <i className='fas fa-list me-2'></i>All Categories
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='categories-body'>
          {categoriesLoading ? (
            <div className='text-center p-4'>
              <Spinner animation='border' size='sm' />
              <p className='mt-2 mb-0'>Loading categories...</p>
            </div>
          ) : categories && categories.length > 0 ? (
            categories.map((category) => (
              <LinkContainer
                key={category._id}
                to={`/category/${category.name
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}
              >
                <div
                  className='category-item'
                  onClick={() => setShowCategories(false)}
                >
                  <div
                    className='category-icon'
                    style={{ backgroundColor: category.color || '#2E86AB' }}
                  >
                    <i className={`fas ${category.icon || 'fa-pills'}`}></i>
                  </div>
                  <div className='category-info'>
                    <span
                      style={{ color: category.textColor || '#FFFFFF' }}
                      className='category-name'
                    >
                      {category.name}
                    </span>
                    <small className='category-count'>
                      {category.productCount || 0} products
                    </small>
                  </div>
                  <i className='fas fa-chevron-right category-arrow'></i>
                </div>
              </LinkContainer>
            ))
          ) : (
            <div className='text-center p-4'>
              <p className='mb-0 text-muted'>No categories available</p>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default ModernHeader;
