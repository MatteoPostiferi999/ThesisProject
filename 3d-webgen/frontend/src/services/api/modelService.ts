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

export const deleteModel = async (id: number) => {
  const token = localStorage.getItem("authToken");

  const res = await axios.delete(`/api/generated-models/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
