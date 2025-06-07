import axios from "axios";

export const loginUser = async (credentials: any) => {
  const response = await axios.post("/api/users/login/", credentials);
  return response.data;  
};

export const registerUser = async (formData: any) => {
  const response = await axios.post("/api/users/auth/register/", formData);
  return response.data;
};