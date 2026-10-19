import api from './api';

export const rateResource = async (id, rating) => {
  const response = await api.put(`/ratings/${id}/rating`, { rating });
  return response.data;
};
