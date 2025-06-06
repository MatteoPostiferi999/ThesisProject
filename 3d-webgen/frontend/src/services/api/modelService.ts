// src/services/api/modelService.ts
import axios from "axios";
import { GeneratedModel } from "@/types/models"; 


export const getUserModels = async (): Promise<GeneratedModel[]> => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No auth token found.");
  }

  const response = await axios.get("/api/generated-models/my-models/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
