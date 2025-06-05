import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/services/api/authService"; 

const LoginForm = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const data = await loginUser(credentials); // <-- chiamata pulita
    const token = data.token;

    // Salva il token nel localStorage per sessione utente
    localStorage.setItem("authToken", token);
    toast.success("Login successful!");
    console.log("Logged in user:", data);
    navigate("/home");


  } catch (error: any) {
    console.error("Login error:", error);
    console.log("Server response:", error.response?.data); 
    toast.error("Login failed. Check your credentials.");
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="username"
        name="username"
        placeholder="Username"
        value={credentials.username}
        onChange={handleChange}
        className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={credentials.password}
        onChange={handleChange}
        className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700"
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
