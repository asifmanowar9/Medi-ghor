import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import Rating from './Rating';
import './Product.css'; // Add this new CSS file

const Product = ({ product }) => {
  // Fix the image path handling (keeping existing logic):
  const imagePath =
    product.image &&
    (product.image.startsWith('http')
      ? product.image // Use as is if it's an absolute URL
      : product.image.startsWith('/uploads')
      ? product.image // Use as is if it already has /uploads prefix
      : product.image.startsWith('/images')
      ? product.image // Use as is if it already has /images prefix (from demo data)
      : `/uploads/${product.image}`); // Add /uploads prefix for relative paths

  return (
    <Card className='product-card my-3 rounded'>
      <div className='product-img-container'>
        <Link to={`/product/${product._id}`}>
          <Card.Img src={imagePath} variant='top' className='product-img' />
        </Link>
      </div>

      <Card.Body className='product-card-body'>
        <Link to={`/product/${product._id}`}>
          <Card.Title as='div' className='product-title'>
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as='div'>
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </Card.Text>
        <Card.Text as='h3'>BDT{product.price}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Product;
