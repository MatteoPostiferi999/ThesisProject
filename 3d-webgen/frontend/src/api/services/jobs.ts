import { apiClient } from '../config/apiClient';

export const getJobStatus = async (jobId: number) => {
  try {
    const response = await apiClient.get(`/api/jobs/${jobId}/status/`);
    console.log('getJobStatus response:', response.data);
    return response.data;
  } catch (error) {
    console.error('getJobStatus error:', error);
    throw error;
  }
};

export const uploadImage = async (formData: FormData) => {
  try {
    const response = await apiClient.post('/api/jobs/upload/', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Upload riuscito:", response.data);
    
    const jobId = response.data.job_id;
    const imageUrl = response.data.input_image_url;
    
    return { jobId, imageUrl };
  } catch (error: any) {
    console.error("❌ Upload fallito:", error);
    throw error;
  }
};