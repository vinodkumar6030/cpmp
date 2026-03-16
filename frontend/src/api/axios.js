import axios from 'axios';

const api = axios.create({
  baseURL: "https://cpmp.onrender.com/api",
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cm_token');
      localStorage.removeItem('cm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
