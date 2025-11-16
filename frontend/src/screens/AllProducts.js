import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  Modal,
  InputGroup,
  Pagination,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { listProducts } from '../actions/productActions';
import { listCategories } from '../actions/categoryActions';
import { addToCart } from '../actions/cartActions';
import { addToWishlist, removeFromWishlist } from '../actions/wishlistActions';
import Loader from '../components/Loader';
import Message from '../components/Message';
import '../styles/AllProducts.css';

const AllProducts = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // State for filtering and sorting
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [sortOrder, setSortOrder] = useState(
    searchParams.get('order') || 'asc'
  );
  const [filterCategory, setFilterCategory] = useState(
    searchParams.get('category') || ''
  );
  const [filterBrand, setFilterBrand] = useState(
    searchParams.get('brand') || ''
  );
  const [filterType, setFilterType] = useState(
    searchParams.get('type') || 'all'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || '',
  });

  // Modal for quantity selection
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Redux state
  const productList = useSelector((state) => state.productList);
  const { loading, error, products, pages, total } = productList;

  const categoryList = useSelector((state) => state.categoryList);
  const { categories: allCategories } = categoryList;

  const wishlist = useSelector((state) => state.wishlist);
  const { wishlistItems } = wishlist;

  // Use all categories from the category list, fallback to categories from products if not loaded
  const categories =
    allCategories && allCategories.length > 0
      ? allCategories.map((cat) => (typeof cat === 'object' ? cat.name : cat))
      : [
          ...new Set(
            products
              ?.map((p) =>
                typeof p.category === 'object' ? p.category.name : p.category
              )
              .filter(Boolean)
          ),
        ] || [];

  const brands =
    [...new Set(products?.map((p) => p.brand).filter(Boolean))] || [];

  useEffect(() => {
    // Fetch all categories when component mounts
    dispatch(listCategories());
  }, [dispatch]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (sortBy !== 'name') params.set('sort', sortBy);
    if (sortOrder !== 'asc') params.set('order', sortOrder);
    if (filterCategory) params.set('category', filterCategory);
    if (filterBrand) params.set('brand', filterBrand);
    if (filterType !== 'all') params.set('type', filterType);
    if (searchTerm) params.set('search', searchTerm);
    if (priceRange.min) params.set('minPrice', priceRange.min);
    if (priceRange.max) params.set('maxPrice', priceRange.max);

    setSearchParams(params);
  }, [
    sortBy,
    sortOrder,
    filterCategory,
    filterBrand,
    filterType,
    searchTerm,
    priceRange,
    setSearchParams,
  ]);

  useEffect(() => {
    // Fetch products based on filters
    let keyword = searchTerm;
    let category = filterCategory;
    let brand = filterBrand;

    dispatch(listProducts(keyword, currentPage, category, '', brand));
  }, [dispatch, searchTerm, currentPage, filterCategory, filterBrand]);

  // Filter and sort products
  const getFilteredAndSortedProducts = () => {
    if (!products) return [];

    let filteredProducts = [...products];

    // Filter by type (especially for you, flash sale, best sellers)
    if (filterType !== 'all') {
      switch (filterType) {
        case 'featured':
          filteredProducts = filteredProducts.filter((p) => p.isFeatured);
          break;
        case 'flash-sale':
          filteredProducts = filteredProducts.filter((p) => p.isFlashSale);
          break;
        case 'best-sellers':
          filteredProducts = filteredProducts.filter((p) => p.isBestSeller);
          break;
        case 'especially-for-you':
          filteredProducts = filteredProducts.filter(
            (p) => p.isRecommended || p.isFeatured
          );
          break;
        default:
          break;
      }
    }

    // Filter by price range
    if (priceRange.min) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price >= parseFloat(priceRange.min)
      );
    }
    if (priceRange.max) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price <= parseFloat(priceRange.max)
      );
    }

    // Sort products
    filteredProducts.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'reviews':
          aValue = a.numReviews || 0;
          bValue = b.numReviews || 0;
          break;
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredProducts;
  };

  const handleAddToCartClick = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowQuantityModal(true);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      dispatch(addToCart(selectedProduct._id, quantity));
      setShowQuantityModal(false);
      setSelectedProduct(null);
      setQuantity(1);
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      await dispatch(addToWishlist(product._id));
      // Show success message or toast here if needed
    } catch (error) {
      // Handle error - could show toast or alert
      console.error('Failed to add to wishlist:', error.message);
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.product === productId);
  };

  const handleCloseModal = () => {
    setShowQuantityModal(false);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const clearFilters = () => {
    setSortBy('name');
    setSortOrder('asc');
    setFilterCategory('');
    setFilterBrand('');
    setFilterType('all');
    setSearchTerm('');
    setPriceRange({ min: '', max: '' });
    setCurrentPage(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className='fas fa-star'></i>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<i key={i} className='fas fa-star-half-alt'></i>);
      } else {
        stars.push(<i key={i} className='far fa-star'></i>);
      }
    }
    return stars;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  return (
    <Container className='all-products-page py-4'>
      {/* Page Header */}
      <Row className='mb-4'>
        <Col>
          <div className='page-header'>
            <h1 className='page-title'>
              <i className='fas fa-capsules me-2'></i>
              All Products
            </h1>
            <p className='page-subtitle'>
              Discover our complete range of medicines and health products
            </p>
          </div>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card className='filters-card mb-4'>
        <Card.Body>
          <Row className='g-3'>
            {/* Search */}
            <Col lg={4} md={6}>
              <Form.Group>
                <Form.Label>Search Products</Form.Label>
                <InputGroup>
                  <Form.Control
                    type='text'
                    placeholder='Search by name, brand, or category...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant='outline-primary'>
                    <i className='fas fa-search'></i>
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>

            {/* Category Filter */}
            <Col lg={2} md={6}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value=''>All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Brand Filter */}
            <Col lg={2} md={6}>
              <Form.Group>
                <Form.Label>Brand</Form.Label>
                <Form.Select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                >
                  <option value=''>All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Product Type Filter */}
            <Col lg={2} md={6}>
              <Form.Group>
                <Form.Label>Product Type</Form.Label>
                <Form.Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value='all'>All Products</option>
                  <option value='especially-for-you'>Especially for You</option>
                  <option value='flash-sale'>Flash Sale</option>
                  <option value='best-sellers'>Best Sellers</option>
                  <option value='featured'>Featured</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Clear Filters */}
            <Col lg={2} md={6} className='d-flex align-items-end'>
              <Button
                variant='outline-secondary'
                className='w-100'
                onClick={clearFilters}
              >
                <i className='fas fa-times me-1'></i>
                Clear Filters
              </Button>
            </Col>
          </Row>

          {/* Price Range */}
          <Row className='mt-3'>
            <Col lg={3} md={6}>
              <Form.Group>
                <Form.Label>Price Range (৳)</Form.Label>
                <Row className='g-2'>
                  <Col>
                    <Form.Control
                      type='number'
                      placeholder='Min'
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: e.target.value })
                      }
                    />
                  </Col>
                  <Col xs='auto' className='d-flex align-items-center'>
                    <span>-</span>
                  </Col>
                  <Col>
                    <Form.Control
                      type='number'
                      placeholder='Max'
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: e.target.value })
                      }
                    />
                  </Col>
                </Row>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Results Header */}
      <Row className='align-items-center mb-3'>
        <Col md={6}>
          <div className='results-info'>
            <span className='text-black'>
              {loading ? (
                'Loading products...'
              ) : (
                <>
                  Showing {filteredProducts.length} of{' '}
                  {total || products?.length || 0} products
                  {filterType !== 'all' && (
                    <Badge bg='primary' className='ms-2'>
                      {filterType
                        .replace('-', ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  )}
                </>
              )}
            </span>
          </div>
        </Col>
        <Col md={6}>
          <div className='d-flex justify-content-end align-items-center'>
            <span className='me-2 text-muted'>Sort by:</span>
            <Form.Select
              size='sm'
              style={{ width: '150px' }}
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('_');
                setSortBy(sort);
                setSortOrder(order);
              }}
            >
              <option value='name_asc'>Name (A-Z)</option>
              <option value='name_desc'>Name (Z-A)</option>
              <option value='price_asc'>Price (Low-High)</option>
              <option value='price_desc'>Price (High-Low)</option>
              <option value='rating_desc'>Rating (High-Low)</option>
              <option value='reviews_desc'>Most Reviews</option>
              <option value='date_desc'>Newest First</option>
              <option value='date_asc'>Oldest First</option>
            </Form.Select>
          </div>
        </Col>
      </Row>

      {/* Products Grid */}
      {loading ? (
        <div className='text-center py-5'>
          <Loader />
        </div>
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : filteredProducts.length === 0 ? (
        <Card className='text-center py-5'>
          <Card.Body>
            <i className='fas fa-search fa-3x text-muted mb-3'></i>
            <h4>No products found</h4>
            <p className='text-muted'>
              Try adjusting your search criteria or clear filters to see more
              products.
            </p>
            <Button variant='primary' onClick={clearFilters}>
              Clear All Filters
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row>
            {filteredProducts.map((product) => (
              <Col key={product._id} lg={3} md={4} sm={6} className='mb-4'>
                <Card className='product-card h-100 shadow-sm'>
                  <div className='product-img-container position-relative'>
                    <LinkContainer to={`/product/${product._id}`}>
                      <Card.Img
                        src={
                          product.image?.startsWith('http')
                            ? product.image
                            : product.image?.startsWith('/uploads')
                            ? product.image
                            : product.image?.startsWith('/images')
                            ? product.image
                            : `/uploads/${product.image}`
                        }
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
                        <span
                          className='text-decoration-none text-dark'
                          style={{ cursor: 'pointer' }}
                        >
                          {product.name}
                        </span>
                      </LinkContainer>
                    </Card.Title>

                    <div className='product-rating mb-2'>
                      <div className='stars text-warning'>
                        {renderStars(product.rating || 0)}
                      </div>
                      <span className='rating-count text-black ms-1'>
                        ({product.numReviews || 0})
                      </span>
                    </div>

                    <div className='product-pricing mb-2'>
                      <span className='current-price fw-bold text-primary'>
                        ৳{product.price}
                      </span>
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
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
                          {product.countInStock > 0 ? (
                            <Button
                              variant='primary'
                              size='sm'
                              className='w-100'
                              onClick={() => handleAddToCartClick(product)}
                            >
                              <i className='fas fa-cart-plus me-1'></i>
                              Add to Cart
                            </Button>
                          ) : (
                            <Button
                              variant={
                                isInWishlist(product._id)
                                  ? 'danger'
                                  : 'outline-danger'
                              }
                              size='sm'
                              className='w-100'
                              onClick={() =>
                                isInWishlist(product._id)
                                  ? handleRemoveFromWishlist(product._id)
                                  : handleAddToWishlist(product)
                              }
                            >
                              <i
                                className={`fas ${
                                  isInWishlist(product._id)
                                    ? 'fa-heart-broken'
                                    : 'fa-heart'
                                } me-1`}
                              ></i>
                              {isInWishlist(product._id)
                                ? 'Remove from Wishlist'
                                : 'Add to Wishlist'}
                            </Button>
                          )}
                        </Col>
                      </Row>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination - if needed */}
          {pages > 1 && (
            <Row className='mt-4'>
              <Col className='d-flex justify-content-center'>
                <Pagination>
                  {Array.from({ length: pages }, (_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
              </Col>
            </Row>
          )}
        </>
      )}

      {/* Quantity Selection Modal */}
      <Modal show={showQuantityModal} onHide={handleCloseModal} centered>
        <Modal.Header
          closeButton
          style={{ backgroundColor: '#2c3e50', borderBottom: 'none' }}
        >
          <Modal.Title style={{ color: 'white', fontSize: '1.2rem' }}>
            <i className='fas fa-cart-plus me-2'></i>
            Add to Cart
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ backgroundColor: '#34495e' }}>
          {selectedProduct && (
            <div className='text-center'>
              <img
                src={
                  selectedProduct.image?.startsWith('http')
                    ? selectedProduct.image
                    : selectedProduct.image?.startsWith('/uploads')
                    ? selectedProduct.image
                    : selectedProduct.image?.startsWith('/images')
                    ? selectedProduct.image
                    : `/uploads/${selectedProduct.image}`
                }
                alt={selectedProduct.name}
                className='img-fluid mb-3'
                style={{ maxHeight: '150px', borderRadius: '8px' }}
              />
              <h5 style={{ color: 'white', marginBottom: '1rem' }}>
                {selectedProduct.name}
              </h5>
              <p style={{ color: '#bdc3c7', marginBottom: '1.5rem' }}>
                Price: ৳{selectedProduct.price}
              </p>

              <Form.Group className='mb-3'>
                <Form.Label style={{ color: 'white', fontWeight: '600' }}>
                  Select Quantity
                </Form.Label>
                <Form.Control
                  as='select'
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  style={{
                    backgroundColor: '#2c3e50 !important',
                    color: 'white !important',
                    border: '1px solid #34495e !important',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  {[...Array(selectedProduct.countInStock).keys()].map((x) => (
                    <option
                      key={x + 1}
                      value={x + 1}
                      style={{
                        backgroundColor: '#2c3e50',
                        color: 'white',
                      }}
                    >
                      {x + 1}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <p style={{ color: 'white', marginBottom: '1rem' }}>
                <strong>
                  Total: ৳{(selectedProduct.price * quantity).toFixed(2)}
                </strong>
              </p>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer style={{ backgroundColor: '#2c3e50', borderTop: 'none' }}>
          <Button
            variant='outline-light'
            onClick={handleCloseModal}
            style={{ borderColor: '#7f8c8d', color: '#bdc3c7' }}
          >
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={handleAddToCart}
            style={{ backgroundColor: '#e74c3c', borderColor: '#e74c3c' }}
          >
            <i className='fas fa-cart-plus me-2'></i>
            Add to Cart
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AllProducts;
