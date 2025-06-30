import { apiClient, setTokens, clearTokens } from '../config/apiClient';

export const loginUser = async (credentials: any) => {
  const response = await apiClient.post("/api/users/login/", credentials);
  
  if (response.data.access && response.data.refresh) {
    setTokens(response.data.access, response.data.refresh);
  }
  
  return response.data;
};

export const registerUser = async (formData: any) => {
  const response = await apiClient.post("/api/users/auth/register/", formData);
  return response.data;
};

export const logoutUser = () => {
  clearTokens();
};