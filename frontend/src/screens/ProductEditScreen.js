import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Row, Col, Card, InputGroup } from 'react-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import {
  listProductDetails,
  updateProduct,
  createProduct,
} from '../actions/productActions';
import { listCategories } from '../actions/categoryActions';
import {
  PRODUCT_UPDATE_RESET,
  PRODUCT_CREATE_RESET,
} from '../constants/productConstants';
import '../styles/ProductEditScreen.css';

const ProductEditScreen = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [genericName, setGenericName] = useState('');
  const [dosageForm, setDosageForm] = useState('');
  const [strength, setStrength] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productId } = useParams();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, product, error } = productDetails;

  const productUpdate = useSelector((state) => state.productUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = productUpdate;

  const productCreate = useSelector((state) => state.productCreate);
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
    product: createdProduct,
  } = productCreate;

  const categoryList = useSelector((state) => state.categoryList);
  const { categories, loading: loadingCategories } = categoryList;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // Check if this is a new product creation
  const isNewProduct = productId === 'new';

  console.log('ProductEditScreen render:', {
    productId,
    isNewProduct,
    successCreate,
    successUpdate,
    userInfo: !!userInfo,
  });

  // Load categories once on mount
  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(listCategories());
    }
  }, [dispatch]);

  // Handle authentication
  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  // Handle successful operations
  useEffect(() => {
    if (successCreate && createdProduct) {
      dispatch({ type: PRODUCT_CREATE_RESET });
      navigate('/admin/productlist');
    }
  }, [successCreate, createdProduct, dispatch, navigate]);

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: PRODUCT_UPDATE_RESET });
      navigate('/admin/productlist');
    }
  }, [successUpdate, dispatch, navigate]);

  // Handle product loading for edit mode
  useEffect(() => {
    if (isNewProduct) {
      // Clear any existing state for new products
      dispatch({ type: PRODUCT_CREATE_RESET });
      return;
    }

    // Handle errors
    if (error) {
      navigate('/admin/productlist');
      return;
    }

    // Load product for editing
    if (!product || product._id !== productId) {
      dispatch(listProductDetails(productId));
    } else if (product && product._id === productId) {
      setName(product.name);
      setPrice(product.price);
      setDescription(product.description);
      setImage(product.image);
      setBrand(product.brand);
      setCategory(product.category?._id || product.category);
      setCountInStock(product.countInStock);
      setGenericName(product.genericName || '');
      setDosageForm(product.dosageForm || '');
      setStrength(product.strength || '');
      setManufacturer(product.manufacturer || '');
      setPrescriptionRequired(product.prescriptionRequired || false);
      setIsActive(product.isActive !== undefined ? product.isActive : true);
      setIsFeatured(product.isFeatured || false);
    }
  }, [isNewProduct, productId, product, error, dispatch, navigate]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      setImage(data.image);
      setUploading(false);
    } catch (error) {
      setUploading(false);
      console.error(error);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (isNewProduct) {
      // Create new product
      dispatch(
        createProduct({
          name,
          price,
          description,
          image,
          brand,
          category,
          countInStock,
          genericName,
          dosageForm,
          strength,
          manufacturer,
          prescriptionRequired,
          isActive,
          isFeatured,
        })
      );
    } else {
      // Update existing product
      dispatch(
        updateProduct({
          _id: productId,
          name,
          price,
          description,
          image,
          brand,
          category,
          countInStock,
          genericName,
          dosageForm,
          strength,
          manufacturer,
          prescriptionRequired,
          isActive,
          isFeatured,
        })
      );
    }
  };

  // Explicit handler for the "Go Back" button
  // const goBackHandler = () => {
  //   navigate('/admin/productlist');
  // };

  return (
    <div className='admin-product-form'>
      {/* Header */}
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <div>
          <Link to='/admin/productlist' className='btn btn-outline-secondary'>
            <i className='fas fa-arrow-left me-2'></i>
            Back to Products
          </Link>
        </div>
        <div>
          <h2 className='mb-0'>
            <i
              className={`fas ${
                isNewProduct ? 'fa-plus' : 'fa-edit'
              } me-2 text-primary`}
            ></i>
            {isNewProduct ? 'Create New Product' : 'Edit Product'}
          </h2>
        </div>
        <div style={{ width: '150px' }}></div> {/* Spacer for alignment */}
      </div>

      {/* Loading and Error Messages */}
      {(loadingUpdate || loadingCreate) && <Loader />}
      {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
      {errorCreate && <Message variant='danger'>{errorCreate}</Message>}
      {!isNewProduct && loading && <Loader />}
      {error && !isNewProduct && <Message variant='danger'>{error}</Message>}

      {/* Main Form */}
      <Card className='shadow-sm'>
        <Card.Body className='p-4'>
          <Form onSubmit={submitHandler}>
            {/* Basic Information Section */}
            <Row>
              <Col>
                <h5 className='text-primary mb-3'>
                  <i className='fas fa-info-circle me-2'></i>
                  Basic Information
                </h5>
              </Col>
            </Row>

            <Row className='mb-3'>
              <Col md={8}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>
                    Product Name <span className='text-danger'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter product name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className='form-control-lg'
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>
                    Price (BDT) <span className='text-danger'>*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>৳</InputGroup.Text>
                    <Form.Control
                      type='number'
                      placeholder='0.00'
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min='0'
                      step='0.01'
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Row className='mb-3'>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>Generic Name</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter generic name'
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>
                    Brand <span className='text-danger'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter brand name'
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-4'>
              <Form.Label className='fw-bold'>
                Description <span className='text-danger'>*</span>
              </Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                placeholder='Enter product description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>

            {/* Medical Information Section */}
            <Row>
              <Col>
                <h5 className='text-primary mb-3'>
                  <i className='fas fa-pills me-2'></i>
                  Medical Information
                </h5>
              </Col>
            </Row>

            <Row className='mb-3'>
              <Col md={4}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>
                    Category <span className='text-danger'>*</span>
                  </Form.Label>
                  <Form.Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value=''>Select a category...</option>
                    {categories &&
                      categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </Form.Select>
                  {loadingCategories && (
                    <Form.Text className='text-muted'>
                      <i className='fas fa-spinner fa-spin me-1'></i>
                      Loading categories...
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>Dosage Form</Form.Label>
                  <Form.Select
                    value={dosageForm}
                    onChange={(e) => setDosageForm(e.target.value)}
                  >
                    <option value=''>Select dosage form...</option>
                    <option value='Tablet'>Tablet</option>
                    <option value='Capsule'>Capsule</option>
                    <option value='Syrup'>Syrup</option>
                    <option value='Injection'>Injection</option>
                    <option value='Cream'>Cream</option>
                    <option value='Ointment'>Ointment</option>
                    <option value='Drop'>Drop</option>
                    <option value='Powder'>Powder</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>Strength</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='e.g., 500mg, 10ml'
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className='mb-4'>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>Manufacturer</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter manufacturer name'
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>Stock Quantity</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='Enter stock quantity'
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                    min='0'
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Image Upload Section */}
            <Row>
              <Col>
                <h5 className='text-primary mb-3'>
                  <i className='fas fa-image me-2'></i>
                  Product Image
                </h5>
              </Col>
            </Row>

            <Row className='mb-4'>
              <Col md={8}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>Image URL</Form.Label>
                  <Form.Control
                    type='url'
                    placeholder='Enter image URL'
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className='fw-bold'>Or Upload File</Form.Label>
                  <Form.Control type='file' onChange={uploadFileHandler} />
                  {uploading && (
                    <Form.Text className='text-muted'>
                      <i className='fas fa-spinner fa-spin me-1'></i>
                      Uploading...
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Settings Section */}
            <Row>
              <Col>
                <h5 className='text-primary mb-3'>
                  <i className='fas fa-cog me-2'></i>
                  Product Settings
                </h5>
              </Col>
            </Row>

            <Row className='mb-4'>
              <Col md={4}>
                <Form.Check
                  type='switch'
                  id='prescriptionRequired'
                  label='Prescription Required'
                  checked={prescriptionRequired}
                  onChange={(e) => setPrescriptionRequired(e.target.checked)}
                />
              </Col>
              <Col md={4}>
                <Form.Check
                  type='switch'
                  id='isActive'
                  label='Active Product'
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              </Col>
              <Col md={4}>
                <Form.Check
                  type='switch'
                  id='isFeatured'
                  label='Featured Product'
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
              </Col>
            </Row>

            {/* Action Buttons */}
            <hr />
            <Row>
              <Col className='d-flex justify-content-end gap-2'>
                <Button
                  type='button'
                  variant='outline-secondary'
                  onClick={() => navigate('/admin/productlist')}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  disabled={loadingCreate || loadingUpdate}
                  className='px-4'
                >
                  {loadingCreate || loadingUpdate ? (
                    <>
                      <i className='fas fa-spinner fa-spin me-2'></i>
                      {isNewProduct ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      <i
                        className={`fas ${
                          isNewProduct ? 'fa-plus' : 'fa-save'
                        } me-2`}
                      ></i>
                      {isNewProduct ? 'Create Product' : 'Update Product'}
                    </>
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductEditScreen;
