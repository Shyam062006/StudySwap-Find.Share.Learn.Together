// Centralised API client. All network calls in the app go through here.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors; // optional field errors: { field: 'message' }
  }
}

function buildUrl(path, params) {
  const url = new URL(API_URL + path, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== '' && v != null) url.searchParams.set(k, v); });
  return url.toString();
}

async function parseError(res) {
  const data = await res.json().catch(() => null);
  if (res.status === 401) window.dispatchEvent(new Event('auth:unauthorized'));
  return new ApiError(data?.message || `Request failed (${res.status}).`, res.status, data?.errors || null);
}

// JSON / FormData request. Cookies are sent (credentials: 'include') for cookie-based auth.
export async function request(path, { method = 'GET', body, form, params, raw = false } = {}) {
  const opts = { method, credentials: 'include', headers: {} };
  if (form) opts.body = form; // browser sets multipart boundary
  else if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  let res;
  try { res = await fetch(buildUrl(path, params), opts); }
  catch { throw new ApiError('Cannot reach the server. Check your connection and that the API is running.'); }
  if (!res.ok) throw await parseError(res);
  if (raw) return res;
  if (res.status === 204) return null;
  return res.json().catch(() => null);
}

// Multipart upload with progress (fetch cannot report upload progress).
export function uploadForm(path, form, { method = 'POST', onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, buildUrl(path));
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onerror = () => reject(new ApiError('Upload failed. Cannot reach the server.'));
    xhr.onload = () => {
      let data = null;
      try { data = JSON.parse(xhr.responseText); } catch { /* non-JSON */ }
      if (xhr.status >= 200 && xhr.status < 300) return resolve(data);
      if (xhr.status === 401) window.dispatchEvent(new Event('auth:unauthorized'));
      reject(new ApiError(data?.message || `Upload failed (${xhr.status}).`, xhr.status, data?.errors || null));
    };
    xhr.send(form);
  });
}

export const get = (p, params) => request(p, { params });
export const post = (p, body) => request(p, { method: 'POST', body });
export const put = (p, body) => request(p, { method: 'PUT', body });
export const patch = (p, body) => request(p, { method: 'PATCH', body });
export const del = (p) => request(p, { method: 'DELETE' });
