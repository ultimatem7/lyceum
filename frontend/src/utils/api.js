import axios from 'axios';

const API = axios.create({
  // Point to your active Render backend
  baseURL: 'https://lyceum-final.onrender.com'  // ← Use your actual URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
