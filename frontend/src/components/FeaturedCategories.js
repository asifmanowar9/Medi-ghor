import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { listCategories } from '../actions/categoryActions';
import { listProducts } from '../actions/productActions';
import { listHealthConditions } from '../actions/healthConditionActions';
import '../styles/FeaturedCategories.css';

const FeaturedCategories = () => {
  const dispatch = useDispatch();

  const categoryList = useSelector((state) => state.categoryList);
  const {
    loading: categoriesLoading,
    error: categoriesError,
    categories,
  } = categoryList;

  const productList = useSelector((state) => state.productList);
  const {
    loading: productsLoading,
    error: productsError,
    products,
  } = productList;

  const healthConditionList = useSelector((state) => state.healthConditionList);
  const {
    loading: conditionsLoading,
    error: conditionsError,
    healthConditions,
  } = healthConditionList;

  // Extract unique brands from products
  const uniqueBrands = React.useMemo(() => {
    if (!products || products.length === 0) return [];

    const brandSet = new Set();
    products.forEach((product) => {
      if (product.brand && product.brand.trim()) {
        brandSet.add(product.brand.trim());
      }
    });

    return Array.from(brandSet).sort().slice(0, 6); // Show only first 6 brands
  }, [products]);

  useEffect(() => {
    dispatch(listCategories());
    dispatch(listProducts());
    dispatch(listHealthConditions());
  }, [dispatch]);

  return (
    <section id='categories' className='featured-categories py-5'>
      <Container>
        {/* Section Header */}
        <Row className='mb-4'>
          <Col>
            <div className='section-header text-center'>
              <h2 className='section-title'>
                <i className='fas fa-grid-3x3 me-3'></i>
                Shop by Categories
              </h2>
              <p className='section-subtitle'>
                Find medicines and healthcare products by category
              </p>
            </div>
          </Col>
        </Row>

        {/* Main Categories Grid */}
        <Row className='categories-grid'>
          {categoriesLoading ? (
            <Col className='text-center py-4'>
              <Spinner animation='border' variant='primary' />
              <p className='mt-2'>Loading categories...</p>
            </Col>
          ) : categoriesError ? (
            <Col>
              <Alert variant='danger'>
                Error loading categories: {categoriesError}
              </Alert>
            </Col>
          ) : categories && categories.length > 0 ? (
            categories.map((category) => (
              <Col
                key={category._id}
                xl={3}
                lg={4}
                md={6}
                sm={6}
                xs={6}
                className='mb-4'
              >
                <LinkContainer
                  to={`/category/${category.name
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                >
                  <Card className='category-card h-100'>
                    <Card.Body className='text-center p-3'>
                      <div
                        className='category-icon mb-3'
                        style={{
                          background: `linear-gradient(135deg, ${
                            category.color || '#2E86AB'
                          } 0%, ${category.color || '#2E86AB'}CC 100%)`,
                        }}
                      >
                        <i className={category.icon || 'fas fa-pills'}></i>
                      </div>
                      <h6 className='category-name'>{category.name}</h6>
                      <p className='category-description'>
                        {category.description}
                      </p>
                      <div className='category-count'>
                        <i className='fas fa-box me-1'></i>
                        {category.productCount || 0} items
                      </div>
                    </Card.Body>
                  </Card>
                </LinkContainer>
              </Col>
            ))
          ) : (
            <Col className='text-center py-4'>
              <p>No categories available at the moment.</p>
            </Col>
          )}
        </Row>

        {/* Health Conditions Section */}
        <Row id='health-conditions' className='mt-5'>
          <Col>
            <div className='section-header text-center mb-4'>
              <h3 className='section-title'>
                <i className='fas fa-user-md me-3'></i>
                Shop by Health Conditions
              </h3>
              <p className='section-subtitle'>
                Find products based on your health needs
              </p>
            </div>
          </Col>
        </Row>

        <Row className='health-conditions-row justify-content-center'>
          {conditionsLoading ? (
            <Col className='text-center py-4'>
              <Spinner animation='border' variant='primary' size='sm' />
            </Col>
          ) : conditionsError ? (
            <Col>
              <Alert variant='warning' className='text-center'>
                Error loading health conditions
              </Alert>
            </Col>
          ) : healthConditions && healthConditions.length > 0 ? (
            healthConditions.map((condition) => (
              <Col
                key={condition._id}
                lg={2}
                md={4}
                sm={6}
                xs={6}
                className='mb-3'
              >
                <LinkContainer
                  to={`/condition/${condition.name
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                >
                  <div className='health-condition-item'>
                    <div
                      className='condition-icon'
                      style={{ backgroundColor: condition.color || '#2E86AB' }}
                    >
                      <i className={condition.icon || 'fas fa-stethoscope'}></i>
                    </div>
                    <span className='condition-name'>{condition.name}</span>
                  </div>
                </LinkContainer>
              </Col>
            ))
          ) : (
            <Col className='text-center py-2'>
              <p className='text-muted'>No health conditions available.</p>
            </Col>
          )}
        </Row>

        {/* Popular Brands Section */}
        <Row id='brands' className='mt-5'>
          <Col>
            <div className='section-header text-center mb-4'>
              <h3 className='section-title'>
                <i className='fas fa-award me-3'></i>
                Popular Brands
              </h3>
              <p className='section-subtitle'>Trusted pharmaceutical brands</p>
            </div>
          </Col>
        </Row>

        <Row className='brands-row'>
          {productsLoading ? (
            <Col className='text-center py-4'>
              <Spinner animation='border' variant='primary' size='sm' />
            </Col>
          ) : productsError ? (
            <Col>
              <Alert variant='warning' className='text-center'>
                Error loading brands
              </Alert>
            </Col>
          ) : uniqueBrands && uniqueBrands.length > 0 ? (
            uniqueBrands.map((brandName, index) => (
              <Col key={index} lg={2} md={4} sm={6} xs={6} className='mb-3'>
                <LinkContainer
                  to={`/brand/${brandName.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className='brand-item'>
                    <span className='brand-name'>{brandName}</span>
                  </div>
                </LinkContainer>
              </Col>
            ))
          ) : (
            <Col className='text-center py-2'>
              <p className='text-muted'>No brands available.</p>
            </Col>
          )}
        </Row>
      </Container>
    </section>
  );
};

export default FeaturedCategories;
