import apiClient from "./apiClient";
import { getToken } from "../features/auth/authStorage";

const buildAuthHeaders = (headers = {}) => {
  const token = getToken();

  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};

const requestSymptomApi = async (config) => {
  const requestConfig = {
    ...config,
    headers: buildAuthHeaders(config.headers),
  };

  return apiClient({
    ...requestConfig,
    url: `/api/symptoms${config.url}`,
  });
};

export const analyzeSymptoms = async (payload) => {
  const response = await requestSymptomApi({
    method: "post",
    url: "/analyze",
    data: payload,
  });

  return response.data;
};

export const getSymptomHistory = async () => {
  const response = await requestSymptomApi({
    method: "get",
    url: "/history",
  });

  return response.data;
};

export const deleteSymptomHistory = async () => {
  const response = await requestSymptomApi({
    method: "delete",
    url: "/history",
  });

  return response.data;
};

export const deleteSymptomById = async (id) => {
  const response = await requestSymptomApi({
    method: "delete",
    url: `/${id}`,
  });

  return response.data;
};
