import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Carousel, Image } from 'react-bootstrap';
import Loader from './Loader';
import Message from './Message';
import { listTopProducts } from '../actions/productActions';
import './ProductCarousel.css'; // Add this import if you create a separate CSS file

const ProductCarousel = () => {
  const dispatch = useDispatch();

  const productTopRated = useSelector((state) => state.productTopRated);

  const { loading, error, products } = productTopRated;

  useEffect(() => {
    dispatch(listTopProducts());
  }, [dispatch]);

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : (
    <Carousel pause='hover' className='bg-dark carousel-smaller'>
      {products.map((product) => (
        <Carousel.Item key={product._id}>
          <Link to={`/product/${product._id}`}>
            <Image
              src={
                product.image.startsWith('http')
                  ? product.image
                  : product.image.startsWith('/uploads')
                  ? product.image
                  : product.image.startsWith('/images')
                  ? product.image
                  : `/uploads/${product.image}`
              }
              alt={product.name}
              fluid
            />
            <Carousel.Caption className='carousel-caption black-text'>
              <h2>
                {product.name} (BDT{product.price})
              </h2>
            </Carousel.Caption>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default ProductCarousel;
