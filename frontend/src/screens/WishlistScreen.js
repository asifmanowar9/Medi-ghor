import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Image,
  Badge,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../actions/wishlistActions';
import { addToCart } from '../actions/cartActions';
import { useCartAuth } from '../hooks/useCartAuth';
import './WishlistScreen.css';

const WishlistScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useCartAuth();

  const wishlist = useSelector((state) => state.wishlist);
  const { wishlistItems, loading, error } = wishlist;

  // Fetch wishlist from backend on component mount
  useEffect(() => {
    if (userInfo) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, userInfo]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleClearWishlist = () => {
    if (
      window.confirm('Are you sure you want to clear your entire wishlist?')
    ) {
      dispatch(clearWishlist());
    }
  };

  const handleAddToCart = (product) => {
    if (product.countInStock > 0) {
      dispatch(addToCart(product.product, 1));
      // Remove from wishlist since it's now in stock and added to cart
      dispatch(removeFromWishlist(product.product));
      navigate('/cart');
    }
  };

  const handleMoveToCart = (product) => {
    if (product.countInStock > 0) {
      handleAddToCart(product);
    }
  };

  // Check if products are back in stock
  const checkStockStatus = (item) => {
    return item.countInStock > 0;
  };

  if (loading) {
    return (
      <Container className='text-center py-5'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </Spinner>
        <p className='mt-2'>Loading your wishlist...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className='py-5'>
        <Alert variant='danger'>
          <Alert.Heading>Error Loading Wishlist</Alert.Heading>
          <p>{error}</p>
          <Button
            variant='outline-danger'
            onClick={() => dispatch(fetchWishlist())}
          >
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className='wishlist-screen-container'>
      <Container>
        <div className='wishlist-header'>
          <Row className='align-items-center mb-4'>
            <Col>
              <h1 className='page-title'>
                <i className='fas fa-heart me-3'></i>
                My Wishlist
              </h1>
              <p className='page-subtitle'>
                {wishlistItems.length === 0
                  ? 'Your wishlist is empty'
                  : `${wishlistItems.length} item${
                      wishlistItems.length !== 1 ? 's' : ''
                    } in your wishlist`}
              </p>
            </Col>
            {wishlistItems.length > 0 && (
              <Col xs='auto'>
                <Button variant='outline-danger' onClick={handleClearWishlist}>
                  <i className='fas fa-trash me-2'></i>
                  Clear Wishlist
                </Button>
              </Col>
            )}
          </Row>
        </div>

        {wishlistItems.length === 0 ? (
          <div className='empty-wishlist'>
            <Card className='text-center py-5'>
              <Card.Body>
                <i
                  className='fas fa-heart text-muted mb-4'
                  style={{ fontSize: '4rem' }}
                ></i>
                <h3 className='text-muted mb-3'>Your wishlist is empty</h3>
                <p className='text-muted mb-4'>
                  Save out-of-stock items to your wishlist and get notified when
                  they're back in stock!
                </p>
                <LinkContainer to='/products'>
                  <Button variant='primary' size='lg'>
                    <i className='fas fa-shopping-bag me-2'></i>
                    Continue Shopping
                  </Button>
                </LinkContainer>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <div className='wishlist-items'>
            <Row className='g-4'>
              {wishlistItems.map((item) => (
                <Col lg={6} xl={4} key={item.product}>
                  <Card className='wishlist-item-card h-100'>
                    <div className='card-image-container'>
                      <Image
                        src={
                          item.image?.startsWith('http')
                            ? item.image
                            : item.image?.startsWith('/uploads')
                            ? item.image
                            : item.image?.startsWith('/images')
                            ? item.image
                            : `/uploads/${item.image}`
                        }
                        alt={item.name}
                        className='wishlist-item-image'
                      />
                      <div className='remove-btn-container'>
                        <Button
                          variant='danger'
                          size='sm'
                          className='remove-btn'
                          onClick={() => handleRemoveFromWishlist(item.product)}
                        >
                          <i className='fas fa-times'></i>
                        </Button>
                      </div>
                    </div>

                    <Card.Body className='d-flex flex-column'>
                      <div className='product-badges mb-2'>
                        {checkStockStatus(item) ? (
                          <Badge bg='success' className='stock-badge'>
                            <i className='fas fa-check-circle me-1'></i>
                            In Stock ({item.countInStock} available)
                          </Badge>
                        ) : (
                          <Badge bg='secondary' className='stock-badge'>
                            <i className='fas fa-times-circle me-1'></i>
                            Out of Stock
                          </Badge>
                        )}
                        {item.category && (
                          <Badge bg='info' className='category-badge'>
                            {typeof item.category === 'object'
                              ? item.category.name
                              : item.category}
                          </Badge>
                        )}
                      </div>

                      <Card.Title className='product-title'>
                        <LinkContainer to={`/product/${item.product}`}>
                          <a
                            href='#'
                            className='text-decoration-none text-dark'
                          >
                            {item.name}
                          </a>
                        </LinkContainer>
                      </Card.Title>

                      <div className='product-price mb-3'>
                        <span className='price-text'>৳{item.price}</span>
                      </div>

                      {item.brand && (
                        <small className='text-black mb-3 d-block'>
                          <i className='fas fa-trademark me-1'></i>
                          {typeof item.brand === 'object'
                            ? item.brand.name
                            : item.brand}
                        </small>
                      )}

                      <div className='stock-notice mb-3'>
                        {checkStockStatus(item) ? (
                          <Alert variant='success' className='mb-0 py-2'>
                            <i className='fas fa-check me-2'></i>
                            <small>
                              Great news! This item is back in stock
                            </small>
                          </Alert>
                        ) : (
                          <Alert variant='warning' className='mb-0 py-2'>
                            <i className='fas fa-exclamation-triangle me-2'></i>
                            <small>
                              We'll notify you when this item is back in stock
                            </small>
                          </Alert>
                        )}
                      </div>

                      <div className='product-actions mt-auto'>
                        <Row className='g-2'>
                          {checkStockStatus(item) ? (
                            <>
                              <Col>
                                <Button
                                  variant='success'
                                  size='sm'
                                  className='w-100'
                                  onClick={() => handleAddToCart(item)}
                                >
                                  <i className='fas fa-shopping-cart me-1'></i>
                                  Add to Cart
                                </Button>
                              </Col>
                              <Col>
                                <Button
                                  variant='outline-danger'
                                  size='sm'
                                  className='w-100'
                                  onClick={() =>
                                    handleRemoveFromWishlist(item.product)
                                  }
                                >
                                  <i className='fas fa-heart-broken me-1'></i>
                                  Remove
                                </Button>
                              </Col>
                            </>
                          ) : (
                            <>
                              <Col>
                                <LinkContainer to={`/product/${item.product}`}>
                                  <Button
                                    variant='outline-primary'
                                    size='sm'
                                    className='w-100'
                                  >
                                    <i className='fas fa-eye me-1'></i>
                                    View Details
                                  </Button>
                                </LinkContainer>
                              </Col>
                              <Col>
                                <Button
                                  variant='outline-danger'
                                  size='sm'
                                  className='w-100'
                                  onClick={() =>
                                    handleRemoveFromWishlist(item.product)
                                  }
                                >
                                  <i className='fas fa-heart-broken me-1'></i>
                                  Remove
                                </Button>
                              </Col>
                            </>
                          )}
                        </Row>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Wishlist Info */}
        <div className='wishlist-info mt-5'>
          <Card className='info-card'>
            <Card.Body>
              <Row className='g-4'>
                <Col md={4}>
                  <div className='info-item text-center'>
                    <i className='fas fa-bell text-primary mb-2'></i>
                    <h5>Get Notified</h5>
                    <p className='text-muted mb-0'>
                      We'll email you when your wishlist items are back in stock
                    </p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className='info-item text-center'>
                    <i className='fas fa-heart text-danger mb-2'></i>
                    <h5>Save Favorites</h5>
                    <p className='text-muted mb-0'>
                      Keep track of products you want to buy later
                    </p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className='info-item text-center'>
                    <i className='fas fa-share-alt text-success mb-2'></i>
                    <h5>Share List</h5>
                    <p className='text-muted mb-0'>
                      Share your wishlist with friends and family
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default WishlistScreen;
