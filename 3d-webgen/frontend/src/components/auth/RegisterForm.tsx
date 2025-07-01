import { useState } from "react";
import { toast } from "sonner";
import { registerUser } from "@/api/services/auth";
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail
} from "lucide-react";

type RegisterFormProps = {
  onSuccess: () => void;
};

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ✅ FUNZIONI PER FORZARE I MESSAGGI IN INGLESE
  const handleInvalid = (e: React.InvalidEvent<HTMLInputElement>) => {
    e.preventDefault();
    const field = e.target.name;
    const value = e.target.value.trim();
    
    if (!value) {
      e.target.setCustomValidity('Please fill out this field');
      setErrors(prev => ({ 
        ...prev, 
        [field]: 'Please fill out this field' 
      }));
    } else if (field === 'username' && value.length < 3) {
      e.target.setCustomValidity('Username must be at least 3 characters');
      setErrors(prev => ({ 
        ...prev, 
        [field]: 'Username must be at least 3 characters' 
      }));
    } else if (field === 'email' && !isValidEmail(value)) {
      e.target.setCustomValidity('Please enter a valid email address');
      setErrors(prev => ({ 
        ...prev, 
        [field]: 'Please enter a valid email address' 
      }));
    } else if (field === 'password' && value.length < 3) {
      e.target.setCustomValidity('Password must be at least 3 characters');
      setErrors(prev => ({ 
        ...prev, 
        [field]: 'Password must be at least 3 characters' 
      }));
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.setCustomValidity('');
    // Continua con la logica normale
    handleChange(e as React.ChangeEvent<HTMLInputElement>);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Please fill out this field";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Please fill out this field";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Please fill out this field";
    } else if (formData.password.length < 3) {
      newErrors.password = "Password must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);

    try {
      toast.loading("🚀 Creating your account...", { id: "register-toast" });
      
      const data = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      toast.dismiss("register-toast");
      toast.success("🎉 Welcome aboard!", {
        description: "Your account has been created successfully!"
      });
      
      console.log("Registered user:", data);
      onSuccess();

    } catch (error: any) {
      console.error("Registration failed:", error);
      
      toast.dismiss("register-toast");
      
      // Better error handling
      const errorMessage = error.response?.data?.username?.[0] ||
                          error.response?.data?.email?.[0] ||
                          error.response?.data?.password?.[0] ||
                          error.response?.data?.detail ||
                          "Registration failed. Please try again.";
      
      toast.error("❌ Registration failed", {
        description: errorMessage
      });

      // Set field-specific errors
      if (error.response?.data?.username) {
        setErrors(prev => ({ ...prev, username: error.response.data.username[0] }));
      }
      if (error.response?.data?.email) {
        setErrors(prev => ({ ...prev, email: error.response.data.email[0] }));
      }
      if (error.response?.data?.password) {
        setErrors(prev => ({ ...prev, password: error.response.data.password[0] }));
      }

    } finally {
      setLoading(false);
    }
  };

  const getFieldIcon = (field: string, hasError: boolean) => {
    if (hasError) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (focusedField === field) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    
    switch (field) {
      case 'username':
        return <User className="h-5 w-5 text-gray-400" />;
      case 'email':
        return <Mail className="h-5 w-5 text-gray-400" />;
      case 'password':
        return <Lock className="h-5 w-5 text-gray-400" />;
      default:
        return <User className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="relative max-w-md mx-auto">
      
      {/* ✨ Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/10 dark:to-blue-950/20 rounded-3xl blur-3xl -z-10" />
      
      <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-2xl">
        
        {/* 🎨 Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Sign Up
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Ready for your first 3D prototype?
          </p>
        </div>

        {/* 📝 Register Form */}
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off" noValidate>
          
          {/* 👤 Username Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {getFieldIcon('username', !!errors.username)}
              </div>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onInput={handleInput}
                onInvalid={handleInvalid}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                autoComplete="off"
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.username
                    ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20"
                    : focusedField === 'username'
                    ? "border-purple-400 dark:border-purple-500 focus:border-purple-500 focus:ring-purple-500/20 shadow-lg"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                } focus:outline-none focus:ring-4`}
                required
                disabled={loading}
                minLength={3}
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.username}
              </p>
            )}
          </div>

          {/* 📧 Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {getFieldIcon('email', !!errors.email)}
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onInput={handleInput}
                onInvalid={handleInvalid}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoComplete="off"
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.email
                    ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20"
                    : focusedField === 'email'
                    ? "border-purple-400 dark:border-purple-500 focus:border-purple-500 focus:ring-purple-500/20 shadow-lg"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                } focus:outline-none focus:ring-4`}
                required
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* 🔒 Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {getFieldIcon('password', !!errors.password)}
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onInput={handleInput}
                onInvalid={handleInvalid}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                autoComplete="new-password"
                className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.password
                    ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20"
                    : focusedField === 'password'
                    ? "border-purple-400 dark:border-purple-500 focus:border-purple-500 focus:ring-purple-500/20 shadow-lg"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                } focus:outline-none focus:ring-4`}
                required
                disabled={loading}
                minLength={3}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
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
            disabled={loading}
            className="relative w-full group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className={`relative px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300 ${
              loading ? "scale-95 opacity-90" : "hover:scale-105"
            }`}>
              <div className="flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    <span>Create Account</span>
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

export default RegisterForm;