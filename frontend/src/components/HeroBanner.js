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
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 15,
    minutes: 30,
    seconds: 45,
  });

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

  // Discount countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        let { days, hours, minutes, seconds } = prevTime;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    dispatch(listBanners());
  }, [dispatch]);

  useEffect(() => {
    // Include discount banner as first slide, so total slides = banners + 1
    const totalSlides = banners && banners.length > 0 ? banners.length + 1 : 1;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners]);

  const nextSlide = () => {
    const totalSlides = banners && banners.length > 0 ? banners.length + 1 : 1;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    const totalSlides = banners && banners.length > 0 ? banners.length + 1 : 1;
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
              {/* Discount Banner - First Slide */}
              <div
                className={`banner-slide discount-banner-slide ${
                  currentSlide === 0 ? 'active' : ''
                }`}
                style={{
                  background:
                    'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 25%, #FF6B9D 50%, #C44569 75%, #F8B500 100%)',
                }}
              >
                <Container>
                  <Row className='align-items-center min-vh-50'>
                    <Col md={6} className='banner-content'>
                      <div className='discount-badge-container mb-3'>
                        <Badge bg='warning' className='special-offer-badge'>
                          <i className='fas fa-fire me-2'></i>
                          Special Mega Sale
                        </Badge>
                      </div>

                      <h1 className='discount-banner-title'>
                        <span className='discount-text'>60% OFF</span>
                        <span className='main-text'>মেগা সেল</span>
                      </h1>

                      <p className='banner-description'>
                        সকল ঔষধ ও স্বাস্থ্য পণ্যে বিশেষ ছাড়!
                        <br />
                        <strong>৫০০ টাকার উপরে ফ্রি ডেলিভারি</strong>
                      </p>

                      <div className='countdown-container mb-4'>
                        <h6 className='countdown-title'>
                          <i className='fas fa-clock me-2'></i>
                          অফার শেষ হবে:
                        </h6>
                        <div className='countdown-timer'>
                          <div className='time-unit'>
                            <span className='time-number'>
                              {timeLeft.days.toString().padStart(2, '0')}
                            </span>
                            <span className='time-label'>দিন</span>
                          </div>
                          <div className='time-separator'>:</div>
                          <div className='time-unit'>
                            <span className='time-number'>
                              {timeLeft.hours.toString().padStart(2, '0')}
                            </span>
                            <span className='time-label'>ঘন্টা</span>
                          </div>
                          <div className='time-separator'>:</div>
                          <div className='time-unit'>
                            <span className='time-number'>
                              {timeLeft.minutes.toString().padStart(2, '0')}
                            </span>
                            <span className='time-label'>মিনিট</span>
                          </div>
                          <div className='time-separator'>:</div>
                          <div className='time-unit'>
                            <span className='time-number'>
                              {timeLeft.seconds.toString().padStart(2, '0')}
                            </span>
                            <span className='time-label'>সেকেন্ড</span>
                          </div>
                        </div>
                      </div>

                      <div className='action-buttons'>
                        <LinkContainer to='/sale'>
                          <Button size='lg' className='discount-shop-btn me-3'>
                            <i className='fas fa-shopping-bag me-2'></i>
                            এখনই কিনুন
                          </Button>
                        </LinkContainer>
                        <LinkContainer to='/categories'>
                          <Button
                            variant='outline-light'
                            size='lg'
                            className='discount-explore-btn'
                          >
                            <i className='fas fa-th-large me-2'></i>
                            সব পণ্য দেখুন
                          </Button>
                        </LinkContainer>
                      </div>
                    </Col>

                    <Col md={6} className='discount-visual-content'>
                      <div className='discount-visual'>
                        <div className='floating-elements'>
                          <div className='floating-pill pill-1'>
                            <i className='fas fa-pills'></i>
                          </div>
                          <div className='floating-pill pill-2'>
                            <i className='fas fa-capsules'></i>
                          </div>
                          <div className='floating-pill pill-3'>
                            <i className='fas fa-tablets'></i>
                          </div>
                          <div className='floating-discount'>60%</div>
                        </div>

                        <div className='main-circle'>
                          <div className='inner-circle'>
                            <div className='discount-number'>
                              60<span>%</span>
                            </div>
                            <div className='discount-label'>OFF</div>
                          </div>
                        </div>

                        <div className='product-icons'>
                          <div className='product-icon icon-1'>
                            <i className='fas fa-heartbeat'></i>
                          </div>
                          <div className='product-icon icon-2'>
                            <i className='fas fa-stethoscope'></i>
                          </div>
                          <div className='product-icon icon-3'>
                            <i className='fas fa-syringe'></i>
                          </div>
                          <div className='product-icon icon-4'>
                            <i className='fas fa-thermometer'></i>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>

              {/* Regular Banners from API */}
              {banners && banners.length > 0
                ? banners.map((banner, index) => (
                    <div
                      key={banner._id}
                      className={`banner-slide ${
                        index + 1 === currentSlide ? 'active' : ''
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
                {/* Discount banner dot */}
                <button
                  key='discount'
                  className={`dot ${currentSlide === 0 ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(0)}
                ></button>

                {/* Regular banner dots */}
                {banners &&
                  banners.length > 0 &&
                  banners.map((_, index) => (
                    <button
                      key={index + 1}
                      className={`dot ${
                        index + 1 === currentSlide ? 'active' : ''
                      }`}
                      onClick={() => setCurrentSlide(index + 1)}
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
                Why Choose Medi-ghor?
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
