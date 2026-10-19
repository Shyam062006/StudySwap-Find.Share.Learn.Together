import api from './api';

export const submitReport = async (resourceId, data) => {
  const response = await api.post(`/resources/${resourceId}/reports`, data);
  return response.data;
};
