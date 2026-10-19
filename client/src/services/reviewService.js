import api from './api';

export const getReviews = async (resourceId) => {
  const response = await api.get(`/resources/${resourceId}/reviews`);
  return response.data;
};

export const createReview = async (resourceId, data) => {
  const response = await api.post(`/resources/${resourceId}/reviews`, data);
  return response.data;
};

export const updateReview = async (reviewId, data) => {
  const response = await api.patch(`/reviews/${reviewId}`, data);
  return response.data;
};

export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};
