import axios from 'axios';

import { CART_ADD_ITEM, CART_REMOVE_ITEM } from '../constants/cartConstants';

export const addToCart = (id, qty) => async (dispatch, getState) => {
  try {
    console.log('Adding to cart:', id, qty); // Debug log
    const { data } = await axios.get(`/api/products/${id}`);
    
    dispatch({
      type: CART_ADD_ITEM,
      payload: {
        product: data._id,
        name: data.name,
        image: data.image,
        price: data.price,
        countInStock: data.countInStock,
        qty: Number(qty), // Ensure qty is a number
      },
    });

    const cartItems = getState().cart.cartItems;
    console.log('Updated cart items:', cartItems); // Debug log
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  } catch (error) {
    console.error('Error adding to cart:', error.response?.data || error.message);
  }
};

export const removeFromCart = (id) => (dispatch, getState) => {
  dispatch({
    type: CART_REMOVE_ITEM,
    payload: id,
  });

  localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
};
