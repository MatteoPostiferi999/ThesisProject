import { apiClient } from '../config/apiClient';
import { GeneratedModel } from "@/types/models"; 

export const getUserModels = async (params?: {
  model_name?: string;
  order?: string;
}): Promise<GeneratedModel[]> => {
  try {
    const response = await apiClient.get('/api/generated-models/my-models/', {
      params, 
    });

    console.log('getUserModels response:', response.data);
    return response.data;
  } catch (error) {
    console.error('getUserModels error:', error);
    throw error;
  }
};

export const deleteModel = async (id: number) => {
  try {
    const response = await apiClient.delete(`/api/generated-models/${id}/`);
    return response.data;
  } catch (error) {
    console.error('deleteModel error:', error);
    throw error;
  }
};