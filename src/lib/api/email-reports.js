import apiClient from "@/lib/api";

export const emailReportsAPI = {
  getSettings: async () => {
    const response = await apiClient.get("/email-reports/settings");
    return response.data;
  },
  saveSettings: async (payload) => {
    const response = await apiClient.post("/email-reports/settings", payload);
    return response.data;
  },
  sendNow: async (period) => {
    const response = await apiClient.post("/email-reports/send", { period });
    return response.data;
  },
  getHistory: async () => {
    const response = await apiClient.get("/email-reports/history");
    return response.data;
  },
  resend: async (payload) => {
    const response = await apiClient.post("/email-reports/resend", payload);
    return response.data;
  },
};
