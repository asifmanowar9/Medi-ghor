import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className='comprehensive-footer'>
      {/* Main Footer Content */}
      <div className='footer-main'>
        <Container>
          <Row>
            {/* Company Info */}
            <Col lg={3} md={6} className='footer-section'>
              <h5 className='footer-title'>
                <i className='fas fa-pills me-2'></i>
                Medi-ghor
              </h5>
              <p className='footer-description'>
                বাংলাদেশের নির্ভরযোগ্য অনলাইন ফার্মেসি। আমরা প্রদান করি খাঁটি
                ঔষধ, স্বাস্থ্য সেবা এবং বিশেষজ্ঞ পরামর্শ।
              </p>
              <div className='social-links'>
                <a
                  href='#'
                  className='social-link facebook'
                  aria-label='Facebook'
                >
                  <i className='fab fa-facebook-f'></i>
                </a>
                <a
                  href='#'
                  className='social-link twitter'
                  aria-label='Twitter'
                >
                  <i className='fab fa-twitter'></i>
                </a>
                <a
                  href='#'
                  className='social-link instagram'
                  aria-label='Instagram'
                >
                  <i className='fab fa-instagram'></i>
                </a>
                <a
                  href='#'
                  className='social-link linkedin'
                  aria-label='LinkedIn'
                >
                  <i className='fab fa-linkedin-in'></i>
                </a>
                <a
                  href='#'
                  className='social-link whatsapp'
                  aria-label='WhatsApp'
                >
                  <i className='fab fa-whatsapp'></i>
                </a>
              </div>
            </Col>

            {/* Quick Links */}
            <Col lg={2} md={6} className='footer-section'>
              <h6 className='footer-subtitle'>Quick Links</h6>
              <ul className='footer-links'>
                <li>
                  <LinkContainer to='/'>
                    <a href='#'>
                      <i className='fas fa-home me-1'></i>
                      Home
                    </a>
                  </LinkContainer>
                </li>
                <li>
                  <LinkContainer to='/products'>
                    <a href='#'>
                      <i className='fas fa-capsules me-1'></i>
                      All Products
                    </a>
                  </LinkContainer>
                </li>
                <li>
                  <LinkContainer to='/categories'>
                    <a href='#'>
                      <i className='fas fa-th-large me-1'></i>
                      Categories
                    </a>
                  </LinkContainer>
                </li>
                <li>
                  <LinkContainer to='/brands'>
                    <a href='#'>
                      <i className='fas fa-award me-1'></i>
                      Brands
                    </a>
                  </LinkContainer>
                </li>
                <li>
                  <LinkContainer to='/health-conditions'>
                    <a href='#'>
                      <i className='fas fa-heartbeat me-1'></i>
                      Health Conditions
                    </a>
                  </LinkContainer>
                </li>
              </ul>
            </Col>

            {/* Customer Care */}
            <Col lg={2} md={6} className='footer-section'>
              <h6 className='footer-subtitle'>Customer Care</h6>
              <ul className='footer-links'>
                <li>
                  <LinkContainer to='/profile'>
                    <a href='#'>
                      <i className='fas fa-user me-1'></i>
                      My Account
                    </a>
                  </LinkContainer>
                </li>
                <li>
                  <LinkContainer to='/cart'>
                    <a href='#'>
                      <i className='fas fa-shopping-cart me-1'></i>
                      My Cart
                    </a>
                  </LinkContainer>
                </li>
                <li>
                  <LinkContainer to='/orders'>
                    <a href='#'>
                      <i className='fas fa-list-alt me-1'></i>
                      Order History
                    </a>
                  </LinkContainer>
                </li>
                <li>
                  <a href='#'>
                    <i className='fas fa-question-circle me-1'></i>
                    Help & FAQ
                  </a>
                </li>
                <li>
                  <a href='#'>
                    <i className='fas fa-undo me-1'></i>
                    Return Policy
                  </a>
                </li>
              </ul>
            </Col>

            {/* Services */}
            <Col lg={2} md={6} className='footer-section'>
              <h6 className='footer-subtitle'>Services</h6>
              <ul className='footer-links'>
                <li>
                  <LinkContainer to='/chats'>
                    <a href='#'>
                      <i className='fas fa-file-medical-alt me-1'></i>
                      AI Test Analysis
                    </a>
                  </LinkContainer>
                </li>
                <li>
                  <a href='#'>
                    <i className='fas fa-upload me-1'></i>
                    Upload Prescription
                  </a>
                </li>
                <li>
                  <a href='#'>
                    <i className='fas fa-phone-alt me-1'></i>
                    Telemedicine
                  </a>
                </li>
                <li>
                  <a href='#'>
                    <i className='fas fa-truck me-1'></i>
                    Home Delivery
                  </a>
                </li>
                {/* <li>
                  <a href='#'>
                    <i className='fas fa-calendar-check me-1'></i>
                    Medicine Reminder
                  </a>
                </li> */}
              </ul>
            </Col>

            {/* Contact Info */}
            <Col lg={3} md={6} className='footer-section'>
              <h6 className='footer-subtitle'>Contact Us</h6>
              <div className='contact-info'>
                <div className='contact-item'>
                  <i className='fas fa-map-marker-alt'></i>
                  <div>
                    <strong>Address:</strong>
                    <p>123 Medical Road, Dhaka 1000, Bangladesh</p>
                  </div>
                </div>
                <div className='contact-item'>
                  <i className='fas fa-phone'></i>
                  <div>
                    <strong>Hotline:</strong>
                    <p>+880 1700-000000 (24/7)</p>
                  </div>
                </div>
                <div className='contact-item'>
                  <i className='fas fa-envelope'></i>
                  <div>
                    <strong>Email:</strong>
                    <p>support@medighor.com</p>
                  </div>
                </div>
                <div className='contact-item'>
                  <i className='fas fa-clock'></i>
                  <div>
                    <strong>Working Hours:</strong>
                    <p>24/7 Online Service</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Trust Badges & Certifications */}
      <div className='footer-trust'>
        <Container>
          <Row className='align-items-center'>
            <Col md={6}>
              <div className='trust-badges'>
                <div className='trust-badge'>
                  <i className='fas fa-shield-check'></i>
                  <span>100% Authentic</span>
                </div>
                <div className='trust-badge'>
                  <i className='fas fa-truck-fast'></i>
                  <span>Fast Delivery</span>
                </div>
                <div className='trust-badge'>
                  <i className='fas fa-lock'></i>
                  <span>Secure Payment</span>
                </div>
                <div className='trust-badge'>
                  <i className='fas fa-headset'></i>
                  <span>24/7 Support</span>
                </div>
              </div>
            </Col>
            <Col md={6} className='text-md-end'>
              <div className='payment-methods'>
                <span className='payment-text'>We Accept:</span>
                <div className='payment-icons'>
                  <i className='fab fa-cc-visa'></i>
                  <i className='fab fa-cc-mastercard'></i>
                  <i className='fab fa-cc-amex'></i>
                  <span className='bkash-logo'>bKash</span>
                  <span className='nagad-logo'>Nagad</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer Bottom */}
      <div className='footer-bottom'>
        <Container>
          <Row className='align-items-center'>
            <Col md={6}>
              <p className='copyright'>
                &copy; 2025 Medi-ghor. All rights reserved.
                <span className='license'>Licensed Pharmacy</span>
              </p>
            </Col>
            <Col md={6} className='text-md-end'>
              <ul className='footer-legal'>
                <li>
                  <a href='#'>Privacy Policy</a>
                </li>
                <li>
                  <a href='#'>Terms & Conditions</a>
                </li>
                <li>
                  <a href='#'>Sitemap</a>
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Back to Top Button */}
      <div className='back-to-top'>
        <Button
          variant='primary'
          className='back-to-top-btn'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <i className='fas fa-arrow-up'></i>
        </Button>
      </div>
    </footer>
  );
};

export default Footer;
