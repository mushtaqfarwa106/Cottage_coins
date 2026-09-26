import apiClient from "@/lib/api";

export const reportsAPI = {
  getReport: async (params = {}) => {
    const response = await apiClient.get("/reports", { params });
    return response.data;
  },
};
