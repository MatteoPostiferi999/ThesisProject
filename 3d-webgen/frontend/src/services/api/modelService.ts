// src/services/api/modelService.ts
import axios from "axios";
import { GeneratedModel } from "@/types/models"; 

// Ottieni base URL dall'environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getUserModels = async (params?: {
  model_name?: string;
  order?: string;
}): Promise<GeneratedModel[]> => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No auth token found.");
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/api/generated-models/my-models/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params, 
    });

    console.log('getUserModels response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('getUserModels error:', error);
    throw error;
  }
};

export const deleteModel = async (id: number) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No auth token found.");
  }

  try {
    const res = await axios.delete(`${API_BASE_URL}/api/generated-models/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    console.error('deleteModel error:', error);
    throw error;
  }
};