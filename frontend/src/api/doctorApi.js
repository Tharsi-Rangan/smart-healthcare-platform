import axios from "axios";
import { getToken } from "../features/auth/authStorage";

const doctorApi = axios.create({
  baseURL: "http://localhost:5006",
});

doctorApi.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getDoctorProfile = async () => {
  const response = await doctorApi.get("/api/doctors/profile");
  return response.data;
};

export const updateDoctorProfile = async (payload) => {
  const isFormData = payload instanceof FormData;

  const response = await doctorApi.put("/api/doctors/profile", payload, {
    headers: isFormData ? {} : { "Content-Type": "application/json" },
  });

  return response.data;
};

export const getDoctorAvailability = async () => {
  const response = await doctorApi.get("/api/doctors/availability");
  return response.data;
};

export const updateDoctorAvailability = async (payload) => {
  const response = await doctorApi.put("/api/doctors/availability", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const getDoctorAppointments = async () => {
  const response = await doctorApi.get("/api/doctors/appointments");
  return response.data;
};

export const createDoctorAppointment = async (payload) => {
  const response = await doctorApi.post("/api/doctors/appointments", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const updateDoctorAppointmentStatus = async (appointmentId, status) => {
  const response = await doctorApi.patch(
    `/api/doctors/appointments/${appointmentId}/status`,
    { status },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const getPatientReports = async () => {
  const response = await doctorApi.get("/api/doctors/reports");
  return response.data;
};

export const getPatientReportById = async (reportId) => {
  const response = await doctorApi.get(`/api/doctors/reports/${reportId}`);
  return response.data;
};

export const createPatientReport = async (payload) => {
  const response = await doctorApi.post("/api/doctors/reports", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const getPrescriptions = async () => {
  const response = await doctorApi.get("/api/doctors/prescriptions");
  return response.data;
};

export const createPrescription = async (payload) => {
  const response = await doctorApi.post("/api/doctors/prescriptions", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

/* Admin routes */
export const getAdminDashboardSummary = async () => {
  const response = await doctorApi.get("/api/doctors/admin/dashboard");
  return response.data;
};

export const getPendingDoctors = async () => {
  const response = await doctorApi.get("/api/doctors/pending");
  return response.data;
};

export const getAllDoctors = async () => {
  const response = await doctorApi.get("/api/doctors");
  return response.data;
};

export const getDoctorById = async (doctorId) => {
  const response = await doctorApi.get(`/api/doctors/${doctorId}`);
  return response.data;
};

export const approveDoctor = async (doctorId, payload = {}) => {
  const response = await doctorApi.patch(`/api/doctors/${doctorId}/approve`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const rejectDoctor = async (doctorId, payload) => {
  const response = await doctorApi.patch(`/api/doctors/${doctorId}/reject`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const toggleDoctorActiveStatus = async (doctorId, payload = {}) => {
  const response = await doctorApi.patch(
    `/api/doctors/${doctorId}/toggle-active`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export default doctorApi;