import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Container } from 'react-bootstrap';
import Product from '../components/Product';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import HeroBanner from '../components/HeroBanner';
import FeaturedCategories from '../components/FeaturedCategories';
import ProductSections from '../components/ProductSections';

import { listProducts } from '../actions/productActions';
import { listCategories } from '../actions/categoryActions';
import { listHealthConditions } from '../actions/healthConditionActions';
import { listBrands } from '../actions/brandActions';

const HomeScreen = () => {
  const { keyword, pageNumber, categoryName, conditionName, brandName } =
    useParams();
  const keywordSearch = keyword || '';
  const page = pageNumber || 1;
  const dispatch = useDispatch();

  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  const categoryList = useSelector((state) => state.categoryList);
  const { categories } = categoryList;

  const healthConditionList = useSelector((state) => state.healthConditionList);
  const { healthConditions } = healthConditionList;

  const brandList = useSelector((state) => state.brandList);
  const { brands } = brandList;

  // Find category ID from category name for filtering
  const getCategoryId = (catName) => {
    if (!catName || !categories) return '';
    const category = categories.find(
      (cat) =>
        cat.name.toLowerCase().replace(/\s+/g, '-') === catName.toLowerCase()
    );
    return category ? category._id : '';
  };

  // Find health condition ID from condition name for filtering
  const getHealthConditionId = (condName) => {
    if (!condName || !healthConditions) return '';
    const condition = healthConditions.find(
      (cond) =>
        cond.name.toLowerCase().replace(/\s+/g, '-') === condName.toLowerCase()
    );
    return condition ? condition._id : '';
  };

  // const categoryId = getCategoryId(categoryName);
  // const conditionId = getHealthConditionId(conditionName);

  useEffect(() => {
    // Fetch categories, health conditions, and brands first
    dispatch(listCategories());
    dispatch(listHealthConditions());
    dispatch(listBrands());
  }, [dispatch]);

  useEffect(() => {
    // Then fetch products with category, health condition, or brand filter if applicable
    const actualCategoryName = categoryName
      ? categoryName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      : '';
    const actualConditionName = conditionName
      ? conditionName
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())
      : '';
    const actualBrandName = brandName
      ? brandName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      : '';
    dispatch(
      listProducts(
        keywordSearch,
        page,
        actualCategoryName,
        actualConditionName,
        actualBrandName
      )
    );
  }, [dispatch, keywordSearch, page, categoryName, conditionName, brandName]);

  // Get current category for display
  const currentCategory =
    categories && categoryName
      ? categories.find(
          (cat) =>
            cat.name.toLowerCase().replace(/\s+/g, '-') ===
            categoryName.toLowerCase()
        )
      : null;

  // Get current health condition for display
  const currentCondition =
    healthConditions && conditionName
      ? healthConditions.find(
          (cond) =>
            cond.name.toLowerCase().replace(/\s+/g, '-') ===
            conditionName.toLowerCase()
        )
      : null;

  // Get current brand for display
  const currentBrand =
    brands && brandName
      ? brands.find(
          (brand) =>
            brand.name.toLowerCase().replace(/\s+/g, '-') ===
            brandName.toLowerCase()
        )
      : null;

  return (
    <>
      {!keywordSearch && !categoryName && !conditionName && !brandName ? (
        // Modern Homepage Layout
        <>
          {/* Hero Banner Section */}
          <HeroBanner />

          {/* Featured Categories Section */}
          <FeaturedCategories />

          {/* Product Sections (Especially for You, Flash Sale, etc.) */}
          <ProductSections />
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
              <p className='text-black'>{currentCategory.description}</p>
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
                    brand={brandName ? brandName : ''}
                  />
                </div>
              )}
            </>
          )}
        </Container>
      ) : conditionName ? (
        // Health Condition Products Layout
        <Container className='py-4'>
          <Link to='/' className='btn btn-light mb-3'>
            <i className='fas fa-arrow-left me-2'></i>
            Go Back
          </Link>

          <div className='mb-4'>
            <h1 className='mb-2'>
              {currentCondition ? (
                <>
                  <i
                    className={`${currentCondition.icon} me-3`}
                    style={{ color: currentCondition.color }}
                  ></i>
                  {currentCondition.name}
                </>
              ) : (
                conditionName
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())
              )}
            </h1>
            {currentCondition && (
              <p className='text-black'>{currentCondition.description}</p>
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
                      No products found for this health condition
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
                    condition={conditionName}
                    brand={brandName ? brandName : ''}
                  />
                </div>
              )}
            </>
          )}
        </Container>
      ) : brandName ? (
        // Brand Products Layout
        <Container className='py-4'>
          <Link to='/' className='btn btn-light mb-3'>
            <i className='fas fa-arrow-left me-2'></i>
            Go Back
          </Link>

          <div className='mb-4'>
            <h1 className='mb-2'>
              {currentBrand ? (
                <>
                  <i
                    className='fas fa-award me-3'
                    style={{ color: '#F18F01' }}
                  ></i>
                  {currentBrand.name}
                </>
              ) : (
                brandName
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())
              )}
            </h1>
            {currentBrand && (
              <p className='text-black'>{currentBrand.description}</p>
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
                      No products found for this brand
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
                    brand={brandName}
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
                    condition={conditionName ? conditionName : ''}
                    brand={brandName ? brandName : ''}
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
