import { get, post, patch } from './api';
export const reportService = {
  create: (resourceId, payload) => post(`/resources/${resourceId}/reports`, payload), // { reason, details }
  adminList: (params) => get('/admin/reports', params),
  adminUpdate: (id, payload) => patch(`/admin/reports/${id}`, payload),
  // Admin endpoints for moderation, stats and users
  stats: () => get('/admin/stats'),
  pending: (params) => get('/admin/resources/pending', params),
  moderate: (id, payload) => patch(`/admin/resources/${id}/moderation`, payload), // { status, reason }
  users: (params) => get('/admin/users', params),
  setUserStatus: (id, status) => patch(`/admin/users/${id}/status`, { status }),
};
