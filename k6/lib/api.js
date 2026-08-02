// wraps each API endpoint with its http call + a check() on status/response shape
import http from 'k6/http';
import { check } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function safeJson(res) {
  try {
    return res.json();
  } catch (e) {
    return null;
  }
}

// POST /api/auth/register
export function register(user, tags) {
  const payload = JSON.stringify({
    full_name: user.full_name,
    email: user.email,
    course: user.course,
    password: user.password,
    security_question: user.security_question,
    security_answer: user.security_answer,
  });
  const res = http.post(`${BASE_URL}/api/auth/register`, payload, {
    headers: JSON_HEADERS,
    tags: Object.assign({ endpoint: 'auth_register' }, tags),
  });
  const body = safeJson(res);
  check(res, {
    'register: status is 201': (r) => r.status === 201,
    'register: response has message': () => !!(body && typeof body.message === 'string'),
  });
  return res;
}

// POST /api/auth/login
export function login(email, password, tags) {
  const payload = JSON.stringify({ email, password });
  const res = http.post(`${BASE_URL}/api/auth/login`, payload, {
    headers: JSON_HEADERS,
    tags: Object.assign({ endpoint: 'auth_login' }, tags),
  });
  const body = safeJson(res);
  check(res, {
    'login: status is 200': (r) => r.status === 200,
    'login: response has userId and name': () =>
      !!(body && typeof body.userId !== 'undefined' && typeof body.name === 'string'),
  });
  return res;
}

// POST /api/auth/logout
export function logout(tags) {
  const res = http.post(`${BASE_URL}/api/auth/logout`, null, {
    tags: Object.assign({ endpoint: 'auth_logout' }, tags),
  });
  const body = safeJson(res);
  check(res, {
    'logout: status is 200': (r) => r.status === 200,
    'logout: response has message': () => !!(body && typeof body.message === 'string'),
  });
  return res;
}

// GET /api/profile/search?keyword=...&location=...
export function searchProfiles(keyword, location, tags) {
  let url = `${BASE_URL}/api/profile/search?keyword=${encodeURIComponent(keyword)}`;
  if (location) {
    url += `&location=${encodeURIComponent(location)}`;
  }
  const res = http.get(url, { tags: Object.assign({ endpoint: 'profile_search' }, tags) });
  const body = safeJson(res);
  check(res, {
    'search: status is 200': (r) => r.status === 200,
    'search: response has results array': () => !!(body && Array.isArray(body.results)),
  });
  return res;
}

// GET /api/profile/browse-all?page=...&limit=...
export function browseAll(page, limit, tags) {
  const params = [];
  if (page) params.push(`page=${page}`);
  if (limit) params.push(`limit=${limit}`);
  const qs = params.length ? `?${params.join('&')}` : '';
  const res = http.get(`${BASE_URL}/api/profile/browse-all${qs}`, {
    tags: Object.assign({ endpoint: 'profile_browse_all' }, tags),
  });
  const body = safeJson(res);
  check(res, {
    'browse-all: status is 200': (r) => r.status === 200,
    'browse-all: response has results/total/page/totalPages': () =>
      !!(
        body &&
        Array.isArray(body.results) &&
        typeof body.total === 'number' &&
        typeof body.page === 'number' &&
        typeof body.totalPages === 'number'
      ),
  });
  return res;
}

// PUT /api/profile/update
export function updateProfile(profile, tags) {
  const payload = JSON.stringify({
    course: profile.course,
    modules: profile.modules,
    study_location: profile.study_location,
    bio: profile.bio,
  });
  const res = http.put(`${BASE_URL}/api/profile/update`, payload, {
    headers: JSON_HEADERS,
    tags: Object.assign({ endpoint: 'profile_update' }, tags),
  });
  const body = safeJson(res);
  check(res, {
    'profile update: status is 200': (r) => r.status === 200,
    'profile update: response has message': () => !!(body && typeof body.message === 'string'),
  });
  return res;
}

// POST /api/connections/request
export function sendConnectionRequest(receiverId, tags) {
  const payload = JSON.stringify({ receiverId });
  const res = http.post(`${BASE_URL}/api/connections/request`, payload, {
    headers: JSON_HEADERS,
    tags: Object.assign({ endpoint: 'connections_request' }, tags),
    // 400 = duplicate request, still a valid outcome not a failure
    responseCallback: http.expectedStatuses(201, 400),
  });
  const body = safeJson(res);
  check(res, {
    'connection request: status is 201 or 400': (r) => r.status === 201 || r.status === 400,
    'connection request: response has message': () => !!(body && typeof body.message === 'string'),
  });
  return res;
}

// GET /api/connections/dashboard
export function getDashboard(tags) {
  const res = http.get(`${BASE_URL}/api/connections/dashboard`, {
    tags: Object.assign({ endpoint: 'connections_dashboard' }, tags),
  });
  const body = safeJson(res);
  check(res, {
    'dashboard: status is 200': (r) => r.status === 200,
    'dashboard: response has pending/sent/confirmed arrays': () =>
      !!(body && Array.isArray(body.pending) && Array.isArray(body.sent) && Array.isArray(body.confirmed)),
  });
  return res;
}

// PUT /api/connections/:id/accept
export function acceptConnection(connectionId, tags) {
  const res = http.put(`${BASE_URL}/api/connections/${connectionId}/accept`, null, {
    tags: Object.assign({ endpoint: 'connections_accept' }, tags),
  });
  const body = safeJson(res);
  check(res, {
    // 404 = request not found, can happen if it's not addressed to this user
    'accept connection: status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'accept connection: response has message': () => !!(body && typeof body.message === 'string'),
  });
  return res;
}

// GET /api/settings
export function getSettings(tags) {
  const res = http.get(`${BASE_URL}/api/settings`, {
    tags: Object.assign({ endpoint: 'settings_get' }, tags),
  });
  const body = safeJson(res);
  check(res, {
    'settings: status is 200': (r) => r.status === 200,
    'settings: response has theme field': () => !!(body && typeof body.theme === 'string'),
  });
  return res;
}
