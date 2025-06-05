import axios from "axios";

export const getJobStatus = async (jobId: string | number) => {
  const response = await axios.get(`/api/job/${jobId}/`);
  return response.data;
};

export const uploadImage = async (formData: FormData) => {
  const response = await axios.post("/api/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
