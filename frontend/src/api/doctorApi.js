import axios from "axios";
import { getToken } from "../features/auth/authStorage";

const doctorApi = axios.create({
  baseURL: "http://localhost:5000/api/doctors",
});

doctorApi.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getDoctorProfile = async () => {
  const response = await doctorApi.get("/profile");
  return response.data;
};

export const updateDoctorProfile = async (payload) => {
  const isFormData = payload instanceof FormData;

  const response = await doctorApi.put("/profile", payload, {
    headers: isFormData ? {} : { "Content-Type": "application/json" },
  });

  return response.data;
};

export const getDoctorAvailability = async () => {
  const response = await doctorApi.get("/availability");
  return response.data;
};

export const updateDoctorAvailability = async (payload) => {
  const response = await doctorApi.put("/availability", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const getDoctorAppointments = async () => {
  const response = await doctorApi.get("/appointments");
  return response.data;
};

export const createDoctorAppointment = async (payload) => {
  const response = await doctorApi.post("/appointments", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const updateDoctorAppointmentStatus = async (appointmentId, status) => {
  const response = await doctorApi.patch(
    `/${appointmentId}/status`,
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
  const response = await doctorApi.get("/reports");
  return response.data;
};

export const getPatientReportById = async (reportId) => {
  const response = await doctorApi.get(`/reports/${reportId}`);
  return response.data;
};

export const createPatientReport = async (payload) => {
  const response = await doctorApi.post("/reports", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const getPrescriptions = async () => {
  const response = await doctorApi.get("/prescriptions");
  return response.data;
};

export const createPrescription = async (payload) => {
  const response = await doctorApi.post("/prescriptions", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

/* Admin routes */
export const getAdminDashboardSummary = async () => {
  const response = await doctorApi.get("/admin/dashboard");
  return response.data;
};

export const getPendingDoctors = async () => {
  const response = await doctorApi.get("/pending");
  return response.data;
};

export const getAllDoctors = async () => {
  const response = await doctorApi.get("");
  return response.data;
};

export const getDoctorById = async (doctorId) => {
  const response = await doctorApi.get(`/${doctorId}`);
  return response.data;
};

export const approveDoctor = async (doctorId, payload = {}) => {
  const response = await doctorApi.patch(`/${doctorId}/approve`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const rejectDoctor = async (doctorId, payload) => {
  const response = await doctorApi.patch(`/${doctorId}/reject`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const toggleDoctorActiveStatus = async (doctorId, payload = {}) => {
  const response = await doctorApi.patch(
    `/${doctorId}/toggle-active`,
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