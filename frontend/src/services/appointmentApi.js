import axios from "axios";
import { getToken } from "../features/auth/authStorage";

const appointmentClient = axios.create({
  baseURL: import.meta.env.VITE_APPOINTMENT_API_URL || "http://localhost:5000",
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

// ======================== PATIENT ENDPOINTS ========================

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

// Alias for consistency with source
export const getPatientAppointments = async (token) => {
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

export const rescheduleAppointment = async (appointmentId, payload, token) => {
  const response = await appointmentClient.put(
    `/api/appointments/${appointmentId}/reschedule`,
    payload,
    getAuthConfig(token)
  );
  return response.data;
};

// ======================== DOCTOR ENDPOINTS ========================

export const getDoctorAppointments = async (token) => {
  const response = await appointmentClient.get(
    "/api/appointments/doctor/my",
    getAuthConfig(token)
  );
  return response.data;
};

export const confirmAppointment = async (appointmentId, token) => {
  const response = await appointmentClient.patch(
    `/api/appointments/${appointmentId}/confirm`,
    {},
    getAuthConfig(token)
  );
  return response.data;
};

export const completeAppointment = async (appointmentId, notes = "", token) => {
  const response = await appointmentClient.patch(
    `/api/appointments/${appointmentId}/complete`,
    { notes },
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

// ======================== CANCEL (PATIENT OR DOCTOR) ========================

export const cancelAppointment = async (appointmentId, reason = "", token) => {
  const response = await appointmentClient.put(
    `/api/appointments/${appointmentId}/cancel`,
    { reason },
    getAuthConfig(token)
  );
  return response.data;
};

// ======================== ADMIN ENDPOINTS ========================

export const getAllAppointmentsAdmin = async (params = {}, token) => {
  const response = await appointmentClient.get(
    "/api/appointments/admin/all",
    {
      ...getAuthConfig(token),
      params,
    }
  );
  return response.data;
};

export const getAppointmentStats = async (token) => {
  const response = await appointmentClient.get(
    "/api/appointments/admin/stats",
    getAuthConfig(token)
  );
  return response.data;
};

export const updateAppointmentPaymentStatus = async (
  appointmentId,
  paymentId,
  paymentStatus,
  token
) => {
  const response = await appointmentClient.patch(
    `/api/appointments/${appointmentId}/payment-status`,
    { paymentId, paymentStatus },
    getAuthConfig(token)
  );
  return response.data;
};