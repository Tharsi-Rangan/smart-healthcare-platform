import { getToken } from "../features/auth/authStorage";

const PATIENT_SERVICE_BASE_URL = "http://localhost:5000";

const buildHeaders = (extraHeaders = {}) => {
  const token = getToken();

  return {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
};

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

// Summary
export const fetchPatientSummary = async () => {
  const response = await fetch(`${PATIENT_SERVICE_BASE_URL}/api/patients/summary`, {
    method: "GET",
    headers: buildHeaders(),
  });

  if (response.status === 404) {
    return {
      success: true,
      message: "Patient profile not created yet",
      data: {
        summary: {
          profile: null,
          counts: {
            medicalHistory: 0,
            reports: 0,
          },
          latestMedicalHistory: null,
          latestReport: null,
        },
      },
    };
  }

  return handleResponse(response);
};

// Profile
export const fetchPatientProfile = async () => {
  const response = await fetch(`${PATIENT_SERVICE_BASE_URL}/api/patients/profile`, {
    method: "GET",
    headers: buildHeaders(),
  });

  if (response.status === 404) {
    return {
      success: true,
      message: "Patient profile not created yet",
      data: { profile: null },
    };
  }

  return handleResponse(response);
};

export const createPatientProfile = async (profileData) => {
  const response = await fetch(`${PATIENT_SERVICE_BASE_URL}/api/patients/profile`, {
    method: "POST",
    headers: buildHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(profileData),
  });

  return handleResponse(response);
};

export const updatePatientProfile = async (profileData) => {
  const response = await fetch(`${PATIENT_SERVICE_BASE_URL}/api/patients/profile`, {
    method: "PUT",
    headers: buildHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(profileData),
  });

  return handleResponse(response);
};

export const uploadPatientAvatar = async (formData) => {
  const response = await fetch(`${PATIENT_SERVICE_BASE_URL}/api/patients/profile/avatar`, {
    method: "PUT",
    headers: buildHeaders(),
    body: formData,
  });

  return handleResponse(response);
};

// Medical History
export const fetchMedicalHistory = async () => {
  const response = await fetch(`${PATIENT_SERVICE_BASE_URL}/api/patients/medical-history`, {
    method: "GET",
    headers: buildHeaders(),
  });

  return handleResponse(response);
};

export const createMedicalHistory = async (historyData) => {
  const response = await fetch(`${PATIENT_SERVICE_BASE_URL}/api/patients/medical-history`, {
    method: "POST",
    headers: buildHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(historyData),
  });

  return handleResponse(response);
};

export const updateMedicalHistory = async (id, historyData) => {
  const response = await fetch(
    `${PATIENT_SERVICE_BASE_URL}/api/patients/medical-history/${id}`,
    {
      method: "PUT",
      headers: buildHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(historyData),
    }
  );

  return handleResponse(response);
};

export const deleteMedicalHistory = async (id) => {
  const response = await fetch(
    `${PATIENT_SERVICE_BASE_URL}/api/patients/medical-history/${id}`,
    {
      method: "DELETE",
      headers: buildHeaders(),
    }
  );

  return handleResponse(response);
};

// Reports
export const fetchPatientReports = async () => {
  const response = await fetch(`${PATIENT_SERVICE_BASE_URL}/api/patients/reports`, {
    method: "GET",
    headers: buildHeaders(),
  });

  return handleResponse(response);
};

export const uploadPatientReport = async (formData) => {
  const response = await fetch(`${PATIENT_SERVICE_BASE_URL}/api/patients/reports`, {
    method: "POST",
    headers: buildHeaders(),
    body: formData,
  });

  return handleResponse(response);
};

export const updatePatientReport = async (id, reportData) => {
  const response = await fetch(`${PATIENT_SERVICE_BASE_URL}/api/patients/reports/${id}`, {
    method: "PUT",
    headers: buildHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(reportData),
  });

  return handleResponse(response);
};

export const replacePatientReportFile = async (id, formData) => {
  const response = await fetch(
    `${PATIENT_SERVICE_BASE_URL}/api/patients/reports/${id}/file`,
    {
      method: "PUT",
      headers: buildHeaders(),
      body: formData,
    }
  );

  return handleResponse(response);
};

export const deletePatientReport = async (id) => {
  const response = await fetch(`${PATIENT_SERVICE_BASE_URL}/api/patients/reports/${id}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });

  return handleResponse(response);
};
