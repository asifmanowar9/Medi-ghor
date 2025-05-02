const express = require('express');
const products = require('./data/products');

const app = express();

app.get('/', (req, res) => {
  res.send('API is running');
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p._id === req.params.id);
  if (product) {
    res.json(product); // Send the found single product as JSON
  } else {
    res.status(404).json({ message: 'Product not found' }); // Send a 404 status if the product is not found
  }
});

app.listen(5000, console.log('server running on 5000'));
