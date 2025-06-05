// src/services/api/modelService.ts
import axios from "axios";
import { GeneratedModel } from "@/types/models"; // definiscilo sotto se non c'è

export const getUserModels = async (token: string): Promise<GeneratedModel[]> => {
  const response = await axios.get("/api/models/", {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};
