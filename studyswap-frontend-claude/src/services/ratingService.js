import { get, post, put, patch, del } from './api';
export const ratingService = {
  rate: (resourceId, rating) => put(`/resources/${resourceId}/rating`, { rating }),
  reviews: (resourceId) => get(`/resources/${resourceId}/reviews`),
  addReview: (resourceId, comment) => post(`/resources/${resourceId}/reviews`, { comment }),
  editReview: (id, comment) => patch(`/reviews/${id}`, { comment }),
  deleteReview: (id) => del(`/reviews/${id}`),
};
