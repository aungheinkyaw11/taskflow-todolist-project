// =====================================================
//  frontend/src/api.js  (updated with auth)
//
//  Every request now sends the JWT token in the header:
//  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
//
//  The backend reads this token to know WHO is making
//  the request and only returns THEIR tasks.
// =====================================================

const BASE_URL = '/api';

// ── Helper: get token from localStorage ──────────────
const getToken = () => localStorage.getItem('taskflow_token');


// ── Helper: make authenticated fetch requests ─────────
async function request(url, options = {}) {
  const token = getToken();

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      // Send token with every request if available
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  // If 401, token is expired or invalid — force logout
  if (response.status === 401) {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    window.location.href = '/login'; // redirect to login
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Request failed');
  }

  return response.json();
}


// ── AUTH ──────────────────────────────────────────────

export async function registerUser(name, email, password) {
  return request(`${BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser(email, password) {
  return request(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentUser() {
  return request(`${BASE_URL}/auth/me`);
}


// ── TASKS ─────────────────────────────────────────────

export async function getTasks(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status)   params.append('status',   filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  const query = params.toString() ? `?${params}` : '';
  return request(`${BASE_URL}/tasks${query}`);
}

export async function getTask(id) {
  return request(`${BASE_URL}/tasks/${id}`);
}

export async function createTask(taskData) {
  return request(`${BASE_URL}/tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

export async function updateTask(id, updates) {
  return request(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteTask(id) {
  return request(`${BASE_URL}/tasks/${id}`, { method: 'DELETE' });
}

export async function getStats() {
  return request(`${BASE_URL}/tasks/stats/summary`);
}