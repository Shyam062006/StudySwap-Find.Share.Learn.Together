import api from './api';

export const getMe = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateMe = async (data) => {
  const response = await api.patch('/users/me', data);
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await api.get('/leaderboard');
  return response.data;
};
