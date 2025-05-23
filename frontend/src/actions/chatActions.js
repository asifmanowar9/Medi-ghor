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
export const createChat = () => async (dispatch, getState) => {
  try {
    dispatch({ type: CHAT_CREATE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post('/api/chats', {}, config);

    dispatch({
      type: CHAT_CREATE_SUCCESS,
      payload: data,
    });

    // Save to localStorage
    const existingChats = JSON.parse(
      localStorage.getItem('chatHistory') || '[]'
    );
    localStorage.setItem(
      'chatHistory',
      JSON.stringify([...existingChats, data])
    );

    return data;
  } catch (error) {
    dispatch({
      type: CHAT_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Get list of user's chats
export const listUserChats = () => async (dispatch, getState) => {
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

    // Update localStorage with latest chats
    localStorage.setItem('chatHistory', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: CHAT_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Get chat details by ID
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

    // Update chat in localStorage
    const existingChats = JSON.parse(
      localStorage.getItem('chatHistory') || '[]'
    );
    const updatedChats = existingChats.map((chat) =>
      chat._id === data._id ? data : chat
    );
    localStorage.setItem('chatHistory', JSON.stringify(updatedChats));
  } catch (error) {
    dispatch({
      type: CHAT_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Add message to chat
export const addMessage = (chatId, content) => async (dispatch, getState) => {
  try {
    dispatch({ type: CHAT_MESSAGE_ADD_REQUEST });

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
      { content, sender: 'user' },
      config
    );

    dispatch({
      type: CHAT_MESSAGE_ADD_SUCCESS,
      payload: data,
    });

    // Update chat in localStorage
    const existingChats = JSON.parse(
      localStorage.getItem('chatHistory') || '[]'
    );
    const updatedChats = existingChats.map((chat) =>
      chat._id === data._id ? data : chat
    );
    localStorage.setItem('chatHistory', JSON.stringify(updatedChats));

    return data;
  } catch (error) {
    dispatch({
      type: CHAT_MESSAGE_ADD_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Analyze test report image
export const analyzeImage = (formData) => async (dispatch, getState) => {
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
    };

    const { data } = await axios.post('/api/chats/analyze', formData, config);

    dispatch({
      type: CHAT_IMAGE_ANALYZE_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    dispatch({
      type: CHAT_IMAGE_ANALYZE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
