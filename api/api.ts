
import axios from 'axios';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`;
const AUTH_BASE_URL = API_URL.replace('/api', '');

const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
});

const api = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Auth
export const register = (username, password, nickname) => {
  return authApi.post('/auth/register', { username, password, nickname });
};

export const login = (username, password) => {
  return authApi.post('/auth/login', { username, password });
};

// Status
export const updateStatus = (status: string) => {
  return api.put('/status', { status });
};

export const updateMood = (mood: string) => {
  return api.put('/users/mood', { mood });
};

// Friends
export const getFriends = () => {
  return api.get('/friends');
};

export const getFriendRequests = () => {
  return api.get('/friends/requests');
};

export const searchUsers = (query: string) => {
  return api.get(`/users/search?username=${query}`);
};

export const sendFriendRequest = (userId: string) => {
  return api.post('/friends/request', { friendId: userId });
};

export const acceptFriendRequest = (requestId: string) => {
  return api.put(`/friends/accept/${requestId}`);
};

// Pokes
export const poke = (friendId: string, pokeType: string) => {
  return api.post(`/friends/${friendId}/poke`, { pokeType });
};

export const confirmAwake = () => {
  return api.post('/users/confirm-awake');
};

export default api;
