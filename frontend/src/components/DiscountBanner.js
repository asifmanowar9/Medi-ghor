import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import '../styles/DiscountBanner.css';

const DiscountBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 15,
    minutes: 30,
    seconds: 45,
  });

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

  return (
    <section className='discount-banner'>
      <Container fluid className='p-0'>
        <div className='banner-container'>
          <div className='banner-bg'></div>
          <div className='banner-content'>
            <Container>
              <Row className='align-items-center min-vh-40'>
                <Col lg={6} className='text-content'>
                  <div className='badge-container mb-3'>
                    <span className='special-offer-badge'>
                      <i className='fas fa-fire me-2'></i>
                      Special Mega Sale
                    </span>
                  </div>

                  <h1 className='banner-title'>
                    <span className='discount-text'>60% OFF</span>
                    <span className='main-text'>মেগা সেল</span>
                  </h1>

                  <p className='banner-subtitle'>
                    সকল ঔষধ ও স্বাস্থ্য পণ্যে বিশেষ ছাড়!
                    <br />
                    <strong>৫০০ টাকার উপরে ফ্রি ডেলিভারি</strong>
                  </p>

                  <div className='countdown-container mb-4'>
                    <h5 className='countdown-title'>
                      <i className='fas fa-clock me-2'></i>
                      অফার শেষ হবে:
                    </h5>
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
                      <Button size='lg' className='shop-now-btn me-3'>
                        <i className='fas fa-shopping-bag me-2'></i>
                        এখনই কিনুন
                      </Button>
                    </LinkContainer>
                    <LinkContainer to='/categories'>
                      <Button
                        variant='outline-light'
                        size='lg'
                        className='explore-btn'
                      >
                        <i className='fas fa-th-large me-2'></i>
                        সব পণ্য দেখুন
                      </Button>
                    </LinkContainer>
                  </div>
                </Col>

                <Col lg={6} className='visual-content'>
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
        </div>
      </Container>
    </section>
  );
};

export default DiscountBanner;
