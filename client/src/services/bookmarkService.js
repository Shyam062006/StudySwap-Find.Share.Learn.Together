import api from './api';

export const getBookmarks = async () => {
  const response = await api.get('/bookmarks');
  return response.data;
};

export const addBookmark = async (resourceId) => {
  const response = await api.post(`/bookmarks/${resourceId}`);
  return response.data;
};

export const removeBookmark = async (resourceId) => {
  const response = await api.delete(`/bookmarks/${resourceId}`);
  return response.data;
};
