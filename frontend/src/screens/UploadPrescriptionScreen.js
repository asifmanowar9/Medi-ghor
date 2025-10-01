import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  InputGroup,
  Badge,
  ProgressBar,
  Image,
  ListGroup,
} from 'react-bootstrap';
import {
  createPrescription,
  uploadPrescriptionImage,
} from '../actions/prescriptionActions';
import {
  PRESCRIPTION_CREATE_RESET,
  PRESCRIPTION_UPLOAD_RESET,
} from '../constants/prescriptionConstants';
import Message from '../components/Message';
import Loader from '../components/Loader';
import '../styles/UploadPrescriptionScreen.css';

const UploadPrescriptionScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '' },
  ]);

  // UI states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  // Redux states
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const prescriptionCreate = useSelector((state) => state.prescriptionCreate);
  const { loading, error, success, prescription } = prescriptionCreate;

  const prescriptionUpload = useSelector((state) => state.prescriptionUpload);
  const {
    loading: uploadLoading,
    error: uploadError,
    success: uploadSuccess,
    uploadResult,
  } = prescriptionUpload;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }

    if (success) {
      navigate('/profile?tab=prescriptions');
      dispatch({ type: PRESCRIPTION_CREATE_RESET });
    }
  }, [userInfo, navigate, success, dispatch]);

  useEffect(() => {
    if (uploadSuccess && uploadResult) {
      setUploadedImageUrl(uploadResult.image);
      setIsUploading(false);
      setUploadProgress(100);
      dispatch({ type: PRESCRIPTION_UPLOAD_RESET });
    }
  }, [uploadSuccess, uploadResult, dispatch]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrors({
        ...errors,
        file: 'Please select a valid image file (JPEG, PNG, GIF, WEBP) or PDF',
      });
      return;
    }

    // Validate file size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      setErrors({
        ...errors,
        file: 'File size must be less than 15MB',
      });
      return;
    }

    setSelectedFile(file);
    setErrors({ ...errors, file: '' });

    // Create preview for images only
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl('');
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      setErrors({ ...errors, file: 'Please select a file first' });
      return;
    }

    console.log('Starting image upload...', selectedFile);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('Dispatching upload action...');
      const result = await dispatch(uploadPrescriptionImage(selectedFile));
      console.log('Upload result:', result);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      console.error('Upload failed:', error);
    }
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', frequency: '', duration: '' },
    ]);
  };

  const removeMedication = (index) => {
    if (medications.length > 1) {
      const newMedications = medications.filter((_, i) => i !== index);
      setMedications(newMedications);
    }
  };

  const updateMedication = (index, field, value) => {
    const newMedications = [...medications];
    newMedications[index][field] = value;
    setMedications(newMedications);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!uploadedImageUrl)
      newErrors.image = 'Please upload a prescription image';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const prescriptionData = {
      title: title.trim(),
      description: description.trim(),
      image: uploadedImageUrl,
      medications: medications.filter((med) => med.name.trim()),
    };

    dispatch(createPrescription(prescriptionData));
  };

  return (
    <Container className='upload-prescription-screen py-4'>
      <Row className='justify-content-center'>
        <Col lg={8} md={10}>
          {/* Page Header */}
          <Card className='header-card mb-4 border-0 shadow-lg'>
            <Card.Body
              className='text-center py-4'
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '15px',
              }}
            >
              <h2 className='text-white mb-2'>
                <i className='fas fa-prescription-bottle-medical me-3'></i>
                Upload Prescription
              </h2>
              <p className='text-white-50 mb-0'>
                Upload and manage your medical prescriptions securely
              </p>
            </Card.Body>
          </Card>

          {/* Error and Success Messages */}
          {error && <Message variant='danger'>{error}</Message>}
          {uploadError && <Message variant='danger'>{uploadError}</Message>}

          <Form onSubmit={submitHandler}>
            {/* File Upload Section */}
            <Card className='mb-4 border-0 shadow-sm'>
              <Card.Header
                style={{
                  background: 'linear-gradient(135deg, #2c3e50, #34495e)',
                  borderRadius: '15px 15px 0 0',
                }}
              >
                <h5 className='text-white mb-0'>
                  <i className='fas fa-upload me-2'></i>
                  Upload Prescription Image/PDF
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className='mb-3'>
                      <Form.Label className='fw-bold text-white'>
                        <i className='fas fa-file-medical me-2'></i>
                        Select File
                      </Form.Label>
                      <Form.Control
                        type='file'
                        accept='image/*,.pdf'
                        onChange={handleFileSelect}
                        isInvalid={!!errors.file}
                      />
                      <Form.Control.Feedback type='invalid'>
                        {errors.file}
                      </Form.Control.Feedback>
                      <Form.Text className='text-muted'>
                        Supported formats: JPEG, PNG, GIF, WEBP, PDF (Max 15MB)
                      </Form.Text>
                    </Form.Group>

                    {selectedFile && (
                      <div className='mb-3'>
                        <Badge bg='info' className='mb-2'>
                          <i className='fas fa-file me-1'></i>
                          {selectedFile.name}
                        </Badge>
                        <br />
                        <Badge bg='secondary'>
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>
                    )}

                    {selectedFile && !uploadedImageUrl && (
                      <Button
                        variant='primary'
                        onClick={handleUploadImage}
                        disabled={isUploading}
                        className='w-100'
                      >
                        {isUploading ? (
                          <>
                            <i className='fas fa-spinner fa-spin me-2'></i>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <i className='fas fa-cloud-upload-alt me-2'></i>
                            Upload File
                          </>
                        )}
                      </Button>
                    )}

                    {isUploading && (
                      <ProgressBar
                        now={uploadProgress}
                        label={`${uploadProgress}%`}
                        className='mt-2'
                        striped
                        animated
                      />
                    )}

                    {uploadedImageUrl && (
                      <Alert variant='success' className='mt-2'>
                        <i className='fas fa-check-circle me-2'></i>
                        File uploaded successfully!
                      </Alert>
                    )}
                  </Col>

                  <Col md={6}>
                    {previewUrl && (
                      <div className='text-center'>
                        <Form.Label className='fw-bold text-white'>
                          Preview
                        </Form.Label>
                        <Image
                          src={previewUrl}
                          alt='Prescription preview'
                          fluid
                          rounded
                          style={{ maxHeight: '300px', objectFit: 'contain' }}
                        />
                      </div>
                    )}
                    {selectedFile &&
                      selectedFile.type === 'application/pdf' && (
                        <div className='text-center p-4 bg-light rounded'>
                          <i className='fas fa-file-pdf fa-3x text-danger mb-2'></i>
                          <p className='mb-0'>PDF file selected</p>
                          <small className='text-muted'>
                            {selectedFile.name}
                          </small>
                        </div>
                      )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Basic Information */}
            <Card className='mb-4 border-0 shadow-sm'>
              <Card.Header
                style={{
                  background: 'linear-gradient(135deg, #2c3e50, #34495e)',
                  borderRadius: '15px 15px 0 0',
                }}
              >
                <h5 className='text-white mb-0'>
                  <i className='fas fa-info-circle me-2'></i>
                  Basic Information
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <Form.Group className='mb-3'>
                      <Form.Label className='fw-bold text-white'>
                        <i className='fas fa-tag me-2'></i>
                        Title *
                      </Form.Label>
                      <Form.Control
                        type='text'
                        placeholder='e.g., Cold & Flu Treatment - Dr. Smith'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        isInvalid={!!errors.title}
                      />
                      <Form.Control.Feedback type='invalid'>
                        {errors.title}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group className='mb-3'>
                      <Form.Label className='fw-bold text-white'>
                        <i className='fas fa-file-alt me-2'></i>
                        Description
                      </Form.Label>
                      <Form.Control
                        as='textarea'
                        rows={3}
                        placeholder='Brief description of the prescription...'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Medications Section */}
            <Card className='mb-4 border-0 shadow-sm'>
              <Card.Header
                className='d-flex justify-content-between align-items-center'
                style={{
                  background: 'linear-gradient(135deg, #2c3e50, #34495e)',
                  borderRadius: '15px 15px 0 0',
                }}
              >
                <h5 className='text-white mb-0'>
                  <i className='fas fa-pills me-2'></i>
                  Medications (Optional)
                </h5>
                <Button
                  variant='outline-light'
                  size='sm'
                  onClick={addMedication}
                >
                  <i className='fas fa-plus me-1'></i>
                  Add Medication
                </Button>
              </Card.Header>
              <Card.Body>
                {medications.map((med, index) => (
                  <Card key={index} className='mb-3 border'>
                    <Card.Body>
                      <div className='d-flex justify-content-between align-items-center mb-3'>
                        <h6 className='mb-0'>
                          <i className='fas fa-prescription-bottle me-2'></i>
                          Medication {index + 1}
                        </h6>
                        {medications.length > 1 && (
                          <Button
                            variant='outline-danger'
                            size='sm'
                            onClick={() => removeMedication(index)}
                          >
                            <i className='fas fa-trash'></i>
                          </Button>
                        )}
                      </div>
                      <Row>
                        <Col md={6}>
                          <Form.Group className='mb-3'>
                            <Form.Label>Medicine Name</Form.Label>
                            <Form.Control
                              type='text'
                              placeholder='e.g., Paracetamol'
                              value={med.name}
                              onChange={(e) =>
                                updateMedication(index, 'name', e.target.value)
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className='mb-3'>
                            <Form.Label>Dosage</Form.Label>
                            <Form.Control
                              type='text'
                              placeholder='e.g., 500mg'
                              value={med.dosage}
                              onChange={(e) =>
                                updateMedication(
                                  index,
                                  'dosage',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className='mb-3'>
                            <Form.Label>Frequency</Form.Label>
                            <Form.Control
                              type='text'
                              placeholder='e.g., 3 times daily'
                              value={med.frequency}
                              onChange={(e) =>
                                updateMedication(
                                  index,
                                  'frequency',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className='mb-3'>
                            <Form.Label>Duration</Form.Label>
                            <Form.Control
                              type='text'
                              placeholder='e.g., 7 days'
                              value={med.duration}
                              onChange={(e) =>
                                updateMedication(
                                  index,
                                  'duration',
                                  e.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>

            {/* Action Buttons */}
            <Card className='border-0 shadow-sm'>
              <Card.Body>
                <div className='d-flex justify-content-between'>
                  <Button
                    variant='outline-secondary'
                    onClick={() => navigate('/profile?tab=prescriptions')}
                    disabled={loading || uploadLoading}
                  >
                    <i className='fas fa-arrow-left me-2'></i>
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    variant='primary'
                    disabled={loading || uploadLoading || !uploadedImageUrl}
                    style={{
                      background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                    }}
                  >
                    {loading ? (
                      <>
                        <i className='fas fa-spinner fa-spin me-2'></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className='fas fa-save me-2'></i>
                        Save Prescription
                      </>
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default UploadPrescriptionScreen;
