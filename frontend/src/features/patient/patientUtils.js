import { FILE_BASE_URL } from "./patientConstants";

/**
 * Returns initials from a full name string.
 * e.g. "John Doe" => "JD", "" => "P"
 */
export const getInitials = (name) => {
  if (!name) return "P";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
};

/**
 * Resolves a stored image path to a full URL.
 * Handles both absolute URLs and local /uploads/... paths.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `${FILE_BASE_URL}${imagePath}`;
};

/**
 * Resolves a report file path to a full URL.
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return "";
  return `${FILE_BASE_URL}${filePath}`;
};

/**
 * Formats a date string or ISO date to a readable local date string.
 * e.g. "2024-03-15T00:00:00.000Z" => "15/03/2024"
 */
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

/**
 * Formats a file size in bytes to a readable KB string.
 * e.g. 204800 => "200.0 KB"
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return "-";
  return `${(bytes / 1024).toFixed(1)} KB`;
};

/**
 * Maps an ISO date string to a form-compatible YYYY-MM-DD string.
 * Returns "" if not provided.
 */
export const toDateInputValue = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};
