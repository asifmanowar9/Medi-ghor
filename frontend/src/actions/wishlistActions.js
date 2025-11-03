import axios from 'axios';
import {
  WISHLIST_ADD_ITEM,
  WISHLIST_REMOVE_ITEM,
  WISHLIST_CLEAR_ITEMS,
  WISHLIST_FETCH_REQUEST,
  WISHLIST_FETCH_SUCCESS,
  WISHLIST_FETCH_FAIL,
  WISHLIST_ADD_REQUEST,
  WISHLIST_ADD_SUCCESS,
  WISHLIST_ADD_FAIL,
  WISHLIST_REMOVE_REQUEST,
  WISHLIST_REMOVE_SUCCESS,
  WISHLIST_REMOVE_FAIL,
} from '../constants/wishlistConstants';

// Fetch wishlist from backend
export const fetchWishlist = () => async (dispatch, getState) => {
  try {
    dispatch({ type: WISHLIST_FETCH_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    if (!userInfo) {
      dispatch({ type: WISHLIST_FETCH_FAIL, payload: 'User not logged in' });
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get('/api/wishlist', config);

    dispatch({
      type: WISHLIST_FETCH_SUCCESS,
      payload: data.data, // Backend returns { success: true, data: [...] }
    });
  } catch (error) {
    dispatch({
      type: WISHLIST_FETCH_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Add to wishlist (backend)
export const addToWishlist = (productId) => async (dispatch, getState) => {
  try {
    dispatch({ type: WISHLIST_ADD_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    if (!userInfo) {
      dispatch({ type: WISHLIST_ADD_FAIL, payload: 'User not logged in' });
      return;
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(
      '/api/wishlist',
      { productId },
      config
    );

    dispatch({
      type: WISHLIST_ADD_SUCCESS,
      payload: data.data,
    });

    // Refresh the entire wishlist to get updated data
    dispatch(fetchWishlist());
  } catch (error) {
    dispatch({
      type: WISHLIST_ADD_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Remove from wishlist (backend)
export const removeFromWishlist = (productId) => async (dispatch, getState) => {
  try {
    dispatch({ type: WISHLIST_REMOVE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    if (!userInfo) {
      dispatch({ type: WISHLIST_REMOVE_FAIL, payload: 'User not logged in' });
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete(`/api/wishlist/${productId}`, config);

    dispatch({
      type: WISHLIST_REMOVE_SUCCESS,
      payload: productId,
    });

    // Refresh the entire wishlist to get updated data
    dispatch(fetchWishlist());
  } catch (error) {
    dispatch({
      type: WISHLIST_REMOVE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Clear wishlist (backend)
export const clearWishlist = () => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState();

    if (!userInfo) {
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete('/api/wishlist', config);

    dispatch({
      type: WISHLIST_CLEAR_ITEMS,
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
  }
};

// Legacy local storage functions (for backwards compatibility)
export const addToWishlistLocal = (id) => async (dispatch, getState) => {
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

export const removeFromWishlistLocal = (id) => (dispatch, getState) => {
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
