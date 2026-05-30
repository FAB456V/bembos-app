import api from './api';

export async function login(credentials) {
  const response = await api.post('/auth/login', credentials);
  return response.data;
}

export async function register(userData) {
  const response = await api.post('/auth/register', userData);
  return response.data;
}

export async function getProfile() {
  const response = await api.get('/auth/profile');
  return response.data.user;
}
