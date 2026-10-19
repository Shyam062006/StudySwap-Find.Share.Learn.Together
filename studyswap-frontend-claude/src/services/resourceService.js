import { get, patch, del, request, uploadForm } from './api';

export const resourceService = {
  list: (params) => get('/resources', params),               // -> { data: [], pagination }
  get: (id) => get(`/resources/${id}`),                      // -> { data: resource }
  mine: (params) => get('/users/me/resources', params),
  // Builds multipart/form-data. `file` is sent as the real file part.
  upload: (values, file, onProgress) => {
    const form = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (k === 'tags') form.append('tags', JSON.stringify(v));
      else form.append(k, v);
    });
    form.append('file', file);
    return uploadForm('/resources', form, { onProgress });
  },
  update: (id, payload) => patch(`/resources/${id}`, payload),
  remove: (id) => del(`/resources/${id}`),
  // Downloads through the real endpoint (cookie auth) and saves the blob.
  async download(id, fallbackName = 'studyswap-resource') {
    const res = await request(`/resources/${id}/download`, { raw: true });
    const cd = res.headers.get('Content-Disposition') || '';
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href; a.download = match ? decodeURIComponent(match[1]) : fallbackName;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(href);
  },
};
