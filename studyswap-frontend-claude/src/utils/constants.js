export const RESOURCE_TYPES = ['Lecture Notes', 'Previous Papers', 'Lab Manual', 'Lab Record', 'Question Bank', 'Presentation', 'Study Guide', 'Reference'];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8].map(String);
export const SORT_OPTIONS = [
  { value: 'relevant', label: 'Most relevant' },
  { value: 'downloads', label: 'Most downloaded' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'recent', label: 'Recently uploaded' },
];
export const ALLOWED_EXTENSIONS = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const PAGE_SIZE = 12;
