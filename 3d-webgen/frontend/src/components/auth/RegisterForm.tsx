import { useState } from "react";
import axios from "axios";
import { toast } from "sonner"; 
import { registerUser } from "@/services/api/authService"; 


type RegisterFormProps = {
  onSuccess: () => void;
};

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const data = await registerUser(formData);

    toast.success("Registration successful!");
    console.log("Registered user:", data);

    onSuccess(); // es. redirect alla login
  } catch (error: any) {
    console.error("Registration failed:", error);
    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);
    toast.error("Registration failed.");
  } finally {
    setLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="username"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
        className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
        className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
};

export default RegisterForm;
