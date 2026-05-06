const BASE = '/api';

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const uid = localStorage.getItem('userId');
  if (uid) headers['x-user-id'] = uid;

  const res = await fetch(BASE + path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка');
  return data;
}

export function register(phone, role, tron_wallet) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, role, tron_wallet }),
  });
}

export function login(phone) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function getTasks() {
  return request('/tasks');
}

export function createTask(title, description) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });
}

export function assignTask(id) {
  return request(`/tasks/${id}/assign`, { method: 'POST' });
}

export function completeTask(id) {
  return request(`/tasks/${id}/done`, { method: 'POST' });
}

export function cancelTask(id) {
  return request(`/tasks/${id}/cancel`, { method: 'POST' });
}

export function getMe() {
  return request('/me');
}
