import axios from 'axios';
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
} from '../constants/chatConstants';

// Create a new chat
export const createChat = (title) => async (dispatch, getState) => {
  try {
    dispatch({ type: CHAT_CREATE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post('/api/chats', { title }, config);

    dispatch({
      type: CHAT_CREATE_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    dispatch({
      type: CHAT_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    throw error;
  }
};

// List user's chats
export const listChats = () => async (dispatch, getState) => {
  try {
    dispatch({ type: CHAT_LIST_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get('/api/chats', config);

    dispatch({
      type: CHAT_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    console.log('List chats error: ', error);
    console.log('Error response: ', error.response);
    dispatch({
      type: CHAT_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Get chat details
export const getChatDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: CHAT_DETAILS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/chats/${id}`, config);

    dispatch({
      type: CHAT_DETAILS_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    dispatch({
      type: CHAT_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    throw error;
  }
};

// Add message to chat
export const addMessage =
  (chatId, messageText, skipAiResponse = false, isAnalysis = false) =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: CHAT_MESSAGE_ADD_REQUEST });

      // Set a flag to show "AI is typing" indicator
      if (!skipAiResponse) {
        dispatch({
          type: 'AI_RESPONSE_WAITING',
          payload: true,
        });
      }

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
        `/api/chats/${chatId}/messages`,
        { content: messageText, skipAiResponse, isAnalysis },
        config
      );

      // Remove the "AI is typing" indicator
      if (!skipAiResponse) {
        dispatch({
          type: 'AI_RESPONSE_WAITING',
          payload: false,
        });
      }

      dispatch({
        type: CHAT_MESSAGE_ADD_SUCCESS,
        payload: data,
      });

      // Also update chat details to make sure the messages are up to date
      dispatch({
        type: CHAT_DETAILS_SUCCESS,
        payload: data,
      });

      return data;
    } catch (error) {
      console.error('Add message error:', error);

      // Remove the "AI is typing" indicator on error
      dispatch({
        type: 'AI_RESPONSE_WAITING',
        payload: false,
      });

      dispatch({
        type: CHAT_MESSAGE_ADD_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
      throw error;
    }
  };

// Analyze image using Gemini API
export const analyzeImage =
  (formData, chatId) => async (dispatch, getState) => {
    try {
      dispatch({ type: CHAT_IMAGE_ANALYZE_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
        params: {
          chatId: chatId, // Add chat ID as a parameter
        },
      };

      const { data } = await axios.post('/api/chats/analyze', formData, config);

      dispatch({
        type: CHAT_IMAGE_ANALYZE_SUCCESS,
        payload: data,
      });

      return data;
    } catch (error) {
      console.error('Image analysis error:', error);

      dispatch({
        type: CHAT_IMAGE_ANALYZE_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
      throw error;
    }
  };

export const listUserChats = listChats; // Add this alias for backward compatibility
