import axios from 'axios';
import {
  WISHLIST_ADD_ITEM,
  WISHLIST_REMOVE_ITEM,
  WISHLIST_CLEAR_ITEMS,
} from '../constants/wishlistConstants';

export const addToWishlist = (id) => async (dispatch, getState) => {
  try {
    const { data } = await axios.get(`/api/products/${id}`);

    // Only allow out-of-stock products to be added to wishlist
    if (data.countInStock > 0) {
      throw new Error('Only out-of-stock products can be added to wishlist');
    }

    const {
      userLogin: { userInfo },
    } = getState();

    dispatch({
      type: WISHLIST_ADD_ITEM,
      payload: {
        product: data._id,
        name: data.name,
        image: data.image,
        price: data.price,
        countInStock: data.countInStock,
        brand: data.brand,
        category: data.category,
      },
    });

    // Store wishlist items with user ID as part of the key
    const storageKey = userInfo
      ? `wishlistItems_${userInfo._id}`
      : 'wishlistItems_guest';
    localStorage.setItem(
      storageKey,
      JSON.stringify(getState().wishlist.wishlistItems)
    );
  } catch (error) {
    console.error(
      'Error adding to wishlist:',
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    );
    throw error;
  }
};

export const removeFromWishlist = (id) => (dispatch, getState) => {
  const {
    userLogin: { userInfo },
  } = getState();

  dispatch({
    type: WISHLIST_REMOVE_ITEM,
    payload: id,
  });

  // Update localStorage
  const storageKey = userInfo
    ? `wishlistItems_${userInfo._id}`
    : 'wishlistItems_guest';
  localStorage.setItem(
    storageKey,
    JSON.stringify(getState().wishlist.wishlistItems)
  );
};

export const clearWishlist = () => (dispatch, getState) => {
  const {
    userLogin: { userInfo },
  } = getState();

  dispatch({
    type: WISHLIST_CLEAR_ITEMS,
  });

  // Clear localStorage
  const storageKey = userInfo
    ? `wishlistItems_${userInfo._id}`
    : 'wishlistItems_guest';
  localStorage.removeItem(storageKey);
};

export const loadUserWishlist = () => (dispatch, getState) => {
  const {
    userLogin: { userInfo },
  } = getState();

  const storageKey = userInfo
    ? `wishlistItems_${userInfo._id}`
    : 'wishlistItems_guest';

  const wishlistItems = localStorage.getItem(storageKey)
    ? JSON.parse(localStorage.getItem(storageKey))
    : [];

  // Dispatch each item to rebuild the wishlist state
  wishlistItems.forEach((item) => {
    dispatch({
      type: WISHLIST_ADD_ITEM,
      payload: item,
    });
  });
};

export const syncWishlistWithBackend = () => async (dispatch, getState) => {
  const {
    userLogin: { userInfo },
    wishlist: { wishlistItems },
  } = getState();

  if (!userInfo) {
    return; // Only sync for logged-in users
  }

  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // Send current local wishlist to backend for synchronization
    const { data } = await axios.post(
      '/api/wishlist/sync',
      { localWishlistItems: wishlistItems },
      config
    );

    // Update local storage and state with the synchronized wishlist
    const storageKey = `wishlistItems_${userInfo._id}`;
    localStorage.setItem(storageKey, JSON.stringify(data.wishlistItems));

    // Clear current wishlist and reload with backend data
    dispatch({ type: WISHLIST_CLEAR_ITEMS });

    data.wishlistItems.forEach((item) => {
      dispatch({
        type: WISHLIST_ADD_ITEM,
        payload: item,
      });
    });

    console.log('Wishlist synchronized with backend');
  } catch (error) {
    console.error('Failed to sync wishlist:', error);
  }
};
