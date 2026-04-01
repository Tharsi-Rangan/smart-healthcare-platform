import axios from "axios";
import { getToken } from "../features/auth/authStorage";

const doctorApi = axios.create({
  baseURL: "http://localhost:5002",
  headers: {
    "Content-Type": "application/json",
  },
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
  const response = await doctorApi.put("/api/doctors/profile", payload);
  return response.data;
};

export const getDoctorAvailability = async () => {
  const response = await doctorApi.get("/api/doctors/availability");
  return response.data;
};

export const updateDoctorAvailability = async (payload) => {
  const response = await doctorApi.put("/api/doctors/availability", payload);
  return response.data;
};

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

export const approveDoctor = async (doctorId) => {
  const response = await doctorApi.patch(`/api/doctors/${doctorId}/approve`);
  return response.data;
};

export const rejectDoctor = async (doctorId) => {
  const response = await doctorApi.patch(`/api/doctors/${doctorId}/reject`);
  return response.data;
};