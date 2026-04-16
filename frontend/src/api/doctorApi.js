import apiClient from "../services/apiClient";

const DOCTOR_BASE = "/api/doctors";

/* Public doctor routes */
export const getPublicDoctors = async () => {
  const response = await apiClient.get(`${DOCTOR_BASE}/public`);
  return response.data;
};

export const getPublicDoctorById = async (doctorId) => {
  const response = await apiClient.get(`${DOCTOR_BASE}/public/${doctorId}`);
  return response.data;
};

/* Doctor profile */
export const getDoctorProfile = async () => {
  const response = await apiClient.get(`${DOCTOR_BASE}/profile`);
  return response.data;
};

export const updateDoctorProfile = async (payload) => {
  const isFormData = payload instanceof FormData;

  const response = await apiClient.put(`${DOCTOR_BASE}/profile`, payload, {
    headers: isFormData ? {} : { "Content-Type": "application/json" },
  });

  return response.data;
};

/* Doctor availability */
export const getDoctorAvailability = async () => {
  const response = await apiClient.get(`${DOCTOR_BASE}/availability`);
  return response.data;
};

export const updateDoctorAvailability = async (payload) => {
  const response = await apiClient.put(`${DOCTOR_BASE}/availability`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

/* Doctor appointments */
export const getDoctorAppointments = async () => {
  const response = await apiClient.get(`/api/appointments/doctor/my`);
  return response.data;
};

export const createDoctorAppointment = async (payload) => {
  const response = await apiClient.post(`${DOCTOR_BASE}/appointments`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const updateDoctorAppointmentStatus = async (appointmentId, status) => {
  const response = await apiClient.put(
    `/api/appointments/${appointmentId}/status`,
    { status },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

/* Doctor reports */
export const getPatientReports = async () => {
  const response = await apiClient.get(`${DOCTOR_BASE}/reports`);
  return response.data;
};

export const getPatientReportById = async (reportId) => {
  const response = await apiClient.get(`${DOCTOR_BASE}/reports/${reportId}`);
  return response.data;
};

export const createPatientReport = async (payload) => {
  const response = await apiClient.post(`${DOCTOR_BASE}/reports`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

/* Doctor prescriptions */
export const getPrescriptions = async () => {
  const response = await apiClient.get(`${DOCTOR_BASE}/prescriptions`);
  return response.data;
};

export const createPrescription = async (payload) => {
  const response = await apiClient.post(`${DOCTOR_BASE}/prescriptions`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

/* Admin routes */
export const getAdminDashboardSummary = async () => {
  const response = await apiClient.get(`${DOCTOR_BASE}/admin/dashboard`);
  return response.data;
};

export const getPendingDoctors = async () => {
  const response = await apiClient.get(`${DOCTOR_BASE}/pending`);
  return response.data;
};

export const getAllDoctors = async () => {
  const response = await apiClient.get(`${DOCTOR_BASE}`);
  return response.data;
};

export const getDoctorById = async (doctorId) => {
  const response = await apiClient.get(`${DOCTOR_BASE}/${doctorId}`);
  return response.data;
};

export const approveDoctor = async (doctorId, payload = {}) => {
  const response = await apiClient.patch(
    `${DOCTOR_BASE}/${doctorId}/approve`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const rejectDoctor = async (doctorId, payload) => {
  const response = await apiClient.patch(
    `${DOCTOR_BASE}/${doctorId}/reject`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const toggleDoctorActiveStatus = async (doctorId, payload = {}) => {
  const response = await apiClient.patch(
    `${DOCTOR_BASE}/${doctorId}/toggle-active`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};