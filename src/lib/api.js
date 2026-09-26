import axios from "axios";

// Create axios instance with default config
// withCredentials: true sends cookies (HTTP-only auth token) with requests
const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.error || "An error occurred";
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error("No response from server"));
    } else {
      // Something else happened
      return Promise.reject(new Error(error.message));
    }
  }
);

export default apiClient;
