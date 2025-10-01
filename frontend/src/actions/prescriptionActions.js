import axios from 'axios';
import {
  PRESCRIPTION_LIST_REQUEST,
  PRESCRIPTION_LIST_SUCCESS,
  PRESCRIPTION_LIST_FAIL,
  PRESCRIPTION_DETAILS_REQUEST,
  PRESCRIPTION_DETAILS_SUCCESS,
  PRESCRIPTION_DETAILS_FAIL,
  PRESCRIPTION_CREATE_REQUEST,
  PRESCRIPTION_CREATE_SUCCESS,
  PRESCRIPTION_CREATE_FAIL,
  PRESCRIPTION_UPDATE_REQUEST,
  PRESCRIPTION_UPDATE_SUCCESS,
  PRESCRIPTION_UPDATE_FAIL,
  PRESCRIPTION_DELETE_REQUEST,
  PRESCRIPTION_DELETE_SUCCESS,
  PRESCRIPTION_DELETE_FAIL,
  PRESCRIPTION_UPLOAD_REQUEST,
  PRESCRIPTION_UPLOAD_SUCCESS,
  PRESCRIPTION_UPLOAD_FAIL,
} from '../constants/prescriptionConstants';

// Get user's prescriptions
export const listPrescriptions =
  (page = 1, limit = 10) =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: PRESCRIPTION_LIST_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/prescriptions?page=${page}&limit=${limit}`,
        config
      );

      dispatch({
        type: PRESCRIPTION_LIST_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: PRESCRIPTION_LIST_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

// Get prescription details
export const getPrescriptionDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRESCRIPTION_DETAILS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/prescriptions/${id}`, config);

    dispatch({
      type: PRESCRIPTION_DETAILS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: PRESCRIPTION_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Create prescription
export const createPrescription =
  (prescriptionData) => async (dispatch, getState) => {
    try {
      dispatch({ type: PRESCRIPTION_CREATE_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(
        '/api/prescriptions',
        prescriptionData,
        config
      );

      dispatch({
        type: PRESCRIPTION_CREATE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: PRESCRIPTION_CREATE_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

// Update prescription
export const updatePrescription =
  (id, prescriptionData) => async (dispatch, getState) => {
    try {
      dispatch({ type: PRESCRIPTION_UPDATE_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/prescriptions/${id}`,
        prescriptionData,
        config
      );

      dispatch({
        type: PRESCRIPTION_UPDATE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: PRESCRIPTION_UPDATE_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

// Delete prescription
export const deletePrescription = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRESCRIPTION_DELETE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete(`/api/prescriptions/${id}`, config);

    dispatch({
      type: PRESCRIPTION_DELETE_SUCCESS,
    });
  } catch (error) {
    dispatch({
      type: PRESCRIPTION_DELETE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Upload prescription image
export const uploadPrescriptionImage = (file) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRESCRIPTION_UPLOAD_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const formData = new FormData();
    formData.append('prescription', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(
      '/api/prescriptions/upload',
      formData,
      config
    );

    dispatch({
      type: PRESCRIPTION_UPLOAD_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    dispatch({
      type: PRESCRIPTION_UPLOAD_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    throw error;
  }
};
