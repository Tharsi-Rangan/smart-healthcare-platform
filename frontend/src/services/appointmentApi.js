import axios from "axios";
import { getToken } from "../features/auth/authStorage";

const appointmentClient = axios.create({
  baseURL: import.meta.env.VITE_APPOINTMENT_API_URL || "http://localhost:5003",
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthConfig = (token) => {
  const authToken = token || getToken();

  if (!authToken) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };
};

export const createAppointment = async (payload, token) => {
  const response = await appointmentClient.post(
    "/api/appointments",
    payload,
    getAuthConfig(token)
  );
  return response.data;
};

export const getMyAppointments = async (token) => {
  const response = await appointmentClient.get(
    "/api/appointments/my",
    getAuthConfig(token)
  );
  return response.data;
};

export const getAppointmentById = async (appointmentId, token) => {
  const response = await appointmentClient.get(
    `/api/appointments/${appointmentId}`,
    getAuthConfig(token)
  );
  return response.data;
};

export const cancelAppointment = async (appointmentId, token) => {
  const response = await appointmentClient.put(
    `/api/appointments/${appointmentId}/cancel`,
    {},
    getAuthConfig(token)
  );
  return response.data;
};

export const rescheduleAppointment = async (appointmentId, payload, token) => {
  const response = await appointmentClient.put(
    `/api/appointments/${appointmentId}/reschedule`,
    payload,
    getAuthConfig(token)
  );
  return response.data;
};

export const getDoctorAppointments = async (token) => {
  const response = await appointmentClient.get(
    "/api/appointments/doctor/my",
    getAuthConfig(token)
  );
  return response.data;
};

export const updateAppointmentStatus = async (appointmentId, payload, token) => {
  const response = await appointmentClient.put(
    `/api/appointments/${appointmentId}/status`,
    payload,
    getAuthConfig(token)
  );
  return response.data;
};