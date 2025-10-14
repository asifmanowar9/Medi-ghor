import {
  CHAT_CREATE_REQUEST,
  CHAT_CREATE_SUCCESS,
  CHAT_CREATE_FAIL,
  CHAT_LIST_REQUEST,
  CHAT_LIST_SUCCESS,
  CHAT_LIST_FAIL,
  CHAT_DETAILS_REQUEST,
  CHAT_DETAILS_SUCCESS,
  CHAT_DETAILS_FAIL,
  CHAT_MESSAGE_ADD_REQUEST,
  CHAT_MESSAGE_ADD_SUCCESS,
  CHAT_MESSAGE_ADD_FAIL,
  CHAT_IMAGE_ANALYZE_REQUEST,
  CHAT_IMAGE_ANALYZE_SUCCESS,
  CHAT_IMAGE_ANALYZE_FAIL,
  CHAT_DELETE_REQUEST,
  CHAT_DELETE_SUCCESS,
  CHAT_DELETE_FAIL,
  CHAT_UPDATE_REQUEST,
  CHAT_UPDATE_SUCCESS,
  CHAT_UPDATE_FAIL,
} from '../constants/chatConstants';

export const chatCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case CHAT_CREATE_REQUEST:
      return { loading: true };
    case CHAT_CREATE_SUCCESS:
      return { loading: false, success: true, chat: action.payload };
    case CHAT_CREATE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const chatListReducer = (state = { chats: [] }, action) => {
  switch (action.type) {
    case CHAT_LIST_REQUEST:
      return { loading: true, chats: [] };
    case CHAT_LIST_SUCCESS:
      // Handle both array response (old format) and object response (new format)
      if (Array.isArray(action.payload)) {
        return { loading: false, chats: action.payload };
      } else if (action.payload && Array.isArray(action.payload.chats)) {
        return {
          loading: false,
          chats: action.payload.chats,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          stats: action.payload.stats,
        };
      } else {
        return { loading: false, chats: [] };
      }
    case CHAT_LIST_FAIL:
      return { loading: false, error: action.payload, chats: [] };
    default:
      return state;
  }
};

export const chatDetailsReducer = (
  state = { chat: { messages: [] } },
  action
) => {
  switch (action.type) {
    case CHAT_DETAILS_REQUEST:
      return { ...state, loading: true };
    case CHAT_DETAILS_SUCCESS:
      return { loading: false, chat: action.payload };
    case CHAT_DETAILS_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const chatMessageAddReducer = (state = {}, action) => {
  switch (action.type) {
    case CHAT_MESSAGE_ADD_REQUEST:
      return { loading: true };
    case CHAT_MESSAGE_ADD_SUCCESS:
      return { loading: false, success: true, chat: action.payload };
    case CHAT_MESSAGE_ADD_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const chatImageAnalyzeReducer = (state = {}, action) => {
  switch (action.type) {
    case CHAT_IMAGE_ANALYZE_REQUEST:
      return { loading: true };
    case CHAT_IMAGE_ANALYZE_SUCCESS:
      return {
        loading: false,
        success: true,
        analysis: action.payload.analysis,
        imageUrl: action.payload.imageUrl,
      };
    case CHAT_IMAGE_ANALYZE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const chatDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case CHAT_DELETE_REQUEST:
      return { loading: true };
    case CHAT_DELETE_SUCCESS:
      return { loading: false, success: true };
    case CHAT_DELETE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const chatUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case CHAT_UPDATE_REQUEST:
      return { loading: true };
    case CHAT_UPDATE_SUCCESS:
      return { loading: false, success: true, chat: action.payload };
    case CHAT_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const aiResponseWaitingReducer = (state = false, action) => {
  switch (action.type) {
    case 'AI_RESPONSE_WAITING':
      return action.payload;
    default:
      return state;
  }
};
