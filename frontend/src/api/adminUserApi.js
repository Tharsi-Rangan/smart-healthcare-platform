import apiClient from "../services/apiClient";

export const getAllUsers = async (params = {}) => {
  const response = await apiClient.get("/api/admin/users", {
    params,
  });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await apiClient.get(`/api/admin/users/${userId}`);
  return response.data;
};

export const updateUserStatus = async (userId, payload) => {
  const response = await apiClient.patch(
    `/api/admin/users/${userId}/status`,
    payload
  );
  return response.data;
};

export const getAllTransactions = async () => {
  const response = await apiClient.get("/api/payments/admin/all");
  return response.data;
};