import { get, patch } from './api';
export const userService = {
  me: () => get('/users/me'),
  update: (payload) => patch('/users/me', payload),
  leaderboard: () => get('/leaderboard'),
  health: () => get('/health'),
};
