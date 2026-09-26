import apiClient from "@/lib/api";

export const transactionsAPI = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get("/transactions", { params: filters });
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post("/transactions", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/transactions/${id}`);
    return response.data;
  },
};
