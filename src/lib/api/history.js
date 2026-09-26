import apiClient from "@/lib/api";

export const historyAPI = {
  getHistory: async (params) => {
    const response = await apiClient.get("/history", { params });
    return response.data;
  },
};
