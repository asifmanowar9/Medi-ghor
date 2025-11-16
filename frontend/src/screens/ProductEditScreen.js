import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form,
  Button,
  Row,
  Col,
  Card,
  InputGroup,
  Modal,
} from 'react-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  listProductDetails,
  updateProduct,
  createProduct,
} from '../actions/productActions';
import { listCategories, createCategory } from '../actions/categoryActions';
import {
  PRODUCT_UPDATE_RESET,
  PRODUCT_CREATE_RESET,
} from '../constants/productConstants';
import { CATEGORY_CREATE_RESET } from '../constants/categoryConstants';
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
  const [imageFile, setImageFile] = useState(null);

  // New Category Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#007bff');
  const [categorySuccess, setCategorySuccess] = useState('');

  // Popular medical/pharmacy icons for easy selection
  const popularIcons = [
    { class: 'fas fa-pills', name: 'Pills' },
    { class: 'fas fa-capsules', name: 'Capsules' },
    { class: 'fas fa-prescription-bottle', name: 'Prescription Bottle' },
    { class: 'fas fa-prescription-bottle-alt', name: 'Medicine Bottle' },
    { class: 'fas fa-syringe', name: 'Syringe' },
    { class: 'fas fa-thermometer', name: 'Thermometer' },
    { class: 'fas fa-stethoscope', name: 'Stethoscope' },
    { class: 'fas fa-heartbeat', name: 'Heartbeat' },
    { class: 'fas fa-heart', name: 'Heart' },
    { class: 'fas fa-eye', name: 'Eye Care' },
    { class: 'fas fa-tooth', name: 'Dental' },
    { class: 'fas fa-hand-holding-medical', name: 'Medical Care' },
    { class: 'fas fa-first-aid', name: 'First Aid' },
    { class: 'fas fa-band-aid', name: 'Band Aid' },
    { class: 'fas fa-virus', name: 'Virus/Infection' },
    { class: 'fas fa-dna', name: 'DNA/Genetics' },
    { class: 'fas fa-lungs', name: 'Respiratory' },
    { class: 'fas fa-brain', name: 'Neurological' },
    { class: 'fas fa-bone', name: 'Orthopedic' },
    { class: 'fas fa-baby', name: 'Pediatric' },
    { class: 'fas fa-female', name: 'Women Health' },
    { class: 'fas fa-male', name: 'Men Health' },
    { class: 'fas fa-leaf', name: 'Herbal/Natural' },
    { class: 'fas fa-flask', name: 'Laboratory' },
  ];

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

  const categoryCreate = useSelector((state) => state.categoryCreate);
  const {
    loading: loadingCategoryCreate,
    success: successCategoryCreate,
    category: createdCategory,
    error: errorCategoryCreate,
  } = categoryCreate;

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
  }, [dispatch, categories]);

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

  // Handle successful category creation
  useEffect(() => {
    if (successCategoryCreate && createdCategory) {
      // Add the new category to the category list and select it
      setCategory(createdCategory._id);
      setCategorySuccess(
        `Category "${createdCategory.name}" created successfully!`
      );
      setShowCategoryModal(false);
      // Reset form
      setNewCategoryName('');
      setNewCategoryDescription('');
      setNewCategoryIcon('');
      setNewCategoryColor('#007bff');
      // Reset category create state
      dispatch({ type: CATEGORY_CREATE_RESET });
      // Refresh categories list
      dispatch(listCategories());

      // Clear success message after 3 seconds
      setTimeout(() => setCategorySuccess(''), 3000);
    }
  }, [successCategoryCreate, createdCategory, dispatch]);

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
    if (!file) return;

    setImageFile(file);
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
      const { data } = await axios.post(
        '/api/upload/product',
        formData,
        config
      );
      setImage(data.image);
      setUploading(false);
    } catch (error) {
      setUploading(false);
      console.error(error);
      alert('Image upload failed. Please try again.');
    }
  };

  // Handler for image URL input
  const handleImageUrlChange = (e) => {
    setImage(e.target.value);
    // Clear file input if URL is being used
    if (e.target.value && imageFile) {
      setImageFile(null);
      // Reset file input
      const fileInput = document.getElementById('productImageFile');
      if (fileInput) fileInput.value = '';
    }
  };

  // Category Modal Functions
  const handleCategorySelectChange = (e) => {
    const value = e.target.value;
    if (value === 'add_new') {
      setShowCategoryModal(true);
    } else {
      setCategory(value);
    }
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      return;
    }

    const categoryData = {
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim(),
      icon: newCategoryIcon.trim(),
      color: newCategoryColor,
    };

    dispatch(createCategory(categoryData));
  };

  const handleCategoryModalClose = () => {
    setShowCategoryModal(false);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryIcon('');
    setNewCategoryColor('#007bff');
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
      {categorySuccess && (
        <Message variant='success'>{categorySuccess}</Message>
      )}

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
                    <span style={{ color: 'white' }}>
                      Product Name <span className='text-danger'>*</span>
                    </span>
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
                    <span style={{ color: 'white' }}>
                      Price (BDT) <span className='text-danger'>*</span>
                    </span>
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
                  <Form.Label className='fw-bold'>
                    <span style={{ color: 'white' }}>Generic Name</span>
                  </Form.Label>
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
                    <span style={{ color: 'white' }}>
                      Brand <span className='text-danger'>*</span>
                    </span>
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
                <span style={{ color: 'white' }}>
                  Description <span className='text-danger'>*</span>
                </span>
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
                    <span style={{ color: 'white' }}>
                      Category <span className='text-danger'>*</span>
                    </span>
                  </Form.Label>
                  <Form.Select
                    value={category}
                    onChange={handleCategorySelectChange}
                    required
                  >
                    <option value=''>Select a category...</option>
                    {categories &&
                      categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    <option
                      value='add_new'
                      style={{
                        borderTop: '1px solid #dee2e6',
                        fontWeight: 'bold',
                        color: '#007bff',
                      }}
                    >
                      + Add New Category
                    </option>
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
                  <Form.Label className='fw-bold'>
                    <span style={{ color: 'white' }}>Dosage Form</span>
                  </Form.Label>
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
                  <Form.Label className='fw-bold'>
                    <span style={{ color: 'white' }}>Strength</span>
                  </Form.Label>
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
                  <Form.Label className='fw-bold'>
                    <span style={{ color: 'white' }}>Manufacturer</span>
                  </Form.Label>
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
                  <Form.Label className='fw-bold'>
                    <span style={{ color: 'white' }}>Stock Quantity</span>
                  </Form.Label>
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
                  <Form.Label className='fw-bold'>
                    <span style={{ color: 'white' }}>Image URL</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter image URL or upload a file below'
                    value={image}
                    onChange={handleImageUrlChange}
                    disabled={uploading || imageFile}
                  />
                  {imageFile && (
                    <Form.Text className='text-warning'>
                      <i className='fas fa-info-circle me-1'></i>
                      File upload in progress. Clear the file to use URL.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className='fw-bold'>
                    <span style={{ color: 'white' }}>Or Upload File</span>
                  </Form.Label>
                  <Form.Control
                    type='file'
                    id='productImageFile'
                    onChange={uploadFileHandler}
                    accept='image/*'
                    disabled={uploading || (image && !imageFile)}
                  />
                  {uploading && (
                    <Form.Text className='text-muted'>
                      <i className='fas fa-spinner fa-spin me-1'></i>
                      Uploading...
                    </Form.Text>
                  )}
                  {image && !imageFile && (
                    <Form.Text className='text-warning d-block'>
                      <i className='fas fa-info-circle me-1'></i>
                      Clear URL to upload file.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Image Preview */}
            {image && (
              <Row className='mb-4'>
                <Col md={12}>
                  <div className='border rounded p-3 bg-light'>
                    <Form.Label className='fw-bold mb-2'>
                      Image Preview
                    </Form.Label>
                    <div className='d-flex align-items-center gap-3'>
                      <img
                        src={
                          image.startsWith('http')
                            ? image
                            : image.startsWith('/uploads')
                            ? image
                            : image.startsWith('/images')
                            ? image
                            : `/uploads/products/${image}`
                        }
                        alt='Product preview'
                        style={{
                          maxWidth: '150px',
                          maxHeight: '150px',
                          objectFit: 'contain',
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://via.placeholder.com/150?text=Invalid+Image';
                        }}
                      />
                      <div className='flex-grow-1'>
                        <p className='mb-1 text-muted small fw-bold'>
                          Image Location:
                        </p>
                        <div className='d-flex flex-column gap-1'>
                          {image.startsWith('http') ? (
                            <div>
                              <span className='badge bg-info me-2'>
                                External URL
                              </span>
                              <code className='small'>{image}</code>
                            </div>
                          ) : image.startsWith('/images') ? (
                            <div>
                              <span className='badge bg-secondary me-2'>
                                Static Asset
                              </span>
                              <code className='small'>{image}</code>
                            </div>
                          ) : image.startsWith('/uploads/products') ? (
                            <div>
                              <span className='badge bg-success me-2'>
                                Product Upload
                              </span>
                              <code className='small'>{image}</code>
                            </div>
                          ) : image.startsWith('/uploads') ? (
                            <div>
                              <span className='badge bg-warning me-2'>
                                General Upload
                              </span>
                              <code className='small'>{image}</code>
                            </div>
                          ) : (
                            <div>
                              <span className='badge bg-primary me-2'>
                                Filename Only
                              </span>
                              <code className='small'>
                                Will be saved to: /uploads/products/{image}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            )}

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

      {/* Add New Category Modal */}
      <Modal
        show={showCategoryModal}
        onHide={handleCategoryModalClose}
        centered
        className='category-modal'
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className='fas fa-plus-circle me-2 text-primary'></i>
            Create New Category
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCategorySubmit}>
          <Modal.Body>
            {errorCategoryCreate && (
              <Message variant='danger'>{errorCategoryCreate}</Message>
            )}

            <Form.Group className='mb-3'>
              <Form.Label className='fw-bold'>
                <span style={{ color: 'white' }}>Category Name</span>{' '}
                <span className='text-danger'>*</span>
              </Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter category name'
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label className='fw-bold'>
                <span style={{ color: 'white' }}>Description</span>
              </Form.Label>
              <Form.Control
                as='textarea'
                rows={2}
                placeholder='Enter category description (optional)'
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
              />
            </Form.Group>

            <Row>
              <Col md={9}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>
                    <span style={{ color: 'white' }}>Icon (Optional)</span>
                  </Form.Label>

                  {/* Selected Icon Display */}
                  {newCategoryIcon && (
                    <div className='mb-3 p-3 selected-icon-display text-center border rounded bg-light'>
                      <i
                        className={`${newCategoryIcon} fa-3x text-primary`}
                      ></i>
                      {/* <div className='small text-dark mt-2 fw-bold'>
                        Selected: {newCategoryIcon}
                      </div> */}
                    </div>
                  )}

                  {/* Icon Grid */}
                  <div
                    className='border rounded p-3 icon-selector-grid bg-white'
                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                  >
                    <div className='row g-3'>
                      {/* No Icon Option */}
                      <div className='col-6 col-sm-4 col-md-3'>
                        <button
                          type='button'
                          className={`btn w-100 d-flex flex-column align-items-center p-3 ${
                            newCategoryIcon === ''
                              ? 'btn-primary'
                              : 'btn-outline-dark'
                          }`}
                          onClick={() => setNewCategoryIcon('')}
                          title='No Icon'
                          style={{
                            minHeight: '90px',
                            transition: 'all 0.2s ease',
                            border: '2px solid #dee2e6',
                          }}
                          onMouseEnter={(e) => {
                            if (newCategoryIcon !== '') {
                              e.target.style.backgroundColor = '#f8f9fa';
                              e.target.style.borderColor = '#6c757d';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (newCategoryIcon !== '') {
                              e.target.style.backgroundColor = '';
                              e.target.style.borderColor = '#dee2e6';
                            }
                          }}
                        >
                          <i
                            className='fas fa-ban mb-2'
                            style={{
                              fontSize: '1.8rem',
                              color:
                                newCategoryIcon === '' ? '#fff' : '#6c757d',
                            }}
                          ></i>
                          <small
                            style={{
                              fontSize: '0.75rem',
                              lineHeight: '1.2',
                              textAlign: 'center',
                              fontWeight: '500',
                              color:
                                newCategoryIcon === '' ? '#fff' : '#495057',
                            }}
                          >
                            No Icon
                          </small>
                        </button>
                      </div>
                      {popularIcons.map((icon, index) => (
                        <div key={index} className='col-6 col-sm-4 col-md-3'>
                          <button
                            type='button'
                            className={`btn w-100 d-flex flex-column align-items-center p-3 ${
                              newCategoryIcon === icon.class
                                ? 'btn-primary'
                                : 'btn-outline-dark'
                            }`}
                            onClick={() => setNewCategoryIcon(icon.class)}
                            title={icon.name}
                            style={{
                              minHeight: '90px',
                              transition: 'all 0.2s ease',
                              border: '2px solid #dee2e6',
                            }}
                            onMouseEnter={(e) => {
                              if (newCategoryIcon !== icon.class) {
                                e.target.style.backgroundColor = '#f8f9fa';
                                e.target.style.borderColor = '#6c757d';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (newCategoryIcon !== icon.class) {
                                e.target.style.backgroundColor = '';
                                e.target.style.borderColor = '#dee2e6';
                              }
                            }}
                          >
                            <i
                              className={`${icon.class} mb-2`}
                              style={{
                                fontSize: '1.8rem',
                                color:
                                  newCategoryIcon === icon.class
                                    ? '#fff'
                                    : '#495057',
                              }}
                            ></i>
                            <small
                              style={{
                                fontSize: '0.75rem',
                                lineHeight: '1.2',
                                textAlign: 'center',
                                fontWeight: '500',
                                color:
                                  newCategoryIcon === icon.class
                                    ? '#fff'
                                    : '#495057',
                              }}
                            >
                              {icon.name}
                            </small>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Form.Text className='text-muted mt-2'>
                    Choose an icon from the grid above or select "No Icon"
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className='mb-3'>
                  <Form.Label className='fw-bold'>
                    <span style={{ color: 'white' }}>Color</span>
                  </Form.Label>
                  <Form.Control
                    type='color'
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    style={{ height: '50px' }}
                  />
                  <Form.Text className='text-muted mt-2'>
                    Category theme color
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleCategoryModalClose}>
              Cancel
            </Button>
            <Button
              type='submit'
              variant='primary'
              disabled={loadingCategoryCreate || !newCategoryName.trim()}
            >
              {loadingCategoryCreate ? (
                <>
                  <i className='fas fa-spinner fa-spin me-2'></i>
                  Creating...
                </>
              ) : (
                <>
                  <i className='fas fa-plus me-2'></i>
                  Create Category
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductEditScreen;
