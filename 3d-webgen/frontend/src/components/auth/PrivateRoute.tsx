import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2, Shield, Lock, CheckCircle2 } from "lucide-react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const validateAuth = async () => {
      // CAMBIATO: sessionStorage invece di localStorage
      const token = sessionStorage.getItem("authToken");
      const refreshToken = sessionStorage.getItem("refreshToken");

      // Quick validation
      if (!token) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      // Optional: Add token expiry check here
      try {
        // You could add an API call to validate the token
        // const isValid = await validateToken(token);
        
        // For now, just check if token exists and has basic structure
        const isValid = token && token.length > 20; // Basic JWT check
        
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error("Auth validation error:", error);
        setIsAuthenticated(false);
        
        // CAMBIATO: Clear invalid tokens from sessionStorage
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("refreshToken");
      } finally {
        setIsValidating(false);
      }
    };

    validateAuth();
  }, []);

  // 🔄 Loading State - Beautiful spinner
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="text-center space-y-6">
          
          {/* ✨ Animated Security Icon */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <Shield className="w-10 h-10 text-white" />
            </div>
            
            {/* 🌊 Ripple Effect */}
            <div className="absolute inset-0 w-20 h-20 bg-blue-400 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-2 w-16 h-16 bg-blue-300 rounded-full animate-ping opacity-30" style={{ animationDelay: '0.2s' }} />
          </div>

          {/* 📝 Status Text */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              🔐 Verifying Access
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Checking your authentication...
            </p>
          </div>

          {/* 🔄 Spinner */}
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Please wait
            </span>
          </div>

          {/* 🛡️ Security Badges */}
          <div className="flex justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700">
              <Lock className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Secure</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Encrypted</span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ❌ Redirect to auth if not authenticated
  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // ✅ Render protected content
  return <>{children}</>;
};

export default PrivateRoute;