import axios from 'axios';

// Create base URL for production vs development
// In production, use REACT_APP_API_URL environment variable
const baseURL =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL || '/api'
    : 'http://localhost:5000/api';

const instance = axios.create({
  baseURL,
});

export default instance;
