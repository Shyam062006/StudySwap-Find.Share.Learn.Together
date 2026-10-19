import { get, patch } from './api';
export const notificationService = {
  list: () => get('/notifications'), // -> { data: [], unreadCount }
  markRead: (id) => patch(`/notifications/${id}/read`),
  markAllRead: () => patch('/notifications/read-all'),
};
