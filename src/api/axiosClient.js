import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

let tokenStore = {
  getToken: () => localStorage.getItem('token'),
  setToken: (t) => localStorage.setItem('token', t || ''),
  clear: () => localStorage.removeItem('token'),
};

export const setTokenStore = (store) => {
  tokenStore = store;
};

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

axiosClient.interceptors.request.use((config) => {
  if (config && config.skipAuth) {
    return config;
  }
  const token = tokenStore.getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error?.response?.status === 401) {
      tokenStore.clear();
      // Allow caller to handle redirect
    }
    return Promise.reject(error);
  }
);

export default axiosClient;


