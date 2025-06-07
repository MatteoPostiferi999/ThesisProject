import axios from "axios";

export const getJobStatus = async (jobId: number) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    console.warn("Auth token not found in localStorage.");
    throw new Error("User not authenticated");
  }


  const response = await axios.get(`/api/jobs/${jobId}/status/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};


export const uploadImage = async (formData: FormData) => {
  const token = localStorage.getItem("authToken");

  console.log("🔑 Token presente in localStorage:", token);

  if (!token) {
    console.error("❌ Nessun token trovato nel localStorage.");
    throw new Error("No authentication token found");
  }

  try {
    for (let pair of formData.entries()) {
      console.log(`📤 FormData: ${pair[0]} =`, pair[1]);
    }

    const response = await axios.post("/api/jobs/upload/", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Upload riuscito:", response.data);

    const jobId = response.data.job_id;
    const imageUrl = response.data.input_image; 
    if (!imageUrl) {
      console.warn("⚠️ input_image non presente nella risposta!");
    }

    return { jobId, imageUrl };

  } catch (error: any) {
    console.error("❌ Upload fallito");
    console.error("📡 Errore Axios:", error.message);
    console.error("📋 Dettagli errore:", error.response?.data);
    console.error("📋 Status HTTP:", error.response?.status);
    throw error;
  }
};
