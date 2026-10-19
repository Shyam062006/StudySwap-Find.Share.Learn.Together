import { get, post, del } from './api';
export const bookmarkService = {
  list: (params) => get('/bookmarks', params), // -> { data: [resource] }
  add: (resourceId) => post(`/bookmarks/${resourceId}`),
  remove: (resourceId) => del(`/bookmarks/${resourceId}`),
};
