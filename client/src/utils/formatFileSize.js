/**
 * Format bytes into human-readable file size
 * @param {number} bytes
 * @returns {string} e.g. '2.5 MB', '340 KB'
 */
export const formatFileSize = (bytes) => {
  if (bytes == null || isNaN(bytes) || bytes < 0) return '0 B';

  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const index = Math.min(i, units.length - 1);
  const size = bytes / Math.pow(k, index);

  // Show decimal only if meaningful
  return `${size % 1 === 0 ? size : size.toFixed(1)} ${units[index]}`;
};
