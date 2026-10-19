import api from './api';

export const getStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getPendingResources = async () => {
  const response = await api.get('/admin/resources/pending');
  return response.data;
};

export const moderateResource = async (id, data) => {
  const response = await api.patch(`/admin/resources/${id}/moderation`, data);
  return response.data;
};

export const getReports = async () => {
  const response = await api.get('/admin/reports');
  return response.data;
};

export const updateReport = async (id, data) => {
  const response = await api.patch(`/admin/reports/${id}`, data);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const updateUserStatus = async (id) => {
  const response = await api.patch(`/admin/users/${id}/status`);
  return response.data;
};
