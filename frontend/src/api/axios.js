import axios from 'axios';

// Create base URL for production vs development
const baseURL =
  process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

const instance = axios.create({
  baseURL,
});

export default instance;
