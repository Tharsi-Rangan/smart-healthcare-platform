import axios from "axios";
import { getToken } from "../features/auth/authStorage";

const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to automatically add the token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    // Debug log to ensure this runs
    console.log("Adding Token to Request:", token ? "Yes" : "No");

    if (token) {
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