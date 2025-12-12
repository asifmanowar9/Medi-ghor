import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAIL,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_UPDATE_PROFILE_FAIL,
  USER_DETAILS_RESET,
  USER_LIST_REQUEST,
  USER_LIST_SUCCESS,
  USER_LIST_FAIL,
  USER_LIST_RESET,
  USER_DELETE_REQUEST,
  USER_DELETE_SUCCESS,
  USER_DELETE_FAIL,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAIL,
  USER_UPDATE_RESET,
  USER_UPDATE_PROFILE_RESET,
  USER_ADDRESSES_REQUEST,
  USER_ADDRESSES_SUCCESS,
  USER_ADDRESSES_FAIL,
  USER_ADDRESSES_RESET,
  USER_ADDRESS_ADD_REQUEST,
  USER_ADDRESS_ADD_SUCCESS,
  USER_ADDRESS_ADD_FAIL,
  USER_ADDRESS_ADD_RESET,
  USER_ADDRESS_UPDATE_REQUEST,
  USER_ADDRESS_UPDATE_SUCCESS,
  USER_ADDRESS_UPDATE_FAIL,
  USER_ADDRESS_UPDATE_RESET,
  USER_ADDRESS_DELETE_REQUEST,
  USER_ADDRESS_DELETE_SUCCESS,
  USER_ADDRESS_DELETE_FAIL,
} from '../constants/userConstants';

export const userLoginReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return { loading: true };
    case USER_LOGIN_SUCCESS:
      return { loading: false, userInfo: action.payload };
    case USER_LOGIN_FAIL:
      return { loading: false, error: action.payload };
    case USER_LOGOUT:
      return {};
    default:
      return state;
  }
};

export const userRegisterReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_REGISTER_REQUEST:
      return { loading: true };
    case USER_REGISTER_SUCCESS:
      return { loading: false, userInfo: action.payload };
    case USER_REGISTER_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const userDetailsReducer = (state = { user: {} }, action) => {
  switch (action.type) {
    case USER_DETAILS_REQUEST:
      return { ...state, loading: true };
    case USER_DETAILS_SUCCESS:
      return { loading: false, user: action.payload };
    case USER_DETAILS_FAIL:
      return { loading: false, error: action.payload };
    case USER_DETAILS_RESET:
      return { user: {} };
    default:
      return state;
  }
};

export const userUpdateProfileReducer = (state = { user: {} }, action) => {
  switch (action.type) {
    case USER_UPDATE_PROFILE_REQUEST:
      return { loading: true };
    case USER_UPDATE_PROFILE_SUCCESS:
      return { loading: false, success: true, userInfo: action.payload };
    case USER_UPDATE_PROFILE_FAIL:
      return { loading: false, error: action.payload };
    case USER_UPDATE_PROFILE_RESET:
      return { user: {} };
    default:
      return state;
  }
};

export const userListReducer = (state = { users: [] }, action) => {
  switch (action.type) {
    case USER_LIST_REQUEST:
      return { loading: true };
    case USER_LIST_SUCCESS:
      return { loading: false, users: action.payload };
    case USER_LIST_FAIL:
      return { loading: false, error: action.payload };
    case USER_LIST_RESET:
      return { users: [] };
    default:
      return state;
  }
};

export const userDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_DELETE_REQUEST:
      return { loading: true };
    case USER_DELETE_SUCCESS:
      return { loading: false, success: true };
    case USER_DELETE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const userUpdateReducer = (state = { user: {} }, action) => {
  switch (action.type) {
    case USER_UPDATE_REQUEST:
      return { loading: true };
    case USER_UPDATE_SUCCESS:
      return { loading: false, success: true };
    case USER_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case USER_UPDATE_RESET:
      return { user: {} };
    default:
      return state;
  }
};

// Saved Addresses Reducers
export const userAddressesReducer = (state = { addresses: [] }, action) => {
  switch (action.type) {
    case USER_ADDRESSES_REQUEST:
      return { ...state, loading: true };
    case USER_ADDRESSES_SUCCESS:
      return { loading: false, addresses: action.payload };
    case USER_ADDRESSES_FAIL:
      return { loading: false, error: action.payload };
    case USER_ADDRESSES_RESET:
      return { addresses: [] };
    default:
      return state;
  }
};

export const userAddressAddReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_ADDRESS_ADD_REQUEST:
      return { loading: true };
    case USER_ADDRESS_ADD_SUCCESS:
      return { loading: false, success: true, address: action.payload };
    case USER_ADDRESS_ADD_FAIL:
      return { loading: false, error: action.payload };
    case USER_ADDRESS_ADD_RESET:
      return {};
    default:
      return state;
  }
};

export const userAddressUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_ADDRESS_UPDATE_REQUEST:
      return { loading: true };
    case USER_ADDRESS_UPDATE_SUCCESS:
      return { loading: false, success: true };
    case USER_ADDRESS_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case USER_ADDRESS_UPDATE_RESET:
      return {};
    default:
      return state;
  }
};

export const userAddressDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_ADDRESS_DELETE_REQUEST:
      return { loading: true };
    case USER_ADDRESS_DELETE_SUCCESS:
      return { loading: false, success: true };
    case USER_ADDRESS_DELETE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};
