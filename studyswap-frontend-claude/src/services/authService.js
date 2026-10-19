import { get, post } from './api';
export const authService = {
  register: (payload) => post('/auth/register', payload), // -> { data: user }
  login: (payload) => post('/auth/login', payload),       // -> { data: user } + auth cookie
  logout: () => post('/auth/logout'),
  me: () => get('/auth/me'),                              // -> { data: user }
  // Not in the base contract: optional extension. See docs/API_CONTRACT.md.
  forgotPassword: (email) => post('/auth/forgot-password', { email }),
};
