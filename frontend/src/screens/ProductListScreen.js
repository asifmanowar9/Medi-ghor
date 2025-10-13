import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import {
  Button,
  Row,
  Col,
  Card,
  Badge,
  InputGroup,
  Form,
  Modal,
  Container,
} from 'react-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import { listProducts, deleteProduct } from '../actions/productActions';
import { listCategories } from '../actions/categoryActions';
import './ProductListScreen.css';

// Low stock threshold constant
const LOW_STOCK_THRESHOLD = 10;

const ProductListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { pageNumber } = useParams();

  // Convert pageNumber to a number and default to 1 if not provided
  const page = pageNumber ? Number(pageNumber) : 1;

  // Local state for UI
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState(null);

  // Filtering and sorting state
  const [filterCategory, setFilterCategory] = React.useState('');
  const [filterBrand, setFilterBrand] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');
  const [filterPrescription, setFilterPrescription] = React.useState('');
  const [sortBy, setSortBy] = React.useState('name');
  const [sortOrder, setSortOrder] = React.useState('asc');
  const [showFilters, setShowFilters] = React.useState(false);

  const productList = useSelector((state) => state.productList);
  const { loading, error, products, pages } = productList;

  const productDelete = useSelector((state) => state.productDelete);
  const {
    loading: loadingDelete,
    error: errorDelete,
    success: successDelete,
  } = productDelete;

  const productCreate = useSelector((state) => state.productCreate);
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
    product: createdProduct,
  } = productCreate;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const categoryList = useSelector((state) => state.categoryList);
  const { categories } = categoryList;

  useEffect(() => {
    // Check authentication and admin status
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }

    // Load categories and products
    dispatch(listCategories());
    dispatch(listProducts('', page));
  }, [
    dispatch,
    navigate,
    userInfo,
    successDelete,
    successCreate,
    createdProduct,
    page,
  ]);

  const deleteHandler = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      dispatch(deleteProduct(productToDelete._id))
        .then(() => {
          dispatch(listProducts('', page));
          setShowDeleteModal(false);
          setProductToDelete(null);
        })
        .catch((error) => {
          console.error('Delete failed:', error);
        });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      dispatch(listProducts(searchTerm, 1));
    } else {
      dispatch(listProducts('', 1));
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    dispatch(listProducts('', 1));
  };

  // Get unique categories and brands for filters
  const allCategories = categories || [];
  const uniqueBrands = [
    ...new Set(products?.map((p) => p.manufacturer || p.brand).filter(Boolean)),
  ];

  // Filter and sort products
  const getFilteredAndSortedProducts = () => {
    if (!products) return [];

    let filtered = [...products];

    // Apply filters
    if (filterCategory) {
      filtered = filtered.filter(
        (p) => (p.category?.name || p.category) === filterCategory
      );
    }

    if (filterBrand) {
      filtered = filtered.filter(
        (p) => (p.manufacturer || p.brand) === filterBrand
      );
    }

    if (filterStatus) {
      if (filterStatus === 'active') {
        filtered = filtered.filter((p) => p.isActive);
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter((p) => !p.isActive);
      } else if (filterStatus === 'featured') {
        filtered = filtered.filter((p) => p.isFeatured);
      } else if (filterStatus === 'outOfStock') {
        filtered = filtered.filter((p) => p.countInStock === 0);
      } else if (filterStatus === 'lowStock') {
        filtered = filtered.filter(
          (p) => p.countInStock > 0 && p.countInStock <= LOW_STOCK_THRESHOLD
        );
      }
    }

    if (filterPrescription) {
      if (filterPrescription === 'required') {
        filtered = filtered.filter((p) => p.prescriptionRequired);
      } else if (filterPrescription === 'notRequired') {
        filtered = filtered.filter((p) => !p.prescriptionRequired);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'price':
          aVal = parseFloat(a.price);
          bVal = parseFloat(b.price);
          break;
        case 'stock':
          aVal = a.countInStock;
          bVal = b.countInStock;
          break;
        case 'category':
          aVal = (a.category?.name || a.category || '').toLowerCase();
          bVal = (b.category?.name || b.category || '').toLowerCase();
          break;
        case 'brand':
          aVal = (a.manufacturer || a.brand || '').toLowerCase();
          bVal = (b.manufacturer || b.brand || '').toLowerCase();
          break;
        default:
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  };

  const clearAllFilters = () => {
    setFilterCategory('');
    setFilterBrand('');
    setFilterStatus('');
    setFilterPrescription('');
    setSortBy('name');
    setSortOrder('asc');
  };

  const createProductHandler = () => {
    navigate('/admin/product/new/edit');
  };

  return (
    <Container fluid className='py-4'>
      {/* Header Section */}
      <div className='mb-4'>
        <Row className='align-items-center mb-3'>
          <Col>
            <h2 className='text-black mb-0'>Products Management</h2>
            <p className='text-black mb-0'>
              {loading
                ? 'Loading...'
                : (() => {
                    const filteredProducts = getFilteredAndSortedProducts();
                    const totalProducts = products?.length || 0;
                    const filteredCount = filteredProducts.length;
                    return filteredCount < totalProducts
                      ? `${filteredCount} of ${totalProducts} products shown`
                      : `${totalProducts} products found`;
                  })()}{' '}
              • Manage your medical products inventory
            </p>
          </Col>
          <Col xs='auto'>
            <Button
              className='btn-modern'
              onClick={createProductHandler}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontWeight: '600',
              }}
            >
              <i className='fas fa-plus me-2'></i>
              Add New Product
            </Button>
          </Col>
        </Row>

        {/* Low Stock Warning Section */}
        {(() => {
          const lowStockProducts = products
            ? products.filter(
                (p) =>
                  p.countInStock > 0 && p.countInStock <= LOW_STOCK_THRESHOLD
              )
            : [];
          const outOfStockProducts = products
            ? products.filter((p) => p.countInStock === 0)
            : [];

          if (lowStockProducts.length === 0 && outOfStockProducts.length === 0)
            return null;

          return (
            <Card
              className='border-0 shadow-lg mb-4 stock-alert-section'
              style={{
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                border: '2px solid #e74c3c',
              }}
            >
              <Card.Body>
                <div className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    <i
                      className='fas fa-exclamation-triangle text-white me-3'
                      style={{ fontSize: '1.5rem' }}
                    ></i>
                    <div>
                      <h5 className='text-white mb-1'>
                        <strong>🚨 Stock Alert!</strong>
                      </h5>
                      <p className='text-white mb-0' style={{ opacity: 0.9 }}>
                        {outOfStockProducts.length > 0 && (
                          <span className='me-3'>
                            <i className='fas fa-times-circle me-1'></i>
                            {outOfStockProducts.length} out of stock
                          </span>
                        )}
                        {lowStockProducts.length > 0 && (
                          <span>
                            <i className='fas fa-exclamation-circle me-1'></i>
                            {lowStockProducts.length} low stock (≤
                            {LOW_STOCK_THRESHOLD} units)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className='d-flex gap-2'>
                    {outOfStockProducts.length > 0 && (
                      <Button
                        variant='light'
                        size='sm'
                        onClick={() => setFilterStatus('outOfStock')}
                        style={{
                          fontWeight: '600',
                          background: 'white',
                          color: '#e74c3c',
                          border: '2px solid white',
                        }}
                      >
                        <i className='fas fa-eye me-1'></i>
                        View Out of Stock ({outOfStockProducts.length})
                      </Button>
                    )}
                    {lowStockProducts.length > 0 && (
                      <Button
                        variant='outline-light'
                        size='sm'
                        onClick={() => setFilterStatus('lowStock')}
                        style={{
                          fontWeight: '600',
                          borderColor: 'white',
                          color: 'white',
                        }}
                      >
                        <i className='fas fa-exclamation-triangle me-1'></i>
                        View Low Stock ({lowStockProducts.length})
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          );
        })()}

        {/* Search Bar */}
        <Card
          className='border-0 shadow-lg search-card mb-3'
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Card.Body className='py-3'>
            <Form onSubmit={handleSearch}>
              <InputGroup size='lg'>
                <Form.Control
                  type='text'
                  placeholder='🔍 Search medicines, brands, or categories...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    color: 'black',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                  }}
                  className='custom-input'
                />
                <Button
                  type='submit'
                  style={{
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                  }}
                >
                  <i className='fas fa-search'></i>
                </Button>
                {searchTerm && (
                  <Button
                    variant='outline-light'
                    onClick={clearSearch}
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <i className='fas fa-times'></i>
                  </Button>
                )}
              </InputGroup>
            </Form>
          </Card.Body>
        </Card>

        {/* Filters and Sorting Section */}
        <Card
          className='border-0 shadow-lg mb-3'
          style={{
            background: 'linear-gradient(135deg, #2c3e50, #34495e)',
            backdropFilter: 'blur(15px)',
            border: '2px solid #3498db',
          }}
        >
          <Card.Body>
            {/* Filter Toggle Button */}
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <div className='d-flex align-items-center gap-3'>
                <Button
                  size='sm'
                  onClick={() => setShowFilters(!showFilters)}
                  style={{
                    background: showFilters
                      ? 'linear-gradient(135deg, #e74c3c, #c0392b)'
                      : 'linear-gradient(135deg, #3498db, #2980b9)',
                    border: 'none',
                    color: '#000000',
                    fontWeight: '600',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    boxShadow: showFilters
                      ? '0 2px 8px rgba(231, 76, 60, 0.4)'
                      : '0 2px 8px rgba(52, 152, 219, 0.4)',
                  }}
                >
                  <i className={`fas fa-filter me-2`}></i>
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>

                {/* Active filters count */}
                {(filterCategory ||
                  filterBrand ||
                  filterStatus ||
                  filterPrescription) && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                      color: '#000000',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '15px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      border: '2px solid #e67e22',
                      boxShadow: '0 2px 8px rgba(243, 156, 18, 0.3)',
                    }}
                  >
                    {
                      [
                        filterCategory,
                        filterBrand,
                        filterStatus,
                        filterPrescription,
                      ].filter(Boolean).length
                    }{' '}
                    active filters
                  </div>
                )}
              </div>

              {/* Sort Controls */}
              <div className='d-flex align-items-center gap-2'>
                <span
                  style={{
                    color: '#000000',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                  }}
                >
                  Sort by:
                </span>
                <Form.Select
                  size='sm'
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    background: 'linear-gradient(135deg, #34495e, #2c3e50)',
                    border: '2px solid #3498db',
                    color: '#ecf0f1',
                    width: '130px',
                    fontWeight: '600',
                  }}
                >
                  <option
                    value='name'
                    style={{ background: '#2c3e50', color: '#ecf0f1' }}
                  >
                    Name
                  </option>
                  <option
                    value='price'
                    style={{ background: '#2c3e50', color: '#ecf0f1' }}
                  >
                    Price
                  </option>
                  <option
                    value='stock'
                    style={{ background: '#2c3e50', color: '#ecf0f1' }}
                  >
                    Stock
                  </option>
                  <option
                    value='category'
                    style={{ background: '#2c3e50', color: '#ecf0f1' }}
                  >
                    Category
                  </option>
                  <option
                    value='brand'
                    style={{ background: '#2c3e50', color: '#ecf0f1' }}
                  >
                    Brand
                  </option>
                </Form.Select>

                <Button
                  size='sm'
                  onClick={() =>
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  }
                  style={{
                    background:
                      sortOrder === 'asc'
                        ? 'linear-gradient(135deg, #27ae60, #229954)'
                        : 'linear-gradient(135deg, #e74c3c, #c0392b)',
                    border: 'none',
                    color: '#000000',
                    fontWeight: '600',
                    width: '45px',
                    height: '35px',
                    borderRadius: '8px',
                    boxShadow:
                      sortOrder === 'asc'
                        ? '0 2px 8px rgba(39, 174, 96, 0.3)'
                        : '0 2px 8px rgba(231, 76, 60, 0.3)',
                  }}
                >
                  <i
                    className={`fas fa-sort-${
                      sortOrder === 'asc' ? 'up' : 'down'
                    }`}
                  ></i>
                </Button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div
                className='border-top pt-3'
                style={{
                  borderColor: '#3498db !important',
                  borderWidth: '2px !important',
                }}
              >
                <Row className='g-3'>
                  {/* Category Filter */}
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label
                        style={{
                          color: '#000000',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                        }}
                        className='mb-2'
                      >
                        <i className='fas fa-tags me-1'></i>
                        Category
                      </Form.Label>
                      <Form.Select
                        size='sm'
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{
                          background:
                            'linear-gradient(135deg, #34495e, #2c3e50)',
                          border: '2px solid #3498db',
                          color: '#ecf0f1',
                          fontWeight: '500',
                        }}
                      >
                        <option
                          value=''
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          All Categories
                        </option>
                        {allCategories.map((category) => (
                          <option
                            key={category._id || category.name}
                            value={category.name}
                            style={{ background: '#2c3e50', color: '#ecf0f1' }}
                          >
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* Brand Filter */}
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label
                        style={{
                          color: '#000000',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                        }}
                        className='mb-2'
                      >
                        <i className='fas fa-industry me-1'></i>
                        Company/Brand
                      </Form.Label>
                      <Form.Select
                        size='sm'
                        value={filterBrand}
                        onChange={(e) => setFilterBrand(e.target.value)}
                        style={{
                          background:
                            'linear-gradient(135deg, #34495e, #2c3e50)',
                          border: '2px solid #3498db',
                          color: '#ecf0f1',
                          fontWeight: '500',
                        }}
                      >
                        <option
                          value=''
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          All Brands
                        </option>
                        {uniqueBrands.map((brand) => (
                          <option
                            key={brand}
                            value={brand}
                            style={{ background: '#2c3e50', color: '#ecf0f1' }}
                          >
                            {brand}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* Status Filter */}
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label
                        style={{
                          color: '#000000',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                        }}
                        className='mb-2'
                      >
                        <i className='fas fa-toggle-on me-1'></i>
                        Status
                      </Form.Label>
                      <Form.Select
                        size='sm'
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                          background:
                            'linear-gradient(135deg, #34495e, #2c3e50)',
                          border: '2px solid #3498db',
                          color: '#ecf0f1',
                          fontWeight: '500',
                        }}
                      >
                        <option
                          value=''
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          All Status
                        </option>
                        <option
                          value='active'
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          Active
                        </option>
                        <option
                          value='inactive'
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          Inactive
                        </option>
                        <option
                          value='featured'
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          Featured
                        </option>
                        <option
                          value='outOfStock'
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          Out of Stock
                        </option>
                        <option
                          value='lowStock'
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          Low Stock
                        </option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* Prescription Filter */}
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label
                        style={{
                          color: '#000000',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                        }}
                        className='mb-2'
                      >
                        <i className='fas fa-prescription-bottle me-1'></i>
                        Prescription
                      </Form.Label>
                      <Form.Select
                        size='sm'
                        value={filterPrescription}
                        onChange={(e) => setFilterPrescription(e.target.value)}
                        style={{
                          background:
                            'linear-gradient(135deg, #34495e, #2c3e50)',
                          border: '2px solid #3498db',
                          color: '#ecf0f1',
                          fontWeight: '500',
                        }}
                      >
                        <option
                          value=''
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          All Types
                        </option>
                        <option
                          value='required'
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          Prescription Required
                        </option>
                        <option
                          value='notRequired'
                          style={{ background: '#2c3e50', color: '#ecf0f1' }}
                        >
                          Over-the-Counter
                        </option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Clear Filters Button */}
                {(filterCategory ||
                  filterBrand ||
                  filterStatus ||
                  filterPrescription ||
                  sortBy !== 'name' ||
                  sortOrder !== 'asc') && (
                  <div className='mt-4 text-center'>
                    <Button
                      size='sm'
                      onClick={clearAllFilters}
                      style={{
                        background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                        border: 'none',
                        color: '#000000',
                        fontWeight: '600',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '20px',
                        boxShadow: '0 2px 8px rgba(243, 156, 18, 0.4)',
                      }}
                    >
                      <i className='fas fa-times me-2'></i>
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Loading and Error Messages */}
      {(loadingDelete || loadingCreate) && <Loader />}
      {errorDelete && <Message variant='danger'>{errorDelete}</Message>}
      {errorCreate && <Message variant='danger'>{errorCreate}</Message>}

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          {/* Results Summary */}
          {!loading && products && (
            <div className='mb-3'>
              <Row className='align-items-center'>
                <Col>
                  {(() => {
                    const filteredProducts = getFilteredAndSortedProducts();
                    const hasFilters =
                      filterCategory ||
                      filterBrand ||
                      filterStatus ||
                      filterPrescription;
                    const hasCustomSort =
                      sortBy !== 'name' || sortOrder !== 'desc';

                    return (
                      <div className='d-flex flex-wrap gap-2 align-items-center'>
                        <Badge bg='info' style={{ fontSize: '0.8rem' }}>
                          <i className='fas fa-list me-1'></i>
                          {filteredProducts.length} medicine
                          {filteredProducts.length !== 1 ? 's' : ''}
                        </Badge>

                        {hasFilters && (
                          <Badge bg='warning' style={{ fontSize: '0.75rem' }}>
                            <i className='fas fa-filter me-1'></i>
                            Filtered
                          </Badge>
                        )}

                        {hasCustomSort && (
                          <Badge bg='success' style={{ fontSize: '0.75rem' }}>
                            <i
                              className={`fas fa-sort-${
                                sortOrder === 'asc' ? 'up' : 'down'
                              } me-1`}
                            ></i>
                            Sorted by {sortBy}
                          </Badge>
                        )}
                      </div>
                    );
                  })()}
                </Col>
              </Row>
            </div>
          )}

          {/* Active Stock Filter Notification */}
          {(filterStatus === 'lowStock' || filterStatus === 'outOfStock') && (
            <Card
              className='border-0 shadow-sm mb-3'
              style={{
                background:
                  filterStatus === 'outOfStock'
                    ? 'linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(192, 57, 43, 0.1))'
                    : 'linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(230, 126, 34, 0.1))',
                border: `2px solid ${
                  filterStatus === 'outOfStock' ? '#e74c3c' : '#f39c12'
                }`,
              }}
            >
              <Card.Body className='py-2'>
                <div className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    <i
                      className={`fas ${
                        filterStatus === 'outOfStock'
                          ? 'fa-times-circle text-danger'
                          : 'fa-exclamation-triangle text-warning'
                      } me-2`}
                    ></i>
                    <span
                      className='text-black fw-semibold'
                      style={{ fontSize: '0.9rem' }}
                    >
                      Currently showing{' '}
                      {filterStatus === 'outOfStock'
                        ? 'out of stock'
                        : 'low stock'}{' '}
                      products only
                    </span>
                  </div>
                  <Button
                    variant='outline-secondary'
                    size='sm'
                    onClick={() => setFilterStatus('')}
                    style={{ fontSize: '0.8rem' }}
                  >
                    <i className='fas fa-times me-1'></i>
                    Show All Products
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Products Grid */}
          <Row className='g-3'>
            {(() => {
              const filteredProducts = getFilteredAndSortedProducts();
              return filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Col key={product._id} xs={12} sm={6} md={4} lg={3}>
                    <Card
                      className={`h-100 product-card border-0 shadow-sm ${
                        product.countInStock === 0
                          ? 'out-of-stock-card'
                          : product.countInStock <= LOW_STOCK_THRESHOLD
                          ? 'low-stock-card'
                          : ''
                      }`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '15px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                    >
                      <div className='position-relative'>
                        <Card.Img
                          variant='top'
                          src={product.image}
                          style={{
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '15px 15px 0 0',
                          }}
                        />

                        {/* Stock Warning Banner */}
                        {product.countInStock <= LOW_STOCK_THRESHOLD && (
                          <div
                            className='position-absolute top-0 start-0 w-100 stock-warning-banner'
                            style={{
                              background:
                                product.countInStock === 0
                                  ? 'linear-gradient(135deg, #e74c3c, #c0392b)'
                                  : 'linear-gradient(135deg, #f39c12, #e67e22)',
                              padding: '8px 12px',
                              borderRadius: '15px 15px 0 0',
                              zIndex: 10,
                            }}
                          >
                            <div className='d-flex align-items-center justify-content-between'>
                              <div className='d-flex align-items-center text-white'>
                                <i
                                  className={`fas ${
                                    product.countInStock === 0
                                      ? 'fa-times-circle'
                                      : 'fa-exclamation-triangle'
                                  } me-2`}
                                ></i>
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                  }}
                                >
                                  {product.countInStock === 0
                                    ? 'OUT OF STOCK'
                                    : `LOW STOCK: ${product.countInStock} left`}
                                </span>
                              </div>
                              <Button
                                variant='light'
                                size='sm'
                                as={Link}
                                to={`/admin/product/${product._id}/edit`}
                                style={{
                                  fontSize: '0.65rem',
                                  padding: '2px 8px',
                                  fontWeight: '600',
                                  background: 'white',
                                  color:
                                    product.countInStock === 0
                                      ? '#e74c3c'
                                      : '#f39c12',
                                  border: 'none',
                                }}
                              >
                                <i className='fas fa-plus me-1'></i>
                                Add Stock
                              </Button>
                            </div>
                          </div>
                        )}

                        {product.isFeatured && (
                          <div
                            className='position-absolute top-0 end-0 p-2'
                            style={{
                              background:
                                'linear-gradient(135deg, rgba(255,193,7,0.9) 0%, rgba(255,152,0,0.8) 100%)',
                              borderRadius: '0 15px 0 15px',
                            }}
                          >
                            <Badge bg='warning' style={{ fontSize: '0.8rem' }}>
                              <i className='fas fa-crown me-1'></i>
                              Featured
                            </Badge>
                          </div>
                        )}
                      </div>

                      <Card.Body className='d-flex flex-column'>
                        <div className='flex-grow-1'>
                          <Card.Title
                            className='text-white mb-2'
                            style={{
                              fontSize: '1rem',
                              fontWeight: '600',
                              lineHeight: '1.3',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {product.name}
                          </Card.Title>

                          {/* Medicine Information Section */}
                          <div className='mb-3 medicine-info-section'>
                            {/* Generic Name - Most Important */}
                            {product.genericName && (
                              <div className='mb-2'>
                                <Badge
                                  bg='primary'
                                  className='mb-1 medicine-badge'
                                  style={{
                                    fontSize: '0.75rem',
                                    background:
                                      'linear-gradient(45deg, #4f46e5, #7c3aed)',
                                    border: 'none',
                                  }}
                                >
                                  <i className='fas fa-dna me-1'></i>
                                  Generic: {product.genericName}
                                </Badge>
                              </div>
                            )}

                            {/* Dosage Information */}
                            <div className='row g-1 mb-2 text-white small'>
                              {product.dosageForm && (
                                <div className='col-12'>
                                  <i className='fas fa-capsules me-1 text-info'></i>
                                  <span className='fw-semibold'>Form:</span>{' '}
                                  {product.dosageForm}
                                </div>
                              )}
                              {product.strength && (
                                <div className='col-12'>
                                  <i className='fas fa-weight me-1 text-warning'></i>
                                  <span className='fw-semibold'>Strength:</span>{' '}
                                  {product.strength}
                                </div>
                              )}
                            </div>

                            {/* Medicine Name, Company & Category */}
                            <div className='row g-1 text-muted small'>
                              <div className='col-12'>
                                <i className='fas fa-pills me-1 text-primary'></i>
                                <span className='fw-semibold'>Medicine:</span>{' '}
                                <span className='text-black'>
                                  {product.name}
                                </span>
                              </div>
                              <div className='col-12'>
                                <i className='fas fa-industry me-1'></i>
                                <span className='fw-semibold'>
                                  Company:
                                </span>{' '}
                                {product.manufacturer ||
                                  product.brand ||
                                  'Not specified'}
                              </div>
                              <div className='col-12'>
                                <i className='fas fa-tags me-1'></i>
                                <span className='fw-semibold'>
                                  Category:
                                </span>{' '}
                                {product.category?.name ||
                                  product.category ||
                                  'Uncategorized'}
                              </div>
                            </div>

                            {/* Additional Medicine Info */}
                            <div className='mt-2'>
                              <div className='d-flex flex-wrap gap-1'>
                                {product.prescriptionRequired && (
                                  <Badge
                                    bg='danger'
                                    className='prescription-badge'
                                    style={{ fontSize: '0.65rem' }}
                                  >
                                    <i className='fas fa-prescription-bottle-medical me-1'></i>
                                    Prescription Required
                                  </Badge>
                                )}
                                {product.isActive ? (
                                  <Badge
                                    bg='success'
                                    style={{ fontSize: '0.65rem' }}
                                  >
                                    <i className='fas fa-check-circle me-1'></i>
                                    Available
                                  </Badge>
                                ) : (
                                  <Badge
                                    bg='secondary'
                                    style={{ fontSize: '0.65rem' }}
                                  >
                                    <i className='fas fa-pause-circle me-1'></i>
                                    Unavailable
                                  </Badge>
                                )}
                                {product.isFeatured && (
                                  <Badge
                                    bg='warning'
                                    style={{ fontSize: '0.65rem' }}
                                  >
                                    <i className='fas fa-star me-1'></i>
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Price and Stock Section */}
                          <div className='mb-3 p-2 rounded price-section'>
                            <div className='d-flex justify-content-center align-items-center flex-column'>
                              <div className='w-100 text-center'>
                                <div
                                  className='fw-bold text-white d-flex align-items-center justify-content-center'
                                  style={{ fontSize: '1.4rem' }}
                                >
                                  <i className='fas fa-tag me-2 text-success'></i>
                                  <span style={{ color: 'black' }}>
                                    ৳
                                    {parseFloat(product.price).toLocaleString()}
                                  </span>
                                </div>
                                <div className='mt-2'>
                                  {product.countInStock <=
                                  LOW_STOCK_THRESHOLD ? (
                                    <div
                                      className='p-2 rounded text-center stock-indicator-enhanced'
                                      style={{
                                        background:
                                          product.countInStock === 0
                                            ? 'linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.2))'
                                            : 'linear-gradient(135deg, rgba(243, 156, 18, 0.2), rgba(230, 126, 34, 0.2))',
                                        border: `2px solid ${
                                          product.countInStock === 0
                                            ? '#e74c3c'
                                            : '#f39c12'
                                        }`,
                                        borderRadius: '8px',
                                      }}
                                    >
                                      <div className='d-flex align-items-center justify-content-center mb-1'>
                                        <i
                                          className={`fas ${
                                            product.countInStock === 0
                                              ? 'fa-times-circle text-danger'
                                              : 'fa-exclamation-triangle text-warning'
                                          } me-2`}
                                          style={{ fontSize: '1.2rem' }}
                                        ></i>
                                        <span
                                          className='fw-bold'
                                          style={{
                                            color:
                                              product.countInStock === 0
                                                ? '#e74c3c'
                                                : '#f39c12',
                                            fontSize: '0.9rem',
                                          }}
                                        >
                                          {product.countInStock === 0
                                            ? 'OUT OF STOCK'
                                            : 'LOW STOCK'}
                                        </span>
                                      </div>
                                      <span
                                        className='fw-semibold'
                                        style={{
                                          color:
                                            product.countInStock === 0
                                              ? '#e74c3c'
                                              : '#f39c12',
                                          fontSize: '0.85rem',
                                        }}
                                      >
                                        {product.countInStock} units remaining
                                      </span>
                                    </div>
                                  ) : (
                                    <div className='d-flex align-items-center justify-content-center'>
                                      <i className='fas fa-boxes text-success me-1'></i>
                                      <span className='fw-semibold text-black me-1'>
                                        Stock:
                                      </span>
                                      <span className='text-success fw-bold'>
                                        {product.countInStock} units
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className='d-flex gap-2'>
                          <Button
                            variant={
                              product.countInStock <= LOW_STOCK_THRESHOLD
                                ? 'warning'
                                : 'outline-light'
                            }
                            size='sm'
                            className='flex-fill'
                            as={Link}
                            to={`/admin/product/${product._id}/edit`}
                            style={
                              product.countInStock <= LOW_STOCK_THRESHOLD
                                ? {
                                    background:
                                      'linear-gradient(135deg, #f39c12, #e67e22)',
                                    border: 'none',
                                    color: 'white',
                                    fontWeight: '600',
                                    boxShadow:
                                      '0 2px 8px rgba(243, 156, 18, 0.3)',
                                  }
                                : {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    backdropFilter: 'blur(5px)',
                                    color: '#000000',
                                    fontWeight: '600',
                                  }
                            }
                          >
                            <i
                              className={`fas ${
                                product.countInStock <= LOW_STOCK_THRESHOLD
                                  ? 'fa-plus'
                                  : 'fa-edit'
                              } me-1`}
                            ></i>
                            {product.countInStock <= LOW_STOCK_THRESHOLD
                              ? 'Add Stock'
                              : 'Edit'}
                          </Button>
                          <Button
                            variant='outline-danger'
                            size='sm'
                            onClick={() => deleteHandler(product)}
                            style={{
                              borderColor: 'rgba(220, 53, 69, 0.5)',
                              color: '#dc3545',
                            }}
                          >
                            <i className='fas fa-trash'></i>
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col xs={12}>
                  <Card
                    className='text-center border-0 shadow-sm'
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '15px',
                      padding: '3rem',
                    }}
                  >
                    <Card.Body>
                      <i
                        className='fas fa-pills mb-3 text-muted'
                        style={{ fontSize: '3rem' }}
                      ></i>
                      <h5 className='text-white mb-2'>
                        {(() => {
                          const hasFilters =
                            filterCategory ||
                            filterBrand ||
                            filterStatus ||
                            filterPrescription;
                          if (products && products.length > 0 && hasFilters) {
                            return 'No Products Match Filters';
                          } else if (searchTerm) {
                            return 'No Products Found';
                          } else {
                            return 'No Products Found';
                          }
                        })()}
                      </h5>
                      <p className='text-muted mb-3'>
                        {(() => {
                          const hasFilters =
                            filterCategory ||
                            filterBrand ||
                            filterStatus ||
                            filterPrescription;
                          if (products && products.length > 0 && hasFilters) {
                            return 'Try adjusting your filters to see more products';
                          } else if (searchTerm) {
                            return `No products match "${searchTerm}"`;
                          } else {
                            return 'Start by adding your first product';
                          }
                        })()}
                      </p>
                      <div className='d-flex gap-2 justify-content-center flex-wrap'>
                        {(() => {
                          const hasFilters =
                            filterCategory ||
                            filterBrand ||
                            filterStatus ||
                            filterPrescription;
                          if (products && products.length > 0 && hasFilters) {
                            return (
                              <Button
                                variant='outline-warning'
                                onClick={clearAllFilters}
                                style={{
                                  borderColor: 'rgba(255, 193, 7, 0.5)',
                                  color: '#ffc107',
                                }}
                              >
                                <i className='fas fa-times me-2'></i>
                                Clear Filters
                              </Button>
                            );
                          } else {
                            return (
                              <Button
                                onClick={createProductHandler}
                                style={{
                                  background:
                                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  border: 'none',
                                  borderRadius: '10px',
                                }}
                              >
                                <i className='fas fa-plus me-2'></i>
                                Add First Product
                              </Button>
                            );
                          }
                        })()}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })()}
          </Row>

          {/* Pagination */}
          {pages > 1 && (
            <div className='d-flex justify-content-center mt-4'>
              <Paginate pages={pages} page={page} isAdmin={true} />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        className='glass-modal'
      >
        <Modal.Header
          closeButton
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
          }}
        >
          <Modal.Title className='text-white'>
            <i className='fas fa-exclamation-triangle me-2'></i>
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            background: '#1a1a2e',
            color: 'white',
          }}
        >
          <p>Are you sure you want to delete this product?</p>
          {productToDelete && (
            <div
              className='p-3 rounded'
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <strong>{productToDelete.name}</strong>
              <br />
              <small className='text-muted'>
                Category:{' '}
                {productToDelete.category?.name ||
                  productToDelete.category ||
                  'N/A'}{' '}
                | Price: ৳{productToDelete.price}
              </small>
            </div>
          )}
          <p className='mt-3 text-warning'>
            <i className='fas fa-warning me-1'></i>
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer
          style={{
            background: '#1a1a2e',
            border: 'none',
          }}
        >
          <Button
            variant='outline-light'
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button variant='danger' onClick={confirmDelete}>
            <i className='fas fa-trash me-1'></i>
            Delete Product
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductListScreen;
