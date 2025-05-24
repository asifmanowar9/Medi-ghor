import axios from 'axios';

import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD,
  CART_CLEAR_ITEMS,
} from '../constants/cartConstants';

export const addToCart = (id, qty) => async (dispatch, getState) => {
  try {
    const { data } = await axios.get(`/api/products/${id}`);
    const {
      userLogin: { userInfo },
    } = getState();

    dispatch({
      type: CART_ADD_ITEM,
      payload: {
        product: data._id,
        name: data.name,
        image: data.image,
        price: data.price,
        countInStock: data.countInStock,
        qty: Number(qty),
      },
    });

    // Store cart items with user ID as part of the key
    const storageKey = userInfo
      ? `cartItems_${userInfo._id}`
      : 'cartItems_guest';
    localStorage.setItem(storageKey, JSON.stringify(getState().cart.cartItems));
  } catch (error) {
    console.error(
      'Error adding to cart:',
      error.response?.data || error.message
    );
  }
};

export const removeFromCart = (id) => (dispatch, getState) => {
  dispatch({
    type: CART_REMOVE_ITEM,
    payload: id,
  });

  const {
    userLogin: { userInfo },
  } = getState();
  const storageKey = userInfo ? `cartItems_${userInfo._id}` : 'cartItems_guest';
  localStorage.setItem(storageKey, JSON.stringify(getState().cart.cartItems));
};

export const saveShippingAddress = (data) => (dispatch, getState) => {
  dispatch({
    type: CART_SAVE_SHIPPING_ADDRESS,
    payload: data,
  });

  const {
    userLogin: { userInfo },
  } = getState();
  const storageKey = userInfo
    ? `shippingAddress_${userInfo._id}`
    : 'shippingAddress_guest';
  localStorage.setItem(storageKey, JSON.stringify(data));
};

export const savePaymentMethod = (data) => (dispatch, getState) => {
  dispatch({
    type: CART_SAVE_PAYMENT_METHOD,
    payload: data,
  });

  const {
    userLogin: { userInfo },
  } = getState();
  const storageKey = userInfo
    ? `paymentMethod_${userInfo._id}`
    : 'paymentMethod_guest';
  localStorage.setItem(storageKey, JSON.stringify(data));
};

export const clearCart = () => (dispatch, getState) => {
  dispatch({ type: CART_CLEAR_ITEMS });

  const {
    userLogin: { userInfo },
  } = getState();
  if (userInfo) {
    localStorage.removeItem(`cartItems_${userInfo._id}`);
    localStorage.removeItem(`shippingAddress_${userInfo._id}`);
    localStorage.removeItem(`paymentMethod_${userInfo._id}`);
  } else {
    localStorage.removeItem('cartItems_guest');
    localStorage.removeItem('shippingAddress_guest');
    localStorage.removeItem('paymentMethod_guest');
  }
};

// New action to load the correct user's cart when they log in
export const loadUserCart = () => (dispatch, getState) => {
  const {
    userLogin: { userInfo },
  } = getState();

  if (userInfo) {
    // Load user-specific cart
    const cartItemsFromStorage = localStorage.getItem(
      `cartItems_${userInfo._id}`
    )
      ? JSON.parse(localStorage.getItem(`cartItems_${userInfo._id}`))
      : [];

    const shippingAddressFromStorage = localStorage.getItem(
      `shippingAddress_${userInfo._id}`
    )
      ? JSON.parse(localStorage.getItem(`shippingAddress_${userInfo._id}`))
      : {};

    const paymentMethodFromStorage = localStorage.getItem(
      `paymentMethod_${userInfo._id}`
    )
      ? JSON.parse(localStorage.getItem(`paymentMethod_${userInfo._id}`))
      : '';

    dispatch({
      type: CART_ADD_ITEM,
      payload: { cartItems: cartItemsFromStorage },
      isFullReplace: true,
    });

    dispatch({
      type: CART_SAVE_SHIPPING_ADDRESS,
      payload: shippingAddressFromStorage,
    });

    dispatch({
      type: CART_SAVE_PAYMENT_METHOD,
      payload: paymentMethodFromStorage,
    });
  }
};
