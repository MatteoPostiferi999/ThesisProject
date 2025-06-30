import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/api/services/auth";
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

const LoginForm = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{username?: string; password?: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    
    // Clear errors when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const validateForm = () => {
    const newErrors: {username?: string; password?: string} = {};
    
    if (!credentials.username.trim()) {
      newErrors.username = "Username is required";
    } else if (credentials.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    if (!credentials.password) {
      newErrors.password = "Password is required";
    }
    // Rimosso il controllo sulla lunghezza minima della password

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Form submitted");

    if (!validateForm()) {
      console.log("❌ Form validation failed");
      toast.error("Please fix the errors before submitting");
      return;
    }

    console.log("✅ Form validation passed");
    setIsLoading(true);

    try {
      console.log("📡 About to call loginUser");
      toast.loading("🔐 Signing you in...", { id: "login-toast" });
      
      const data = await loginUser(credentials);
      console.log("📦 Login response:", data);
      
      localStorage.setItem("authToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      console.log("💾 Tokens saved to localStorage");
      
      toast.dismiss("login-toast");
      toast.success("🎉 Welcome back!");
      
      console.log("🚀 About to navigate to /home");
      navigate("/home");
      console.log("✅ Navigate called successfully");

    } catch (error: any) {
      console.log("💥 Login error caught:", error);
      console.log("📋 Error details:", error.response?.data);
      
      toast.dismiss("login-toast");
      toast.error("❌ Login failed");

    } finally {
      console.log("🏁 Finally block reached");
      setIsLoading(false);
    }
  };

  const getFieldIcon = (field: string, hasError: boolean) => {
    if (hasError) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (focusedField === field) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return field === 'username' ? 
      <User className="h-5 w-5 text-gray-400" /> : 
      <Lock className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="relative max-w-md mx-auto">
      
      {/* ✨ Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20 rounded-3xl blur-3xl -z-10" />
      
      <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-2xl">
        
        {/* 🎨 Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Welcome Back
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Ready for your first 3D prototype?
          </p>
        </div>

        {/* 📝 Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          
          {/* 👤 Username Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {getFieldIcon('username', !!errors.username)}
              </div>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleChange}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                autoComplete="off"
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.username
                    ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20"
                    : focusedField === 'username'
                    ? "border-blue-400 dark:border-blue-500 focus:border-blue-500 focus:ring-blue-500/20 shadow-lg"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                } focus:outline-none focus:ring-4`}
                required
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.username}
              </p>
            )}
          </div>

          {/* 🔒 Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {getFieldIcon('password', !!errors.password)}
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                autoComplete="new-password"
                className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.password
                    ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20"
                    : focusedField === 'password'
                    ? "border-blue-400 dark:border-blue-500 focus:border-blue-500 focus:ring-blue-500/20 shadow-lg"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                } focus:outline-none focus:ring-4`}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.password}
              </p>
            )}
          </div>

          {/* 🚀 Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className={`relative px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300 ${
              isLoading ? "scale-95 opacity-90" : "hover:scale-105"
            }`}>
              <div className="flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    <span>Sign In</span>
                    <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
                  </>
                )}
              </div>
            </div>
          </button>

        </form>

        {/* 🔒 Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Shield className="h-4 w-4" />
          <span>Your data is encrypted and secure</span>
          <Zap className="h-4 w-4 text-green-500" />
        </div>

      </div>
    </div>
  );
};

export default LoginForm;