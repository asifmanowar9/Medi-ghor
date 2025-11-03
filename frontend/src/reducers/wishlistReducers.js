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

export const wishlistReducer = (
  state = {
    wishlistItems: [],
    loading: false,
    error: null,
    addLoading: false,
    removeLoading: false,
  },
  action
) => {
  switch (action.type) {
    case WISHLIST_FETCH_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case WISHLIST_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        wishlistItems: action.payload.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          countInStock: item.product.countInStock,
          brand: item.product.brand,
          category: item.product.category,
          addedAt: item.addedAt,
          notified: item.notified,
        })),
        error: null,
      };

    case WISHLIST_FETCH_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case WISHLIST_ADD_REQUEST:
      return {
        ...state,
        addLoading: true,
        error: null,
      };

    case WISHLIST_ADD_SUCCESS:
      return {
        ...state,
        addLoading: false,
        error: null,
      };

    case WISHLIST_ADD_FAIL:
      return {
        ...state,
        addLoading: false,
        error: action.payload,
      };

    case WISHLIST_REMOVE_REQUEST:
      return {
        ...state,
        removeLoading: true,
        error: null,
      };

    case WISHLIST_REMOVE_SUCCESS:
      return {
        ...state,
        removeLoading: false,
        error: null,
      };

    case WISHLIST_REMOVE_FAIL:
      return {
        ...state,
        removeLoading: false,
        error: action.payload,
      };

    case WISHLIST_ADD_ITEM:
      const item = action.payload;
      const existItem = state.wishlistItems.find(
        (x) => x.product === item.product
      );

      if (existItem) {
        // Item already in wishlist, don't add it again
        return state;
      } else {
        return {
          ...state,
          wishlistItems: [...state.wishlistItems, item],
        };
      }

    case WISHLIST_REMOVE_ITEM:
      return {
        ...state,
        wishlistItems: state.wishlistItems.filter(
          (x) => x.product !== action.payload
        ),
      };

    case WISHLIST_CLEAR_ITEMS:
      return {
        ...state,
        wishlistItems: [],
      };

    default:
      return state;
  }
};
