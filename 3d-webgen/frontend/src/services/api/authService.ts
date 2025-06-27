import axios from "axios";

// 🔧 Environment Variable per l'URL dell'API
const API_URL = import.meta.env.VITE_API_URL || 'http://129.146.48.166:8000';

// 📡 Crea un'istanza axios con configurazione base
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondi timeout
});

// 🔐 Login function
export const loginUser = async (credentials: any) => {
  const response = await apiClient.post("/api/users/login/", credentials);
  return response.data;  
};

// 📝 Register function
export const registerUser = async (formData: any) => {
  const response = await apiClient.post("/api/users/auth/register/", formData);
  return response.data;
};

// 🚀 Esporta anche l'API client per altri servizi
export { apiClient };

// 🔍 Debug: mostra quale API URL sta usando (solo in development)
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', API_URL);
}