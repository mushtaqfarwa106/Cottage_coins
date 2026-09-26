import apiClient from "@/lib/api";

export const aiForecastAPI = {
  generate: async () => {
    const response = await apiClient.post("/ai-forecast", {});
    return response.data;
  },
};
