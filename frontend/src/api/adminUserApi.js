import axios from "axios";
import { getToken } from "../features/auth/authStorage";

const adminUserApi = axios.create({
  baseURL: "http://localhost:5001",
});

adminUserApi.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getAllUsers = async (params = {}) => {
  const response = await adminUserApi.get("/api/admin/users", {
    params,
  });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await adminUserApi.get(`/api/admin/users/${userId}`);
  return response.data;
};

export const updateUserStatus = async (userId, payload) => {
  const response = await adminUserApi.patch(
    `/api/admin/users/${userId}/status`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export default adminUserApi;