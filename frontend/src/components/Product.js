import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button, Badge, Row, Col, Modal, Form } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { addToCart } from '../actions/cartActions';
import { addToWishlist, removeFromWishlist } from '../actions/wishlistActions';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';
import './Product.css';

const Product = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Modal for quantity selection
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Wishlist state
  const wishlist = useSelector((state) => state.wishlist);
  const { wishlistItems } = wishlist;

  // Fix the image path handling (keeping existing logic):
  const imagePath = resolveAssetUrl(product.image);

  // Render stars function
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className='fas fa-star'></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key='half' className='fas fa-star-half-alt'></i>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className='far fa-star'></i>);
    }

    return stars;
  };

  // Handle add to cart click
  const handleAddToCartClick = () => {
    setQuantity(1);
    setShowQuantityModal(true);
  };

  // Add to cart handler with selected quantity
  const addToCartHandler = () => {
    dispatch(addToCart(product._id, quantity));
    setShowQuantityModal(false);
    navigate(`/cart/${product._id}?qty=${quantity}`);
  };

  // Wishlist handlers
  const handleAddToWishlist = async () => {
    try {
      await dispatch(addToWishlist(product._id));
    } catch (error) {
      console.error('Failed to add to wishlist:', error.message);
    }
  };

  const handleRemoveFromWishlist = () => {
    dispatch(removeFromWishlist(product._id));
  };

  const isInWishlist = () => {
    return wishlistItems.some((item) => item.product === product._id);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setShowQuantityModal(false);
    setQuantity(1);
  };

  return (
    <>
      <Card className='product-card h-100 shadow-sm'>
        <div className='product-img-container position-relative'>
          <LinkContainer to={`/product/${product._id}`}>
            <Card.Img
              src={imagePath}
              variant='top'
              className='product-img'
              style={{
                height: '200px',
                objectFit: 'cover',
                cursor: 'pointer',
              }}
            />
          </LinkContainer>

          {/* Product Badges */}
          <div className='product-badges'>
            {product.isFlashSale && (
              <Badge bg='danger' className='product-badge'>
                <i className='fas fa-fire me-1'></i>
                Flash Sale
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge bg='warning' className='product-badge'>
                <i className='fas fa-crown me-1'></i>
                Best Seller
              </Badge>
            )}
            {product.isFeatured && (
              <Badge bg='success' className='product-badge'>
                <i className='fas fa-star me-1'></i>
                Featured
              </Badge>
            )}
            {!product.countInStock && (
              <Badge bg='secondary' className='product-badge'>
                Out of Stock
              </Badge>
            )}
          </div>
        </div>

        <Card.Body className='d-flex flex-column'>
          <Card.Title className='product-title'>
            <LinkContainer to={`/product/${product._id}`}>
              <a href='#' className='text-decoration-none text-dark'>
                {product.name}
              </a>
            </LinkContainer>
          </Card.Title>

          <div className='product-rating mb-2'>
            <div className='stars text-warning'>
              {renderStars(product.rating || 0)}
            </div>
            <span className='rating-count text- black ms-1'>
              ({product.numReviews || 0})
            </span>
          </div>

          <div className='product-pricing mb-2'>
            <span className='current-price fw-bold text-primary'>
              ৳{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className='original-price text-muted text-decoration-line-through ms-2'>
                ৳{product.originalPrice}
              </span>
            )}
          </div>

          <div className='product-info mb-3'>
            <small className='text-black'>
              <i className='fas fa-tag me-1'></i>
              {typeof product.category === 'object'
                ? product.category.name
                : product.category}
            </small>
            {product.brand && (
              <small className='text-black d-block'>
                <i className='fas fa-trademark me-1'></i>
                {product.brand}
              </small>
            )}
          </div>

          <div className='product-actions mt-auto'>
            <Row className='g-2'>
              <Col>
                <LinkContainer to={`/product/${product._id}`}>
                  <Button variant='outline-primary' size='sm' className='w-100'>
                    <i className='fas fa-eye me-1'></i>
                    View Details
                  </Button>
                </LinkContainer>
              </Col>
              <Col>
                {product.countInStock > 0 ? (
                  <Button
                    variant='primary'
                    size='sm'
                    className='w-100'
                    onClick={handleAddToCartClick}
                  >
                    <i className='fas fa-cart-plus me-1'></i>
                    Add to Cart
                  </Button>
                ) : (
                  <Button
                    variant={isInWishlist() ? 'danger' : 'outline-danger'}
                    size='sm'
                    className='w-100'
                    onClick={
                      isInWishlist()
                        ? handleRemoveFromWishlist
                        : handleAddToWishlist
                    }
                  >
                    <i
                      className={`fas ${
                        isInWishlist() ? 'fa-heart-broken' : 'fa-heart'
                      } me-1`}
                    ></i>
                    {isInWishlist()
                      ? 'Remove from Wishlist'
                      : 'Add to Wishlist'}
                  </Button>
                )}
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>

      {/* Quantity Selection Modal */}
      <Modal show={showQuantityModal} onHide={handleCloseModal} centered>
        <Modal.Header
          closeButton
          style={{
            backgroundColor: '#343a40',
            borderBottom: '1px solid #495057',
          }}
        >
          <Modal.Title style={{ color: 'white' }}>Select Quantity</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#343a40', color: 'white' }}>
          <>
            <div className='d-flex align-items-center mb-3'>
              <img
                src={imagePath}
                alt={product.name}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                }}
                className='me-3 rounded'
              />
              <div>
                <h6 className='mb-1' style={{ color: 'white' }}>
                  {product.name}
                </h6>
                <p className='mb-0' style={{ color: '#adb5bd' }}>
                  ৳{product.price}
                </p>
              </div>
            </div>

            <Form.Group className='mb-3'>
              <Form.Label className='quantity-label'>Quantity:</Form.Label>
              <Form.Control
                as='select'
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className='w-auto'
                style={{
                  backgroundColor: '#495057',
                  color: '#000000',
                  border: '1px solid #6c757d',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  fontWeight: '500',
                }}
              >
                {[...Array(product.countInStock || 1).keys()].map((x) => (
                  <option
                    key={x + 1}
                    value={x + 1}
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#000000',
                    }}
                  >
                    {x + 1}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <div className='d-flex justify-content-between align-items-center'>
              <span style={{ color: 'white' }}>
                <strong>Total: ৳{(product.price * quantity).toFixed(2)}</strong>
              </span>
              <span style={{ color: '#adb5bd' }}>
                {product.countInStock || 0} available
              </span>
            </div>
          </>
        </Modal.Body>
        <Modal.Footer
          style={{
            backgroundColor: '#343a40',
            borderTop: '1px solid #495057',
          }}
        >
          <Button variant='secondary' onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant='primary' onClick={addToCartHandler}>
            <i className='fas fa-cart-plus me-2'></i>
            Add to Cart
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Product;
