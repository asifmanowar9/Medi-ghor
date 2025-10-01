import {
  PRESCRIPTION_LIST_REQUEST,
  PRESCRIPTION_LIST_SUCCESS,
  PRESCRIPTION_LIST_FAIL,
  PRESCRIPTION_LIST_RESET,
  PRESCRIPTION_DETAILS_REQUEST,
  PRESCRIPTION_DETAILS_SUCCESS,
  PRESCRIPTION_DETAILS_FAIL,
  PRESCRIPTION_DETAILS_RESET,
  PRESCRIPTION_CREATE_REQUEST,
  PRESCRIPTION_CREATE_SUCCESS,
  PRESCRIPTION_CREATE_FAIL,
  PRESCRIPTION_CREATE_RESET,
  PRESCRIPTION_UPDATE_REQUEST,
  PRESCRIPTION_UPDATE_SUCCESS,
  PRESCRIPTION_UPDATE_FAIL,
  PRESCRIPTION_UPDATE_RESET,
  PRESCRIPTION_DELETE_REQUEST,
  PRESCRIPTION_DELETE_SUCCESS,
  PRESCRIPTION_DELETE_FAIL,
  PRESCRIPTION_UPLOAD_REQUEST,
  PRESCRIPTION_UPLOAD_SUCCESS,
  PRESCRIPTION_UPLOAD_FAIL,
  PRESCRIPTION_UPLOAD_RESET,
} from '../constants/prescriptionConstants';

export const prescriptionListReducer = (
  state = { prescriptions: [], loading: false, pages: 1, page: 1, total: 0 },
  action
) => {
  switch (action.type) {
    case PRESCRIPTION_LIST_REQUEST:
      return { ...state, loading: true };
    case PRESCRIPTION_LIST_SUCCESS:
      return {
        loading: false,
        prescriptions: action.payload.prescriptions,
        pages: action.payload.pages,
        page: action.payload.page,
        total: action.payload.total,
      };
    case PRESCRIPTION_LIST_FAIL:
      return { ...state, loading: false, error: action.payload };
    case PRESCRIPTION_LIST_RESET:
      return { prescriptions: [], loading: false, pages: 1, page: 1, total: 0 };
    default:
      return state;
  }
};

export const prescriptionDetailsReducer = (
  state = { prescription: {}, loading: false },
  action
) => {
  switch (action.type) {
    case PRESCRIPTION_DETAILS_REQUEST:
      return { ...state, loading: true };
    case PRESCRIPTION_DETAILS_SUCCESS:
      return { loading: false, prescription: action.payload };
    case PRESCRIPTION_DETAILS_FAIL:
      return { ...state, loading: false, error: action.payload };
    case PRESCRIPTION_DETAILS_RESET:
      return { prescription: {}, loading: false };
    default:
      return state;
  }
};

export const prescriptionCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case PRESCRIPTION_CREATE_REQUEST:
      return { loading: true };
    case PRESCRIPTION_CREATE_SUCCESS:
      return { loading: false, success: true, prescription: action.payload };
    case PRESCRIPTION_CREATE_FAIL:
      return { loading: false, error: action.payload };
    case PRESCRIPTION_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const prescriptionUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case PRESCRIPTION_UPDATE_REQUEST:
      return { loading: true };
    case PRESCRIPTION_UPDATE_SUCCESS:
      return { loading: false, success: true, prescription: action.payload };
    case PRESCRIPTION_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case PRESCRIPTION_UPDATE_RESET:
      return {};
    default:
      return state;
  }
};

export const prescriptionDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case PRESCRIPTION_DELETE_REQUEST:
      return { loading: true };
    case PRESCRIPTION_DELETE_SUCCESS:
      return { loading: false, success: true };
    case PRESCRIPTION_DELETE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const prescriptionUploadReducer = (state = {}, action) => {
  switch (action.type) {
    case PRESCRIPTION_UPLOAD_REQUEST:
      return { loading: true };
    case PRESCRIPTION_UPLOAD_SUCCESS:
      return { loading: false, success: true, uploadResult: action.payload };
    case PRESCRIPTION_UPLOAD_FAIL:
      return { loading: false, error: action.payload };
    case PRESCRIPTION_UPLOAD_RESET:
      return {};
    default:
      return state;
  }
};
