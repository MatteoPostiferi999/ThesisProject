import { useState } from "react";
import axios from "axios";
import { toast } from "sonner"; // se vuoi mostrare notifiche

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
      const response = await axios.post("http://localhost:8000/api/users/register/", formData);
      toast.success("Registration successful!");
      console.log("Registered user:", response.data);
      onSuccess();

    } catch (error: any) {
      console.error("Registration failed:", error);
      console.error("Registration failed2:", error.response?.data || error.message);

      toast.error("Registration failed. Please check your input.");
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
