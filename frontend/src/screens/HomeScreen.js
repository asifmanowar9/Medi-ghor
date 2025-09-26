import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Container } from 'react-bootstrap';
import Product from '../components/Product';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import HeroBanner from '../components/HeroBanner';
import FeaturedCategories from '../components/FeaturedCategories';
import ProductSections from '../components/ProductSections';
import DiscountBanner from '../components/DiscountBanner';
import { listProducts } from '../actions/productActions';
import { listCategories } from '../actions/categoryActions';

const HomeScreen = () => {
  const { keyword, pageNumber, categoryName } = useParams();
  const keywordSearch = keyword || '';
  const page = pageNumber || 1;
  const dispatch = useDispatch();

  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  const categoryList = useSelector((state) => state.categoryList);
  const { categories } = categoryList;

  // Find category ID from category name for filtering
  const getCategoryId = (catName) => {
    if (!catName || !categories) return '';
    const category = categories.find(
      (cat) =>
        cat.name.toLowerCase().replace(/\s+/g, '-') === catName.toLowerCase()
    );
    return category ? category._id : '';
  };

  const categoryId = getCategoryId(categoryName);

  useEffect(() => {
    // Fetch categories first
    dispatch(listCategories());
  }, [dispatch]);

  useEffect(() => {
    // Then fetch products with category filter if applicable
    const actualCategoryName = categoryName
      ? categoryName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      : '';
    dispatch(listProducts(keywordSearch, page, actualCategoryName));
  }, [dispatch, keywordSearch, page, categoryName]);

  // Get current category for display
  const currentCategory =
    categories && categoryName
      ? categories.find(
          (cat) =>
            cat.name.toLowerCase().replace(/\s+/g, '-') ===
            categoryName.toLowerCase()
        )
      : null;

  return (
    <>
      {!keywordSearch && !categoryName ? (
        // Modern Homepage Layout
        <>
          {/* Hero Banner Section */}
          <HeroBanner />

          {/* Featured Categories Section */}
          <FeaturedCategories />

          {/* Product Sections (Especially for You, Flash Sale, etc.) */}
          <ProductSections />

          {/* Discount Banner */}
          <DiscountBanner />

          {/* Latest Products Section */}
          <section
            className='latest-products py-5'
            style={{ background: '#f8f9fa' }}
          >
            <Container>
              <Row className='mb-4'>
                <Col>
                  <div className='text-center'>
                    <h2
                      className='section-title'
                      style={{
                        color: '#2D3436',
                        fontWeight: 700,
                        fontSize: '2rem',
                      }}
                    >
                      <i
                        className='fas fa-star me-3'
                        style={{ color: '#2E86AB' }}
                      ></i>
                      Latest Products
                    </h2>
                    <p style={{ color: '#636e72', fontSize: '1.1rem' }}>
                      Discover our newest additions to the medical store
                    </p>
                  </div>
                </Col>
              </Row>

              {loading ? (
                <Loader />
              ) : error ? (
                <Message variant='danger'>{error}</Message>
              ) : (
                <>
                  <Row>
                    {products && products.length > 0 ? (
                      products.map((product) => (
                        <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                          <Product product={product} />
                        </Col>
                      ))
                    ) : (
                      <Col>
                        <Message variant='info'>No products found</Message>
                      </Col>
                    )}
                  </Row>
                  {products && products.length > 0 && (
                    <div className='d-flex justify-content-center mt-4'>
                      <Paginate
                        pages={productList.pages}
                        page={page}
                        keyword={keywordSearch ? keywordSearch : ''}
                        category={categoryName ? categoryName : ''}
                      />
                    </div>
                  )}
                </>
              )}
            </Container>
          </section>
        </>
      ) : categoryName ? (
        // Category Products Layout
        <Container className='py-4'>
          <Link to='/' className='btn btn-light mb-3'>
            <i className='fas fa-arrow-left me-2'></i>
            Go Back
          </Link>

          <div className='mb-4'>
            <h1 className='mb-2'>
              {currentCategory ? (
                <>
                  <i
                    className={`${currentCategory.icon} me-3`}
                    style={{ color: currentCategory.color }}
                  ></i>
                  {currentCategory.name}
                </>
              ) : (
                categoryName
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())
              )}
            </h1>
            {currentCategory && (
              <p className='text-muted'>{currentCategory.description}</p>
            )}
          </div>

          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant='danger'>{error}</Message>
          ) : (
            <>
              <Row>
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                      <Product product={product} />
                    </Col>
                  ))
                ) : (
                  <Col>
                    <Message variant='info'>
                      No products found in this category
                    </Message>
                  </Col>
                )}
              </Row>
              {products && products.length > 0 && (
                <div className='d-flex justify-content-center mt-4'>
                  <Paginate
                    pages={productList.pages}
                    page={page}
                    keyword={''}
                    category={categoryName}
                  />
                </div>
              )}
            </>
          )}
        </Container>
      ) : (
        // Search Results Layout
        <Container className='py-4'>
          <Link to='/' className='btn btn-light mb-3'>
            <i className='fas fa-arrow-left me-2'></i>
            Go Back
          </Link>

          <h1 className='mb-4'>Search Results for "{keywordSearch}"</h1>
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant='danger'>{error}</Message>
          ) : (
            <>
              <Row>
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                      <Product product={product} />
                    </Col>
                  ))
                ) : (
                  <Col>
                    <Message variant='info'>No search results found</Message>
                  </Col>
                )}
              </Row>
              {products && products.length > 0 && (
                <div className='d-flex justify-content-center mt-4'>
                  <Paginate
                    pages={productList.pages}
                    page={page}
                    keyword={keywordSearch ? keywordSearch : ''}
                    category={categoryName ? categoryName : ''}
                  />
                </div>
              )}
            </>
          )}
        </Container>
      )}
    </>
  );
};

export default HomeScreen;
