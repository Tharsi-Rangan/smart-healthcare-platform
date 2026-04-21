import axios from "axios";
import { getToken } from "../features/auth/authStorage";

const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

const publicAuthPaths = [
  "/api/auth/login",
  "/api/auth/register/patient",
  "/api/auth/register/doctor",
  "/api/auth/verify-email-otp",
  "/api/auth/resend-email-otp",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

// Add a request interceptor to automatically add the token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    const requestPath = new URL(config.url || "", config.baseURL).pathname;

    if (token && !publicAuthPaths.includes(requestPath)) {
      // Modern Axios method to guarantee headers are set
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
