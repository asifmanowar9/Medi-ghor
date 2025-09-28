import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Tab,
  Nav,
  Spinner,
  Alert,
  Modal,
  Form,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { listProducts } from '../actions/productActions';
import { addToCart } from '../actions/cartActions';
import '../styles/ProductSections.css';

const ProductSections = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('especially-for-you');
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  useEffect(() => {
    dispatch(listProducts());
  }, [dispatch]);

  // Filter products based on different criteria
  const getFeaturedProducts = () => {
    return products?.filter((product) => product.isFeatured) || [];
  };

  const getFlashSaleProducts = () => {
    return products?.filter((product) => product.isFlashSale) || [];
  };

  const getBestSellerProducts = () => {
    return products?.filter((product) => product.isBestSeller) || [];
  };

  const getEspeciallyForYouProducts = () => {
    // For "especially for you", we can show top-rated products
    return (
      products?.filter((product) => product.rating >= 4.0)?.slice(0, 8) || []
    );
  };

  const getRandomBoosterProducts = () => {
    // For random boosters, show products with discounts
    return (
      products?.filter((product) => product.discount > 0)?.slice(0, 8) || []
    );
  };

  const sections = {
    'especially-for-you': {
      title: 'Especially for You',
      icon: 'fas fa-user-heart',
      description: 'Personalized recommendations based on your health needs',
    },
    'flash-sale': {
      title: 'Flash Sale',
      icon: 'fas fa-bolt',
      description: 'Limited time offers - Hurry up!',
    },
    'random-boosters': {
      title: 'Random Boosters',
      icon: 'fas fa-gift',
      description: 'Surprise deals and random offers',
    },
    'best-sellers': {
      title: 'Best Sellers',
      icon: 'fas fa-star',
      description: 'Most popular products this month',
    },
  };

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

  // Show quantity modal when add to cart is clicked
  const handleAddToCartClick = (product) => {
    setSelectedProduct(product);
    setQuantity(1); // Reset to 1
    setShowQuantityModal(true);
  };

  // Add to cart handler with selected quantity
  const addToCartHandler = () => {
    if (selectedProduct) {
      dispatch(addToCart(selectedProduct._id, quantity));
      setShowQuantityModal(false);
      navigate(`/cart/${selectedProduct._id}?qty=${quantity}`);
    }
  };

  // Close modal handler
  const handleCloseModal = () => {
    setShowQuantityModal(false);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const ProductCard = ({ product }) => (
    <Card className='product-card h-100'>
      {product.discount && (
        <Badge bg='danger' className='discount-badge'>
          -{product.discount}%
        </Badge>
      )}

      <div className='product-image-container'>
        <Card.Img
          variant='top'
          src={product.image}
          alt={product.name}
          className='product-image'
        />
        {!product.countInStock && (
          <div className='out-of-stock-overlay'>
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      <Card.Body className='d-flex flex-column'>
        <Card.Title className='product-title'>{product.name}</Card.Title>

        <div className='product-rating mb-2'>
          <div className='stars'>{renderStars(product.rating)}</div>
          <span className='rating-count'>({product.numReviews})</span>
        </div>

        <div className='product-pricing mb-2'>
          <span className='current-price'>৳{product.price}</span>
          {product.originalPrice && (
            <span className='original-price'>৳{product.originalPrice}</span>
          )}
        </div>

        <div className='product-category mb-3'>
          <i className='fas fa-tag me-1'></i>
          {typeof product.category === 'object'
            ? product.category.name
            : product.category}
        </div>

        <div className='product-actions mt-auto'>
          <Row className='g-2'>
            <Col>
              <LinkContainer to={`/product/${product._id}`}>
                <Button variant='outline-primary' size='sm' className='w-100'>
                  <i className='fas fa-eye me-1'></i>
                  View
                </Button>
              </LinkContainer>
            </Col>
            <Col>
              <Button
                variant='primary'
                size='sm'
                className='w-100'
                disabled={!product.countInStock}
                onClick={() => handleAddToCartClick(product)}
              >
                <i className='fas fa-cart-plus me-1'></i>
                Add to Cart
              </Button>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );

  const getCurrentProducts = () => {
    switch (activeSection) {
      case 'flash-sale':
        return getFlashSaleProducts();
      case 'best-sellers':
        return getBestSellerProducts();
      case 'random-boosters':
        return getRandomBoosterProducts();
      default:
        return getEspeciallyForYouProducts();
    }
  };

  return (
    <section className='product-sections py-5'>
      <Container>
        {/* Section Navigation Tabs */}
        <Tab.Container
          activeKey={activeSection}
          onSelect={(k) => setActiveSection(k)}
        >
          <Row className='mb-4'>
            <Col>
              <Nav
                variant='pills'
                className='section-tabs justify-content-center'
              >
                {Object.entries(sections).map(([key, section]) => (
                  <Nav.Item key={key}>
                    <Nav.Link eventKey={key} className='section-tab'>
                      <i className={`${section.icon} me-2`}></i>
                      {section.title}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </Col>
          </Row>

          {/* Section Header */}
          <Row className='mb-4'>
            <Col>
              <div className='section-header text-center'>
                <h2 className='section-title'>
                  <i className={`${sections[activeSection].icon} me-3`}></i>
                  {sections[activeSection].title}
                </h2>
                <p className='section-description'>
                  {sections[activeSection].description}
                </p>
              </div>
            </Col>
          </Row>

          {/* Products Content */}
          {loading ? (
            <div className='text-center py-5'>
              <Spinner animation='border' variant='primary' />
              <p className='mt-3'>Loading products...</p>
            </div>
          ) : error ? (
            <Alert variant='danger' className='text-center'>
              Error loading products: {error}
            </Alert>
          ) : (
            <>
              <Row className='products-grid'>
                {getCurrentProducts()
                  .slice(0, 6)
                  .map((product) => (
                    <Col
                      key={product._id}
                      xl={2}
                      lg={3}
                      md={4}
                      sm={6}
                      xs={6}
                      className='mb-4'
                    >
                      <ProductCard product={product} />
                    </Col>
                  ))}
              </Row>

              {getCurrentProducts().length === 0 && (
                <Row>
                  <Col className='text-center py-5'>
                    <i className='fas fa-box-open fa-3x text-muted mb-3'></i>
                    <h4 className='text-muted'>No products found</h4>
                    <p className='text-muted'>
                      No products available in this section at the moment.
                    </p>
                  </Col>
                </Row>
              )}

              {/* View All Button */}
              {getCurrentProducts().length > 6 && (
                <Row className='mt-4'>
                  <Col className='text-center'>
                    <LinkContainer
                      to={`/products?type=${activeSection}&sort=name&order=asc`}
                    >
                      <Button
                        variant='outline-primary'
                        size='lg'
                        className='view-all-btn'
                      >
                        <i className='fas fa-th-large me-2'></i>
                        View All Products
                        <i className='fas fa-arrow-right ms-2'></i>
                      </Button>
                    </LinkContainer>
                  </Col>
                </Row>
              )}
            </>
          )}
        </Tab.Container>

        {/* Quantity Selection Modal */}
        <Modal show={showQuantityModal} onHide={handleCloseModal} centered>
          <Modal.Header
            closeButton
            style={{
              backgroundColor: '#343a40',
              borderBottom: '1px solid #495057',
            }}
          >
            <Modal.Title style={{ color: 'white' }}>
              Select Quantity
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: '#343a40', color: 'white' }}>
            {selectedProduct && (
              <>
                <div className='d-flex align-items-center mb-3'>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                    }}
                    className='me-3 rounded'
                  />
                  <div>
                    <h6 className='mb-1' style={{ color: 'white' }}>
                      {selectedProduct.name}
                    </h6>
                    <p className='mb-0' style={{ color: '#adb5bd' }}>
                      ৳{selectedProduct.price}
                    </p>
                  </div>
                </div>

                <Form.Group className='mb-3'>
                  <Form.Label style={{ color: 'white' }}>Quantity:</Form.Label>
                  <Form.Control
                    as='select'
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className='w-auto'
                  >
                    {[
                      ...Array(
                        Math.min(selectedProduct.countInStock, 10)
                      ).keys(),
                    ].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <div className='d-flex justify-content-between align-items-center'>
                  <span style={{ color: 'white' }}>
                    <strong>
                      Total: ৳{(selectedProduct.price * quantity).toFixed(2)}
                    </strong>
                  </span>
                  <span style={{ color: '#adb5bd' }}>
                    {selectedProduct.countInStock} available
                  </span>
                </div>
              </>
            )}
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
      </Container>
    </section>
  );
};

export default ProductSections;
