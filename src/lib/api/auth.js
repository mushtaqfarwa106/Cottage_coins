import apiClient from "@/lib/api";

// Auth API functions (cookie-only: token stored in HTTP-only cookie)
export const authAPI = {
  signup: async (data) => {
    const response = await apiClient.post("/auth/signup", data);
    return response.data;
  },

  login: async (data) => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  /** Fetch current user from server (reads auth from cookie) */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data.user;
    } catch {
      return null;
    }
  },
};
