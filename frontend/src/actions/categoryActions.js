import axios from 'axios';
import {
  CATEGORY_LIST_REQUEST,
  CATEGORY_LIST_SUCCESS,
  CATEGORY_LIST_FAIL,
  FEATURED_CATEGORIES_REQUEST,
  FEATURED_CATEGORIES_SUCCESS,
  FEATURED_CATEGORIES_FAIL,
} from '../constants/categoryConstants';

export const listCategories = () => async (dispatch) => {
  try {
    dispatch({ type: CATEGORY_LIST_REQUEST });

    const { data } = await axios.get('/api/categories');

    dispatch({
      type: CATEGORY_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: CATEGORY_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const listFeaturedCategories = () => async (dispatch) => {
  try {
    dispatch({ type: FEATURED_CATEGORIES_REQUEST });

    const { data } = await axios.get('/api/categories/featured');

    dispatch({
      type: FEATURED_CATEGORIES_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: FEATURED_CATEGORIES_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
