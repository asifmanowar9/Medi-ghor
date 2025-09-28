import {
  CATEGORY_LIST_REQUEST,
  CATEGORY_LIST_SUCCESS,
  CATEGORY_LIST_FAIL,
  FEATURED_CATEGORIES_REQUEST,
  FEATURED_CATEGORIES_SUCCESS,
  FEATURED_CATEGORIES_FAIL,
} from '../constants/categoryConstants';

export const categoryListReducer = (state = { categories: [] }, action) => {
  switch (action.type) {
    case CATEGORY_LIST_REQUEST:
      return { ...state, loading: true };
    case CATEGORY_LIST_SUCCESS:
      return { loading: false, categories: action.payload };
    case CATEGORY_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const featuredCategoriesReducer = (
  state = { categories: [] },
  action
) => {
  switch (action.type) {
    case FEATURED_CATEGORIES_REQUEST:
      return { loading: true, categories: [] };
    case FEATURED_CATEGORIES_SUCCESS:
      return { loading: false, categories: action.payload };
    case FEATURED_CATEGORIES_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};
