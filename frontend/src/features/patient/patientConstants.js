// Patient form dropdown options — single source of truth for all patient components

export const GENDER_OPTIONS = [
  { value: "", label: "Select Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const BLOOD_GROUP_OPTIONS = [
  { value: "", label: "Select Blood Group" },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export const MEDICAL_HISTORY_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "ongoing", label: "Ongoing" },
  { value: "resolved", label: "Resolved" },
];

export const REPORT_TYPE_OPTIONS = [
  { value: "", label: "Select Type (optional)" },
  { value: "Lab Report", label: "Lab Report" },
  { value: "Scan", label: "Scan" },
  { value: "Prescription", label: "Prescription" },
  { value: "X-Ray", label: "X-Ray" },
  { value: "Other", label: "Other" },
];

export const FILE_BASE_URL = "http://localhost:5002";
