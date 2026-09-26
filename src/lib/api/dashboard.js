import apiClient from "@/lib/api";

export const dashboardAPI = {
  getDashboard: async () => {
    const response = await apiClient.get("/dashboard");
    return response.data;
  },
};
