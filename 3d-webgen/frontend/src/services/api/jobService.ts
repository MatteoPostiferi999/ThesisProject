import axios from "axios";

export const getJobStatus = async (jobId: string | number) => {
  const response = await axios.get(`/api/job/${jobId}/`);
  return response.data;
};

export const uploadImage = async (formData: FormData) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await axios.post("/api/upload/", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
