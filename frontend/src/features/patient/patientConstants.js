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

export const HEALTH_INSIGHTS = [
  {
    id: 1,
    title: "Hydration Hero",
    text: "Drinking enough water helps your heart pump blood more easily and keeps your brain sharp!",
    category: "General",
  },
  {
    id: 2,
    title: "Sleep Foundation",
    text: "Did you know? Consistent sleep helps your immune system fight off viruses and bacteria.",
    category: "General",
  },
  {
    id: 3,
    title: "Movement Minute",
    text: "Just 10 minutes of light stretching can improve your circulation and lower stress levels.",
    category: "General",
  },
  {
    id: 4,
    title: "Fruit Fuel",
    text: "Seasonal fruits are packed with antioxidants that help repair cells and boost skin health.",
    category: "Nutrition",
  },
  {
    id: 5,
    title: "Breathe Deep",
    text: "Taking three deep breaths can instantly calm your nervous system and lower cortisol.",
    category: "Wellness",
  },
];

export const FILE_BASE_URL = "http://localhost:5002";
