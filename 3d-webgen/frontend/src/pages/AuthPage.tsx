import { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import { 
  LogIn, 
  UserPlus, 
  Sparkles, 
  ArrowRight,
  Shield,
  Zap,
  Star
} from "lucide-react";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "register">("register");

  const features = [
    { icon: Zap, label: "Instant 2D → 3D" },
    { icon: Shield, label: "Your Data, Your Control" },
    { icon: Sparkles, label: "AI-Enhanced Reconstruction" },
    { icon: Star, label: "Pro Tools (Soon)" }
  ];

  

  return (
    <div className="min-h-screen relative overflow-y-auto">
      
      {/* 🌌 Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        {/* ✨ Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        {/* 🌊 Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      {/* 📱 Content Container */}
      <div className="relative flex items-center justify-center min-h-screen px-4 py-6">
        <div className="w-full max-w-md">
          
          {/* 🎨 Header Section */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl">
                {mode === "register" ? (
                  <UserPlus className="w-7 h-7 text-white" />
                ) : (
                  <LogIn className="w-7 h-7 text-white" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {mode === "register" ? "AI Assisted Design: 2D to 3D Reconstruction for Rapid Prototyping" : "Welcome Back"}
            </h1>
            <p className="text-blue-200 text-base">
              {mode === "register" 
                ? "Create your account and start generating 3D models" 
                : "Sign in to continue your 3D journey"
              }
            </p>
          </div>

          {/* 🎪 Form Container */}
          <div className="relative mb-6">
            {/* ✨ Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl blur-3xl" />
            <div className="relative">
              {mode === "register" ? (
                <RegisterForm onSuccess={() => setMode("login")} />
              ) : (
                <LoginForm />
              )}
            </div>
          </div>

          {/* 🔄 Mode Switch */}
          <div className="text-center mb-6">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              {mode === "register" ? (
                <>
                  <p className="text-white/80 text-xs mb-2">Already have an account?</p>
                  <button 
                    onClick={() => setMode("login")}
                    className="group inline-flex items-center gap-2 px-5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-transform duration-300 hover:scale-105"
                  >
                    <LogIn className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Sign In Instead
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              ) : (
                <>
                  <p className="text-white/80 text-xs mb-2">Don't have an account yet?</p>
                  <button 
                    onClick={() => setMode("register")}
                    className="group inline-flex items-center gap-2 px-5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-transform duration-300 hover:scale-105"
                  >
                    <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Create Account
                    <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 🏷️ Features Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center hover:bg-white/10 transition-colors"
              >
                <feature.icon className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <div className="text-white text-xs font-medium">{feature.label}</div>
              </div>
            ))}
          </div>

      

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
