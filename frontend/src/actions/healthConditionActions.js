import axios from 'axios';
import {
  HEALTH_CONDITION_LIST_REQUEST,
  HEALTH_CONDITION_LIST_SUCCESS,
  HEALTH_CONDITION_LIST_FAIL,
} from '../constants/healthConditionConstants';

export const listHealthConditions = () => async (dispatch) => {
  try {
    dispatch({ type: HEALTH_CONDITION_LIST_REQUEST });

    const { data } = await axios.get('/api/health-conditions');

    dispatch({
      type: HEALTH_CONDITION_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: HEALTH_CONDITION_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
