import { ALLOWED_EXTENSIONS, MAX_FILE_BYTES } from './constants';
import { formatFileSize } from './formatFileSize';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin({ email, password }) {
  const e = {};
  if (!EMAIL.test(email || '')) e.email = 'Enter a valid email address.';
  if (!password) e.password = 'Enter your password.';
  return e;
}

export function validateRegister(v) {
  const e = {};
  if (!v.name?.trim() || v.name.trim().length < 2) e.name = 'Enter your full name.';
  if (!EMAIL.test(v.email || '')) e.email = 'Enter a valid email address.';
  if (!v.password || v.password.length < 8) e.password = 'Use at least 8 characters.';
  else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password)) e.password = 'Include at least one letter and one number.';
  if (v.confirmPassword !== v.password) e.confirmPassword = 'Passwords do not match.';
  ['college', 'degree', 'branch'].forEach((k) => { if (!v[k]?.trim()) e[k] = 'This field is required.'; });
  if (!v.semester) e.semester = 'Choose your semester.';
  if (!v.terms) e.terms = 'Accept the terms to continue.';
  return e;
}

export function validateFile(file) {
  if (!file) return 'Choose a file to upload.';
  const ext = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return `Unsupported file type. Use ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}.`;
  if (file.size > MAX_FILE_BYTES) return `File is ${formatFileSize(file.size)}. The limit is 20 MB.`;
  return '';
}

export function validateUpload(v, file) {
  const e = {};
  if (!v.title?.trim()) e.title = 'Add a title.';
  if (!v.description?.trim()) e.description = 'Add a short description.';
  ['college', 'degree', 'branch', 'subject', 'unit'].forEach((k) => { if (!v[k]?.trim()) e[k] = 'This field is required.'; });
  if (!v.semester) e.semester = 'Choose a semester.';
  if (!v.resourceType) e.resourceType = 'Choose a resource type.';
  const fe = validateFile(file);
  if (fe) e.file = fe;
  return e;
}
