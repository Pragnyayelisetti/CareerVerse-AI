import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT to every request if present ──────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto-logout on 401 ──────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cv_token');
      localStorage.removeItem('cv_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/* ════════════════════════════════════════════════
   AUTH API CALLS
   ════════════════════════════════════════════════ */

/**
 * Step 1 of signup — create account + triggers OTP send automatically.
 * @param {{ full_name, username, mobile, password, confirm_password }} data
 */
export const signup = (data) =>
  api.post('/auth/signup', data).then((r) => r.data);

/**
 * Step 1 of login — verify credentials. If valid, backend sends OTP.
 * @param {{ username, password, mobile }} data
 */
export const login = (data) =>
  api.post('/auth/login', data).then((r) => r.data);

/**
 * Step 2 — submit OTP entered by user.
 * Returns { access_token } for 'login' purpose.
 * @param {string} mobile
 * @param {string} otp
 * @param {'login'|'signup'|'forgot'} purpose
 */
export const verifyOTP = (mobile, otp, purpose) =>
  api.post('/auth/verify-otp', { mobile, otp, purpose }).then((r) => {
    if (purpose === 'login' && r.data.access_token) {
      localStorage.setItem('cv_token', r.data.access_token);
    }
    return r.data;
  });

/**
 * Resend / send OTP independently (forgot password step 1).
 * @param {string} mobile
 * @param {'login'|'signup'|'forgot'} purpose
 */
export const sendOTP = (mobile, purpose) =>
  api.post('/auth/send-otp', { mobile, purpose }).then((r) => r.data);

/**
 * Complete forgot-password flow — verify OTP + set new password in one call.
 * @param {{ mobile, otp, new_password }} data
 */
export const forgotPassword = (data) =>
  api.post('/auth/forgot-password', data).then((r) => r.data);

/**
 * Fetch the currently logged-in user (requires valid JWT).
 */
export const getMe = () =>
  api.get('/auth/me').then((r) => r.data);

/**
 * Client-side logout — clears stored token.
 */
export const logout = () => {
  localStorage.removeItem('cv_token');
  localStorage.removeItem('cv_user');
};

export default api;