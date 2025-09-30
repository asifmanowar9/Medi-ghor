import {
  BANNER_LIST_REQUEST,
  BANNER_LIST_SUCCESS,
  BANNER_LIST_FAIL,
  BANNER_ADMIN_LIST_REQUEST,
  BANNER_ADMIN_LIST_SUCCESS,
  BANNER_ADMIN_LIST_FAIL,
  BANNER_CREATE_REQUEST,
  BANNER_CREATE_SUCCESS,
  BANNER_CREATE_FAIL,
  BANNER_CREATE_RESET,
  BANNER_UPDATE_REQUEST,
  BANNER_UPDATE_SUCCESS,
  BANNER_UPDATE_FAIL,
  BANNER_UPDATE_RESET,
  BANNER_DELETE_REQUEST,
  BANNER_DELETE_SUCCESS,
  BANNER_DELETE_FAIL,
  BANNER_DETAILS_REQUEST,
  BANNER_DETAILS_SUCCESS,
  BANNER_DETAILS_FAIL,
} from '../constants/bannerConstants';

export const bannerListReducer = (state = { banners: [] }, action) => {
  switch (action.type) {
    case BANNER_LIST_REQUEST:
      return { loading: true, banners: [] };
    case BANNER_LIST_SUCCESS:
      return { loading: false, banners: action.payload };
    case BANNER_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const bannerAdminListReducer = (state = { banners: [] }, action) => {
  switch (action.type) {
    case BANNER_ADMIN_LIST_REQUEST:
      return { loading: true, banners: [] };
    case BANNER_ADMIN_LIST_SUCCESS:
      return { loading: false, banners: action.payload };
    case BANNER_ADMIN_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const bannerDetailsReducer = (state = { banner: {} }, action) => {
  switch (action.type) {
    case BANNER_DETAILS_REQUEST:
      return { loading: true, ...state };
    case BANNER_DETAILS_SUCCESS:
      return { loading: false, banner: action.payload };
    case BANNER_DETAILS_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const bannerCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case BANNER_CREATE_REQUEST:
      return { loading: true };
    case BANNER_CREATE_SUCCESS:
      return { loading: false, success: true, banner: action.payload };
    case BANNER_CREATE_FAIL:
      return { loading: false, error: action.payload };
    case BANNER_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const bannerUpdateReducer = (state = { banner: {} }, action) => {
  switch (action.type) {
    case BANNER_UPDATE_REQUEST:
      return { loading: true };
    case BANNER_UPDATE_SUCCESS:
      return { loading: false, success: true, banner: action.payload };
    case BANNER_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case BANNER_UPDATE_RESET:
      return { banner: {} };
    default:
      return state;
  }
};

export const bannerDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case BANNER_DELETE_REQUEST:
      return { loading: true };
    case BANNER_DELETE_SUCCESS:
      return { loading: false, success: true };
    case BANNER_DELETE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};
