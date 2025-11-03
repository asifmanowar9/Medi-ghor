import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Image,
  Card,
  Button,
  Form,
  Container,
  Badge,
} from 'react-bootstrap';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import {
  listProductDetails,
  createProductReview,
} from '../actions/productActions';
import { PRODUCT_CREATE_REVIEW_RESET } from '../constants/productConstants';
import './ProductScreen.css';

const ProductScreen = () => {
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const productReviewCreate = useSelector((state) => state.productReviewCreate);
  const { success: successProductReview, error: errorProductReview } =
    productReviewCreate;

  useEffect(() => {
    if (successProductReview) {
      setRating(0);
      setComment('');
      dispatch({ type: PRODUCT_CREATE_REVIEW_RESET });
    }
    dispatch(listProductDetails(id));
  }, [dispatch, id, successProductReview]);

  const addTocartHandler = () => {
    navigate(`/cart/${id}?qty=${qty}`); // Change history.push to navigate
  };

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      createProductReview(product._id, {
        rating,
        comment,
      })
    );
  };

  // In your render function, fix the image path:
  const imagePath =
    product.image &&
    (product.image.startsWith('http')
      ? product.image
      : product.image.startsWith('/uploads')
      ? product.image
      : product.image.startsWith('/images')
      ? product.image
      : `/uploads/${product.image}`);

  return (
    <div className='product-screen-container'>
      <Container fluid>
        <Link className='back-btn' to='/'>
          <i className='fas fa-arrow-left me-2'></i>
          Go Back
        </Link>

        {loading ? (
          <div className='text-center py-5'>
            <Loader />
          </div>
        ) : error ? (
          <Message variant='danger'>{error}</Message>
        ) : (
          <>
            {/* Main Product Information */}
            <Card className='product-main-card'>
              <Card.Body className='p-4'>
                <Row className='g-4'>
                  {/* Product Image */}
                  <Col lg={6}>
                    <div className='product-image-container'>
                      <Image
                        src={imagePath}
                        alt={product.name}
                        className='product-image'
                        fluid
                      />
                    </div>
                  </Col>

                  {/* Product Information */}
                  <Col lg={4}>
                    <div className='product-info-section'>
                      <h1 className='product-title'>
                        <i className='fas fa-pills me-3'></i>
                        {product.name}
                      </h1>

                      <div className='product-rating mb-3'>
                        <Rating
                          value={product.rating}
                          text={`${product.numReviews} reviews`}
                        />
                      </div>

                      <div className='product-price mb-3'>
                        <i className='fas fa-tag me-2'></i>
                        BDT {product.price}
                      </div>

                      <div className='product-description mb-4'>
                        {product.description || 'No description available.'}
                      </div>

                      {/* Product Details Section */}
                      <div className='product-details-section'>
                        <h4 className='details-title mb-3'>
                          <i className='fas fa-info-circle me-2'></i>
                          Product Details
                        </h4>

                        <div className='details-grid'>
                          {/* Category */}
                          {product.category && (
                            <div className='detail-item'>
                              <span className='detail-label'>
                                <i className='fas fa-tags me-2'></i>
                                Category:
                              </span>
                              <span className='detail-value'>
                                <Badge bg='primary' className='category-badge'>
                                  {product.category.icon && (
                                    <i
                                      className={`fas ${product.category.icon} me-1`}
                                    ></i>
                                  )}
                                  {product.category.name}
                                </Badge>
                              </span>
                            </div>
                          )}

                          {/* Brand */}
                          {product.brand && (
                            <div className='detail-item'>
                              <span className='detail-label'>
                                <i className='fas fa-award me-2'></i>
                                Brand:
                              </span>
                              <span className='detail-value brand-name'>
                                {product.brand}
                              </span>
                            </div>
                          )}

                          {/* Generic Name */}
                          {product.genericName && (
                            <div className='detail-item'>
                              <span className='detail-label'>
                                <i className='fas fa-prescription me-2'></i>
                                Generic Name:
                              </span>
                              <span className='detail-value'>
                                {product.genericName}
                              </span>
                            </div>
                          )}

                          {/* Manufacturer */}
                          {product.manufacturer && (
                            <div className='detail-item'>
                              <span className='detail-label'>
                                <i className='fas fa-industry me-2'></i>
                                Manufacturer:
                              </span>
                              <span className='detail-value'>
                                {product.manufacturer}
                              </span>
                            </div>
                          )}

                          {/* Dosage Form */}
                          {product.dosageForm && (
                            <div className='detail-item'>
                              <span className='detail-label'>
                                <i className='fas fa-pills me-2'></i>
                                Dosage Form:
                              </span>
                              <span className='detail-value'>
                                {product.dosageForm}
                              </span>
                            </div>
                          )}

                          {/* Strength */}
                          {product.strength && (
                            <div className='detail-item'>
                              <span className='detail-label'>
                                <i className='fas fa-weight me-2'></i>
                                Strength:
                              </span>
                              <span className='detail-value strength-value'>
                                {product.strength}
                              </span>
                            </div>
                          )}

                          {/* Stock */}
                          <div className='detail-item'>
                            <span className='detail-label'>
                              <i className='fas fa-boxes me-2'></i>
                              Stock:
                            </span>
                            <span className='detail-value'>
                              {product.countInStock > 0 ? (
                                <Badge bg='success'>
                                  <i className='fas fa-check me-1'></i>
                                  {product.countInStock} units available
                                </Badge>
                              ) : (
                                <Badge bg='danger'>
                                  <i className='fas fa-times me-1'></i>
                                  Out of stock
                                </Badge>
                              )}
                            </span>
                          </div>

                          {/* Prescription Required */}
                          <div className='detail-item'>
                            <span className='detail-label'>
                              <i className='fas fa-file-medical me-2'></i>
                              Prescription:
                            </span>
                            <span className='detail-value'>
                              {product.prescriptionRequired ? (
                                <Badge bg='warning'>
                                  <i className='fas fa-exclamation-triangle me-1'></i>
                                  Required
                                </Badge>
                              ) : (
                                <Badge bg='success'>
                                  <i className='fas fa-check me-1'></i>
                                  Not Required
                                </Badge>
                              )}
                            </span>
                          </div>

                          {/* Health Conditions */}
                          {product.healthConditions &&
                            product.healthConditions.length > 0 && (
                              <div className='detail-item'>
                                <span className='detail-label'>
                                  <i className='fas fa-heartbeat me-2'></i>
                                  Health Conditions:
                                </span>
                                <div className='detail-value'>
                                  <div className='health-conditions-container'>
                                    {product.healthConditions.map(
                                      (condition) => (
                                        <Badge
                                          key={condition._id}
                                          bg='info'
                                          className='health-condition-badge me-1 mb-1'
                                        >
                                          {condition.icon && (
                                            <i
                                              className={`fas ${condition.icon} me-1`}
                                            ></i>
                                          )}
                                          {condition.name}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Price Information */}
                          {/* <div className='detail-item'>
                            <span className='detail-label'>
                              <i className='fas fa-dollar-sign me-2'></i>
                              Price Details:
                            </span>
                            <div className='detail-value'>
                              <div className='price-details'>
                                <div className='current-price'>
                                  <strong>৳{product.price}</strong>
                                </div>
                                {product.originalPrice &&
                                  product.originalPrice > product.price && (
                                    <div className='original-price'>
                                      <span className='text-decoration-line-through text-muted'>
                                        ৳{product.originalPrice}
                                      </span>
                                      <Badge bg='danger' className='ms-2'>
                                        {Math.round(
                                          ((product.originalPrice -
                                            product.price) /
                                            product.originalPrice) *
                                            100
                                        )}
                                        % OFF
                                      </Badge>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div> */}

                          {/* Flash Sale */}
                          {product.isFlashSale && (
                            <div className='detail-item'>
                              <span className='detail-label'>
                                <i className='fas fa-flash me-2'></i>
                                Flash Sale:
                              </span>
                              <span className='detail-value'>
                                <Badge bg='danger' className='flash-sale-badge'>
                                  <i className='fas fa-fire me-1'></i>
                                  Flash Sale Active
                                  {product.flashSaleEndDate && (
                                    <div className='flash-sale-end'>
                                      Ends:{' '}
                                      {new Date(
                                        product.flashSaleEndDate
                                      ).toLocaleDateString()}
                                    </div>
                                  )}
                                </Badge>
                              </span>
                            </div>
                          )}

                          {/* Featured Product */}
                          {/* {product.isFeatured && (
                            <div className='detail-item'>
                              <span className='detail-label'>
                                <i className='fas fa-star me-2'></i>
                                Featured:
                              </span>
                              <span className='detail-value'>
                                <Badge bg='warning' text='dark'>
                                  <i className='fas fa-crown me-1'></i>
                                  Featured Product
                                </Badge>
                              </span>
                            </div>
                          )} */}
                        </div>
                      </div>
                    </div>
                  </Col>

                  {/* Purchase Section */}
                  <Col lg={2}>
                    <Card className='purchase-card'>
                      <div className='purchase-header'>
                        <h5 className='purchase-title'>
                          <i className='fas fa-shopping-cart me-2'></i>
                          Purchase Options
                        </h5>
                      </div>

                      <div className='purchase-item'>
                        <div className='d-flex justify-content-between align-items-center w-100'>
                          <span className='purchase-label'>Price:</span>
                          <span className='purchase-value price-value'>
                            BDT {product.price}
                          </span>
                        </div>
                      </div>

                      <div className='purchase-item'>
                        <div className='d-flex justify-content-between align-items-center w-100'>
                          <span className='purchase-label'>Status:</span>
                          <Badge
                            className={`status-badge ${
                              product.countInStock > 0
                                ? 'in-stock'
                                : 'out-of-stock'
                            }`}
                          >
                            <i
                              className={`fas ${
                                product.countInStock > 0
                                  ? 'fa-check-circle'
                                  : 'fa-times-circle'
                              } me-1`}
                            ></i>
                            {product.countInStock > 0
                              ? 'In Stock'
                              : 'Out of Stock'}
                          </Badge>
                        </div>
                      </div>

                      {product.countInStock > 0 && (
                        <div className='purchase-item'>
                          <div className='d-flex justify-content-between align-items-center w-100'>
                            <span className='purchase-label'>
                              <i className='fas fa-sort-numeric-up me-2'></i>
                              Qty:
                            </span>
                            <div className='qty-selector-container'>
                              <div
                                className='d-flex align-items-center'
                                style={{ maxWidth: '120px' }}
                              >
                                <Button
                                  variant='outline-secondary'
                                  size='sm'
                                  disabled={qty <= 1}
                                  onClick={() => setQty(Math.max(1, qty - 1))}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    padding: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <i
                                    className='fas fa-minus'
                                    style={{ fontSize: '0.8rem' }}
                                  ></i>
                                </Button>
                                <Form.Control
                                  type='number'
                                  min='1'
                                  max={product.countInStock}
                                  value={qty}
                                  onChange={(e) => {
                                    const newQty =
                                      parseInt(e.target.value) || 1;
                                    if (
                                      newQty >= 1 &&
                                      newQty <= product.countInStock
                                    ) {
                                      setQty(newQty);
                                    }
                                  }}
                                  onBlur={(e) => {
                                    const newQty =
                                      parseInt(e.target.value) || 1;
                                    const validQty = Math.max(
                                      1,
                                      Math.min(product.countInStock, newQty)
                                    );
                                    setQty(validQty);
                                  }}
                                  className='text-center'
                                  style={{
                                    width: '50px',
                                    fontSize: '0.85rem',
                                    height: '32px',
                                    margin: '0 4px',
                                    padding: '0 4px',
                                    appearance: 'textfield',
                                  }}
                                />
                                <Button
                                  variant='outline-secondary'
                                  size='sm'
                                  disabled={qty >= product.countInStock}
                                  onClick={() =>
                                    setQty(
                                      Math.min(product.countInStock, qty + 1)
                                    )
                                  }
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    padding: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <i
                                    className='fas fa-plus'
                                    style={{ fontSize: '0.8rem' }}
                                  ></i>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className='purchase-item'>
                        <Button
                          onClick={addTocartHandler}
                          className='add-to-cart-btn'
                          disabled={product.countInStock === 0}
                        >
                          <i className='fas fa-cart-plus me-2'></i>
                          {product.countInStock === 0
                            ? 'Out of Stock'
                            : 'Add to Cart'}
                        </Button>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Reviews Section */}
            <Card className='reviews-section'>
              <div className='reviews-header'>
                <h2 className='reviews-title'>
                  <i className='fas fa-comments me-3'></i>
                  Customer Reviews ({product.reviews?.length || 0})
                </h2>
              </div>

              <div className='reviews-content'>
                {product.reviews?.length === 0 ? (
                  <div className='no-reviews-message'>
                    <i className='fas fa-comment-slash fa-3x mb-3'></i>
                    <p>No reviews yet. Be the first to review this product!</p>
                  </div>
                ) : (
                  <div className='mb-4'>
                    {product.reviews?.map((review) => (
                      <div key={review._id} className='review-item'>
                        <div className='review-header'>
                          <div>
                            <span className='reviewer-name'>
                              <i className='fas fa-user-circle me-2'></i>
                              {review.name}
                            </span>
                            <div className='mt-1'>
                              <Rating value={review.rating} />
                            </div>
                          </div>
                          <span className='review-date'>
                            <i className='fas fa-calendar me-1'></i>
                            {new Date(review.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </span>
                        </div>
                        {review.comment && (
                          <p className='review-comment'>"{review.comment}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Write Review Section */}
                <div className='write-review-section'>
                  <h3 className='write-review-title'>
                    <i className='fas fa-edit me-2'></i>
                    Write a Review
                  </h3>

                  {successProductReview && (
                    <Message variant='success'>
                      <i className='fas fa-check-circle me-2'></i>
                      Review submitted successfully! Thank you for your
                      feedback.
                    </Message>
                  )}

                  {errorProductReview && (
                    <Message variant='danger'>
                      <i className='fas fa-exclamation-triangle me-2'></i>
                      {errorProductReview}
                    </Message>
                  )}

                  {userInfo ? (
                    <Form onSubmit={submitHandler}>
                      <div className='review-form-group'>
                        <label className='review-form-label' htmlFor='rating'>
                          <i className='fas fa-star me-2'></i>
                          Rating
                        </label>
                        <Form.Select
                          id='rating'
                          className='review-form-control'
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                        >
                          <option value=''>Select a rating...</option>
                          <option value='1'>1 - Poor</option>
                          <option value='2'>2 - Fair</option>
                          <option value='3'>3 - Good</option>
                          <option value='4'>4 - Very Good</option>
                          <option value='5'>5 - Excellent</option>
                        </Form.Select>
                      </div>

                      <div className='review-form-group'>
                        <label className='review-form-label' htmlFor='comment'>
                          <i className='fas fa-comment me-2'></i>
                          Your Review
                        </label>
                        <textarea
                          id='comment'
                          className='review-form-control review-textarea'
                          placeholder='Share your experience with this product...'
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </div>

                      <Button
                        type='submit'
                        className='submit-review-btn'
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <i className='fas fa-spinner fa-spin me-2'></i>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <i className='fas fa-paper-plane me-2'></i>
                            Submit Review
                          </>
                        )}
                      </Button>
                    </Form>
                  ) : (
                    <div className='login-prompt'>
                      <i className='fas fa-sign-in-alt me-2'></i>
                      Please{' '}
                      <Link to='/login' className='login-link'>
                        sign in
                      </Link>{' '}
                      to write a review
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </>
        )}
      </Container>
    </div>
  );
};

export default ProductScreen;
