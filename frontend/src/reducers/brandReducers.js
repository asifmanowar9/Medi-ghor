import {
  BRAND_LIST_REQUEST,
  BRAND_LIST_SUCCESS,
  BRAND_LIST_FAIL,
  FEATURED_BRANDS_REQUEST,
  FEATURED_BRANDS_SUCCESS,
  FEATURED_BRANDS_FAIL,
} from '../constants/brandConstants';

export const brandListReducer = (state = { brands: [] }, action) => {
  switch (action.type) {
    case BRAND_LIST_REQUEST:
      return { loading: true, brands: [] };
    case BRAND_LIST_SUCCESS:
      return { loading: false, brands: action.payload };
    case BRAND_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const featuredBrandsReducer = (state = { brands: [] }, action) => {
  switch (action.type) {
    case FEATURED_BRANDS_REQUEST:
      return { loading: true, brands: [] };
    case FEATURED_BRANDS_SUCCESS:
      return { loading: false, brands: action.payload };
    case FEATURED_BRANDS_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};
