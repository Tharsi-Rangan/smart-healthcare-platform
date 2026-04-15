import apiClient from "./apiClient";

export const registerPatient = async (payload) => {
  const response = await apiClient.post("/api/auth/register/patient", payload);
  return response.data;
};

export const registerDoctor = async (payload) => {
  const response = await apiClient.post("/api/auth/register/doctor", payload);
  return response.data;
};

export const verifyEmailOtp = async (payload) => {
  const response = await apiClient.post("/api/auth/verify-email-otp", payload);
  return response.data;
};

export const resendEmailOtp = async (payload) => {
  const response = await apiClient.post("/api/auth/resend-email-otp", payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await apiClient.post("/api/auth/login", payload);
  return response.data;
};

export const forgotPassword = async (payload) => {
  const response = await apiClient.post("/api/auth/forgot-password", payload);
  return response.data;
};

export const resetPassword = async (payload) => {
  const response = await apiClient.post("/api/auth/reset-password", payload);
  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await apiClient.get("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};