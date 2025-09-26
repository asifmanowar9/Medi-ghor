import {
  HEALTH_CONDITION_LIST_REQUEST,
  HEALTH_CONDITION_LIST_SUCCESS,
  HEALTH_CONDITION_LIST_FAIL,
} from '../constants/healthConditionConstants';

export const healthConditionListReducer = (
  state = { healthConditions: [] },
  action
) => {
  switch (action.type) {
    case HEALTH_CONDITION_LIST_REQUEST:
      return { loading: true, healthConditions: [] };
    case HEALTH_CONDITION_LIST_SUCCESS:
      return { loading: false, healthConditions: action.payload };
    case HEALTH_CONDITION_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};
