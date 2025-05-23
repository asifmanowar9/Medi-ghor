import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import Rating from './Rating';

const Product = ({ product }) => {
  // Fix the image path handling:
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
    <Card className='my-3 p-3 rounded'>
      <Link to={`/product/${product._id}`}>
        <Card.Img src={imagePath} variant='top' />
      </Link>

      <Card.Body>
        <Link to={`/product/${product._id}`}>
          <Card.Title as='div'>
            <strong> {product.name}</strong>
          </Card.Title>
        </Link>
        <Card.Text as='div'>
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </Card.Text>
        <Card.Text as='h3'>${product.price}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Product;
