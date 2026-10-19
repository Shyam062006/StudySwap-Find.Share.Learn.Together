import api from './api';

export const getResources = async (params = {}) => {
  const response = await api.get('/resources', { params });
  return response.data;
};

export const getResourceById = async (id) => {
  const response = await api.get(`/resources/${id}`);
  return response.data;
};

export const createResource = async (formData) => {
  const response = await api.post('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateResource = async (id, data) => {
  const response = await api.patch(`/resources/${id}`, data);
  return response.data;
};

export const deleteResource = async (id) => {
  const response = await api.delete(`/resources/${id}`);
  return response.data;
};

export const downloadResource = async (id) => {
  const response = await api.get(`/resources/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export const getMyResources = async () => {
  const response = await api.get('/resources/my');
  return response.data;
};
