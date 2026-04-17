import apiClient from './apiClient';

// Payment Service APIs
export const initiatePayment = async (payload) => {
  const response = await apiClient.post('/api/payments/initiate', payload);
  return response.data;
};

export const confirmPayment = async (payload) => {
  const response = await apiClient.post('/api/payments/confirm', payload);
  return response.data;
};

export const getPaymentStatus = async (paymentId) => {
  const response = await apiClient.get(`/api/payments/${paymentId}/status`);
  return response.data;
};

export const getPatientPayments = async () => {
  const response = await apiClient.get('/api/payments/patient/my');
  return response.data;
};

export const getAllPayments = async () => {
  const response = await apiClient.get('/api/payments/admin');
  return response.data;
};

export const approvePayment = async (paymentId, reason = '') => {
  const response = await apiClient.put(`/api/payments/${paymentId}/approve`, { reason });
  return response.data;
};

export const rejectPayment = async (paymentId, reason) => {
  const response = await apiClient.put(`/api/payments/${paymentId}/reject`, { reason });
  return response.data;
};

// Consultation Service APIs
export const generateVideoToken = async (appointmentId, userName, userRole) => {
  const response = await apiClient.post('/api/consultation/video-token', {
    appointmentId,
    userName,
    userRole,
  });
  return response.data;
};

export const getConsultationSession = async (appointmentId) => {
  const response = await apiClient.get(`/api/consultation/session/${appointmentId}`);
  return response.data;
};

export const endConsultationSession = async (appointmentId) => {
  const response = await apiClient.patch(`/api/consultation/session/${appointmentId}/end`, {});
  return response.data;
};

export const getConsultationHistory = async () => {
  const response = await apiClient.get('/api/consultation/history');
  return response.data;
};
