// api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // Log request for debugging
  console.log('API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    data: config.data
  });
  
  return config;
});

// Response interceptor for debugging
API.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default API;
