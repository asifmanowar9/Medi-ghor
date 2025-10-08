import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { listBanners } from '../actions/bannerActions';
import '../styles/HeroBanner.css';

const HeroBanner = () => {
  const dispatch = useDispatch();
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerList = useSelector((state) => state.bannerList);
  const { loading, error, banners } = bannerList;

  const offers = [
    {
      icon: 'fas fa-shipping-fast',
      title: 'ফ্রি ডেলিভারি',
      subtitle: '৫০০ টাকার উপরে অর্ডারে',
    },
    {
      icon: 'fas fa-shield-check',
      title: '১০০% অথেনটিক',
      subtitle: 'সকল ঔষধ লাইসেন্সপ্রাপ্ত',
    },
    {
      icon: 'fas fa-headset',
      title: '২৪/৭ সাপোর্ট',
      subtitle: 'যেকোনো সময় যোগাযোগ করুন',
    },
    {
      icon: 'fas fa-undo',
      title: 'সহজ রিটার্ন',
      subtitle: '৭ দিনের মধ্যে ফেরত',
    },
  ];

  useEffect(() => {
    dispatch(listBanners());
  }, [dispatch]);

  useEffect(() => {
    // Total slides = banners length
    const totalSlides = banners && banners.length > 0 ? banners.length : 1;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners]);

  const nextSlide = () => {
    const totalSlides = banners && banners.length > 0 ? banners.length : 1;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    const totalSlides = banners && banners.length > 0 ? banners.length : 1;
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  if (loading) {
    return (
      <section
        className='hero-banner d-flex align-items-center justify-content-center'
        style={{ minHeight: '400px' }}
      >
        <Spinner animation='border' variant='primary' />
      </section>
    );
  }

  if (error) {
    return (
      <section className='hero-banner'>
        <Container>
          <Alert variant='danger' className='my-4'>
            Error loading banners: {error}
          </Alert>
        </Container>
      </section>
    );
  }

  return (
    <section className='hero-banner'>
      <Container fluid className='p-0'>
        <Row className='g-0'>
          {/* Main Banner Carousel */}
          <Col lg={8} className='banner-carousel-col'>
            <div className='banner-carousel'>
              {/* Regular Banners from API */}
              {banners && banners.length > 0
                ? banners.map((banner, index) => (
                    <div
                      key={banner._id}
                      className={`banner-slide ${
                        index === currentSlide ? 'active' : ''
                      }`}
                      style={{
                        background:
                          banner.bgColor ||
                          'linear-gradient(135deg, #2E86AB 0%, #A23B72 100%)',
                      }}
                    >
                      <Container>
                        <Row className='align-items-center min-vh-50'>
                          <Col md={6} className='banner-content'>
                            <Badge bg='warning' className='banner-badge mb-2'>
                              {banner.badge || 'Special Offer'}
                            </Badge>
                            <h1 className='banner-title'>{banner.title}</h1>
                            <h3 className='banner-subtitle'>
                              {banner.subtitle}
                            </h3>
                            <p className='banner-description'>
                              {banner.description}
                            </p>
                            <LinkContainer to={banner.link || '/products'}>
                              <Button size='lg' className='banner-btn'>
                                {banner.buttonText || 'Shop Now'}
                                <i className='fas fa-arrow-right ms-2'></i>
                              </Button>
                            </LinkContainer>
                          </Col>
                          <Col md={6} className='banner-image'>
                            <img
                              src={banner.image}
                              alt={banner.title}
                              className='img-fluid'
                            />
                          </Col>
                        </Row>
                      </Container>
                    </div>
                  ))
                : null}

              {/* Default banner when no banners exist */}
              {(!banners || banners.length === 0) && (
                <div
                  className='banner-slide active'
                  style={{
                    background:
                      'linear-gradient(135deg, #2E86AB 0%, #A23B72 100%)',
                  }}
                >
                  <Container>
                    <Row className='align-items-center min-vh-50'>
                      <Col md={12} className='text-center'>
                        <h2>No banners available</h2>
                        <p>Please check back later for exciting offers!</p>
                      </Col>
                    </Row>
                  </Container>
                </div>
              )}

              {/* Navigation Controls */}
              <button className='carousel-control prev' onClick={prevSlide}>
                <i className='fas fa-chevron-left'></i>
              </button>
              <button className='carousel-control next' onClick={nextSlide}>
                <i className='fas fa-chevron-right'></i>
              </button>

              {/* Dots Indicator */}
              <div className='carousel-dots'>
                {/* Regular banner dots */}
                {banners &&
                  banners.length > 0 &&
                  banners.map((_, index) => (
                    <button
                      key={index + 1}
                      className={`dot ${
                        index === currentSlide ? 'active' : ''
                      }`}
                      onClick={() => setCurrentSlide(index)}
                    ></button>
                  ))}
              </div>
            </div>
          </Col>

          {/* Side Offers */}
          <Col lg={4} className='offers-col'>
            <div className='offers-section'>
              <h4 className='offers-title'>
                <i className='fas fa-gift me-2'></i>
                Why Choose MedMart?
              </h4>

              {offers.map((offer, index) => (
                <div key={index} className='offer-item'>
                  <div className='offer-icon'>
                    <i className={offer.icon}></i>
                  </div>
                  <div className='offer-content'>
                    <h6 className='offer-title'>{offer.title}</h6>
                    <p className='offer-subtitle'>{offer.subtitle}</p>
                  </div>
                </div>
              ))}

              {/* Quick Actions */}
              <div className='quick-actions mt-4'>
                <LinkContainer to='/upload-prescription'>
                  <Button variant='outline-primary' className='w-100 mb-2'>
                    <i className='fas fa-upload me-2'></i>
                    Upload Prescription
                  </Button>
                </LinkContainer>
                <LinkContainer to='/track-order'>
                  <Button variant='outline-secondary' className='w-100'>
                    <i className='fas fa-search me-2'></i>
                    Track Your Order
                  </Button>
                </LinkContainer>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HeroBanner;
