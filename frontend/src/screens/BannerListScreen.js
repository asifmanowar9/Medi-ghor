import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Row,
  Col,
  Card,
  Badge,
  InputGroup,
  Form,
  Container,
  Dropdown,
  Modal,
  Image,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  listBannersAdmin,
  deleteBanner,
  createBanner,
  updateBanner,
} from '../actions/bannerActions';
import {
  BANNER_CREATE_RESET,
  BANNER_UPDATE_RESET,
  BANNER_DELETE_RESET,
} from '../constants/bannerConstants';
import './BannerListScreen.css';

const BannerListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    buttonText: '',
    link: '',
    badge: '',
    bgColor: '#3498db',
    isActive: true,
    order: 0,
  });

  const bannerAdminList = useSelector((state) => state.bannerAdminList);
  const { loading, error, banners } = bannerAdminList;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const bannerCreate = useSelector((state) => state.bannerCreate);
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
  } = bannerCreate;

  const bannerUpdate = useSelector((state) => state.bannerUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = bannerUpdate;

  const bannerDelete = useSelector((state) => state.bannerDelete);
  const {
    loading: loadingDelete,
    error: errorDelete,
    success: successDelete,
  } = bannerDelete;

  useEffect(() => {
    if (
      !userInfo ||
      (!userInfo.isAdmin &&
        userInfo.role !== 'super_admin' &&
        userInfo.role !== 'operator')
    ) {
      navigate('/login');
    } else {
      dispatch(listBannersAdmin());
    }
  }, [dispatch, navigate, userInfo]);

  useEffect(() => {
    if (successCreate) {
      dispatch({ type: BANNER_CREATE_RESET });
      setShowCreateModal(false);
      resetForm();
      dispatch(listBannersAdmin());
    }
  }, [dispatch, successCreate]);

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: BANNER_UPDATE_RESET });
      setShowEditModal(false);
      resetForm();
      dispatch(listBannersAdmin());
    }
  }, [dispatch, successUpdate]);

  useEffect(() => {
    if (successDelete) {
      setShowDeleteModal(false);
      dispatch(listBannersAdmin());
    }
  }, [dispatch, successDelete]);

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      buttonText: '',
      link: '',
      badge: '',
      bgColor: '#3498db',
      isActive: true,
      order: 0,
    });
    setSelectedBanner(null);
  };

  const handleCreateBanner = () => {
    setShowCreateModal(true);
    resetForm();
  };

  const handleEditBanner = (banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      image: banner.image,
      buttonText: banner.buttonText,
      link: banner.link,
      badge: banner.badge,
      bgColor: banner.bgColor,
      isActive: banner.isActive,
      order: banner.order,
    });
    setShowEditModal(true);
  };

  const handleDeleteBanner = (banner) => {
    setSelectedBanner(banner);
    setShowDeleteModal(true);
  };

  const submitCreateHandler = (e) => {
    e.preventDefault();
    dispatch(createBanner(formData));
  };

  const submitUpdateHandler = (e) => {
    e.preventDefault();
    dispatch(updateBanner(selectedBanner._id, formData));
  };

  const confirmDeleteHandler = () => {
    dispatch(deleteBanner(selectedBanner._id));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Filter and sort banners
  const getFilteredAndSortedBanners = () => {
    if (!banners) return [];

    let filtered = banners.filter((banner) => {
      const matchesSearch =
        banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesActive =
        filterActive === '' ||
        (filterActive === 'active' && banner.isActive) ||
        (filterActive === 'inactive' && !banner.isActive);

      return matchesSearch && matchesActive;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredBanners = getFilteredAndSortedBanners();

  if (loading) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  }

  return (
    <div className='banner-list-screen'>
      <Container fluid>
        {/* Header Section */}
        <div className='screen-header'>
          <Row className='align-items-center mb-4'>
            <Col>
              <h1 className='screen-title'>
                <i className='fas fa-images me-3'></i>
                Banner Management
              </h1>
              <p className='screen-subtitle'>
                Manage website banners and promotional content
              </p>
            </Col>
            <Col xs='auto'>
              <Button
                variant='primary'
                onClick={handleCreateBanner}
                className='create-btn'
              >
                <i className='fas fa-plus me-2'></i>
                Create Banner
              </Button>
            </Col>
          </Row>
        </div>

        {/* Filters and Search */}
        <Card className='filters-card mb-4'>
          <Card.Body>
            <Row className='align-items-center'>
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <i className='fas fa-search'></i>
                  </InputGroup.Text>
                  <Form.Control
                    type='text'
                    placeholder='Search banners...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                >
                  <option value=''>All Status</option>
                  <option value='active'>Active</option>
                  <option value='inactive'>Inactive</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value='order'>Order</option>
                  <option value='title'>Title</option>
                  <option value='createdAt'>Created Date</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value='asc'>Ascending</option>
                  <option value='desc'>Descending</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <div className='view-mode-toggle'>
                  <Button
                    variant={
                      viewMode === 'grid' ? 'primary' : 'outline-primary'
                    }
                    size='sm'
                    onClick={() => setViewMode('grid')}
                  >
                    <i className='fas fa-th'></i>
                  </Button>
                  <Button
                    variant={
                      viewMode === 'list' ? 'primary' : 'outline-primary'
                    }
                    size='sm'
                    onClick={() => setViewMode('list')}
                    className='ms-2'
                  >
                    <i className='fas fa-list'></i>
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Error Messages */}
        {error && <Message variant='danger'>{error}</Message>}
        {errorCreate && <Message variant='danger'>{errorCreate}</Message>}
        {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
        {errorDelete && <Message variant='danger'>{errorDelete}</Message>}

        {/* Banners Display */}
        {viewMode === 'grid' ? (
          <Row>
            {filteredBanners.map((banner) => (
              <Col key={banner._id} xl={4} lg={6} md={6} className='mb-4'>
                <Card className='banner-card h-100'>
                  <div className='banner-image-container'>
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      className='banner-image'
                    />
                    <div className='banner-overlay'>
                      <Badge
                        bg={banner.isActive ? 'success' : 'secondary'}
                        className='status-badge'
                      >
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge bg='info' className='order-badge'>
                        Order: {banner.order}
                      </Badge>
                    </div>
                  </div>
                  <Card.Body>
                    <div className='d-flex justify-content-between align-items-start mb-2'>
                      <h5 className='banner-title'>{banner.title}</h5>
                      <Dropdown>
                        <Dropdown.Toggle variant='outline-secondary' size='sm'>
                          <i className='fas fa-ellipsis-v'></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => handleEditBanner(banner)}
                          >
                            <i className='fas fa-edit me-2'></i>Edit
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleDeleteBanner(banner)}
                            className='text-danger'
                          >
                            <i className='fas fa-trash me-2'></i>Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    <p className='banner-subtitle text-muted'>
                      {banner.subtitle}
                    </p>
                    <p className='banner-description'>{banner.description}</p>
                    <div className='banner-meta'>
                      <small className='text-muted'>
                        <i className='fas fa-tag me-1'></i>
                        {banner.badge}
                      </small>
                      <br />
                      <small className='text-muted'>
                        <i className='fas fa-link me-1'></i>
                        {banner.buttonText}
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card>
            <Card.Body className='p-0'>
              <div className='table-responsive'>
                <table className='table table-hover mb-0'>
                  <thead className='table-dark'>
                    <tr>
                      <th>Banner</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Order</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBanners.map((banner) => (
                      <tr key={banner._id}>
                        <td>
                          <Image
                            src={banner.image}
                            alt={banner.title}
                            width='60'
                            height='40'
                            className='rounded'
                            style={{ objectFit: 'cover' }}
                          />
                        </td>
                        <td>
                          <div>
                            <strong>{banner.title}</strong>
                            <br />
                            <small className='text-muted'>
                              {banner.subtitle}
                            </small>
                          </div>
                        </td>
                        <td>
                          <Badge bg={banner.isActive ? 'success' : 'secondary'}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>{banner.order}</td>
                        <td>
                          <small className='text-muted'>
                            {new Date(banner.createdAt).toLocaleDateString()}
                          </small>
                        </td>
                        <td>
                          <Button
                            variant='outline-primary'
                            size='sm'
                            className='me-2'
                            onClick={() => handleEditBanner(banner)}
                          >
                            <i className='fas fa-edit'></i>
                          </Button>
                          <Button
                            variant='outline-danger'
                            size='sm'
                            onClick={() => handleDeleteBanner(banner)}
                          >
                            <i className='fas fa-trash'></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Create Banner Modal */}
        <Modal
          show={showCreateModal}
          onHide={() => setShowCreateModal(false)}
          size='lg'
          className='banner-modal'
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <i className='fas fa-plus me-2'></i>
              Create New Banner
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={submitCreateHandler}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type='text'
                      name='title'
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Subtitle</Form.Label>
                    <Form.Control
                      type='text'
                      name='subtitle'
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className='mb-3'>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={3}
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Image URL</Form.Label>
                    <Form.Control
                      type='url'
                      name='image'
                      value={formData.image}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Button Text</Form.Label>
                    <Form.Control
                      type='text'
                      name='buttonText'
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Link URL</Form.Label>
                    <Form.Control
                      type='text'
                      name='link'
                      value={formData.link}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Badge Text</Form.Label>
                    <Form.Control
                      type='text'
                      name='badge'
                      value={formData.badge}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Background Color</Form.Label>
                    <Form.Control
                      type='color'
                      name='bgColor'
                      value={formData.bgColor}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Order</Form.Label>
                    <Form.Control
                      type='number'
                      name='order'
                      value={formData.order}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className='mb-3'>
                    <Form.Check
                      type='checkbox'
                      name='isActive'
                      label='Active'
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className='mt-4'
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant='secondary'
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button variant='primary' type='submit' disabled={loadingCreate}>
                {loadingCreate ? <Loader /> : 'Create Banner'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Edit Banner Modal */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          size='lg'
          className='banner-modal'
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <i className='fas fa-edit me-2'></i>
              Edit Banner
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={submitUpdateHandler}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type='text'
                      name='title'
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Subtitle</Form.Label>
                    <Form.Control
                      type='text'
                      name='subtitle'
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className='mb-3'>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={3}
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Image URL</Form.Label>
                    <Form.Control
                      type='url'
                      name='image'
                      value={formData.image}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Button Text</Form.Label>
                    <Form.Control
                      type='text'
                      name='buttonText'
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Link URL</Form.Label>
                    <Form.Control
                      type='text'
                      name='link'
                      value={formData.link}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Badge Text</Form.Label>
                    <Form.Control
                      type='text'
                      name='badge'
                      value={formData.badge}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Background Color</Form.Label>
                    <Form.Control
                      type='color'
                      name='bgColor'
                      value={formData.bgColor}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className='mb-3'>
                    <Form.Label>Order</Form.Label>
                    <Form.Control
                      type='number'
                      name='order'
                      value={formData.order}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className='mb-3'>
                    <Form.Check
                      type='checkbox'
                      name='isActive'
                      label='Active'
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className='mt-4'
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant='secondary'
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button variant='primary' type='submit' disabled={loadingUpdate}>
                {loadingUpdate ? <Loader /> : 'Update Banner'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          className='banner-modal'
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <i className='fas fa-exclamation-triangle me-2 text-warning'></i>
              Confirm Delete
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this banner?</p>
            {selectedBanner && (
              <div className='alert alert-warning'>
                <strong>{selectedBanner.title}</strong>
                <br />
                <small>{selectedBanner.subtitle}</small>
              </div>
            )}
            <p className='text-danger'>
              <strong>This action cannot be undone.</strong>
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='secondary'
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant='danger'
              onClick={confirmDeleteHandler}
              disabled={loadingDelete}
            >
              {loadingDelete ? <Loader /> : 'Delete Banner'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default BannerListScreen;
