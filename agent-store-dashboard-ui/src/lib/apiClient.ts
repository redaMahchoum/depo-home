import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8445/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor for global error handling (e.g., 401 redirects)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: Handle 401 Unauthorized - redirect to login
    if (error.response && error.response.status === 401) {
      // Clear token, redirect to login page
      localStorage.removeItem('token');
      // Ensure this doesn't cause infinite loops if login page itself uses apiClient
      if (window.location.pathname !== '/login') {
         window.location.href = '/login'; // Or use react-router navigation
      }
    }
    // You might want to customize error handling further
    // e.g., for 403 Forbidden, specific error formats, etc.
    return Promise.reject(error);
  }
);


export default apiClient; 