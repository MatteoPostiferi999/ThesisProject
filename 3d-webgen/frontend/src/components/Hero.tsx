import { Button } from "@/components/ui/button";
import { 
  Layers, 
  LogOut, 
  Sparkles, 
  Zap, 
  ArrowDown,
  Play,
  BookOpen,
  Wand2,
  Image as ImageIcon,
  Box,
  Cpu,
  Eye
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const navigate = useNavigate();

  const features = [
    { icon: ImageIcon, text: "Upload 2D Image", color: "text-blue-400" },
    { icon: Cpu, text: "AI Processing", color: "text-purple-400" },
    { icon: Box, text: "3D Model Ready", color: "text-green-400" }
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // Cycle through features
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    navigate("/auth");
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: "smooth",
      block: "start"
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      
      {/* 🌌 Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* ✨ Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse`}
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

      {/* 🚪 Logout Button */}
      <div className="absolute top-6 right-6 z-20">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="group bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 rounded-2xl"
        >
          <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
          Sign Out
        </Button>
      </div>

      {/* 🎯 Hero Content */}
      <div className="relative z-10 flex items-center min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* 📝 Text Content */}
            <div className="max-w-2xl">
              
              {/* 🏷️ Badge */}
              <div className={`flex items-center gap-3 mb-8 transition-all duration-700 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}>
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                    <Layers className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                </div>
                <span className="text-blue-200 font-medium text-lg">
                  🚀 Next-Gen AI Technology
                </span>
              </div>

              {/* 🎨 Main Title */}
              <h1 className={`text-6xl md:text-8xl font-bold mb-8 transition-all duration-700 delay-200 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}>
                <span className="block text-white leading-tight">
                  Transform
                </span>
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
                  2D → 3D
                </span>
              </h1>

              {/* 📄 Description */}
              <p className={`text-xl md:text-2xl mb-10 text-slate-300 leading-relaxed transition-all duration-700 delay-400 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}>
                Upload any 2D image and watch our advanced AI transform it into a 3D model. 
                <span className="text-blue-300 font-semibold"> No experience required.</span>
              </p>

              {/* 🎮 Action Buttons */}
              <div className={`flex flex-col sm:flex-row gap-4 mb-12 transition-all duration-700 delay-600 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}>
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 px-8 py-6 text-lg font-semibold"
                  onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Play className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  Start Creating Now
                  <Sparkles className="h-4 w-4 ml-2 group-hover:animate-spin" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="group bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 rounded-2xl px-8 py-6 text-lg font-semibold"
                  onClick={() => scrollToSection("technical-details")}
                >
                  <BookOpen className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
                  Learn How It Works
                </Button>
              </div>


            </div>

            {/* 🎨 Visual Section */}
            <div className={`relative transition-all duration-700 delay-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}>
              
              {/* 🎪 3D Process Visualization */}
              <div className="relative">
                
                {/* 🌊 Main Visual Container */}
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                  
                  {/* 🔄 Process Steps */}
                  <div className="space-y-8">
                    {features.map((feature, index) => (
                      <div 
                        key={index}
                        className={`flex items-center gap-6 transition-all duration-500 ${
                          currentFeature === index ? 'scale-110 opacity-100' : 'scale-95 opacity-60'
                        }`}
                      >
                        <div className={`relative p-4 rounded-2xl ${
                          currentFeature === index 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl' 
                            : 'bg-white/10'
                        } transition-all duration-500`}>
                          <feature.icon className={`h-8 w-8 ${
                            currentFeature === index ? 'text-white' : feature.color
                          }`} />
                          
                          {currentFeature === index && (
                            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-50 animate-pulse" />
                          )}
                        </div>
                        
                        <div>
                          <h3 className={`text-lg font-semibold transition-colors ${
                            currentFeature === index ? 'text-white' : 'text-slate-300'
                          }`}>
                            {feature.text}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            {index === 0 && "Upload any image from your device"}
                            {index === 1 && "Our AI analyzes and processes"}
                            {index === 2 && "Download your 3D model"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ⚡ Magic Wand */}
                  <div className="absolute top-4 right-4">
                    <Wand2 className="h-8 w-8 text-yellow-400 animate-pulse" />
                  </div>
                </div>

                {/* ✨ Floating Elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse" />
                <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-30 animate-bounce" />
                <div className="absolute top-1/2 -left-8 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-25 animate-ping" />
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* 🎯 Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/70 text-sm">Scroll to explore</span>
          <ArrowDown className="h-6 w-6 text-white/70" />
        </div>
      </div>

      {/* 🌊 Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" fill="none" className="w-full h-auto">
          <path
            d="M0,96L48,112C96,128 192,160 288,160C384,160 480,128 576,112C672,96 768,96 864,112C960,128 1056,160 1152,160C1248,160 1344,128 1392,112L1440,96L1440,320L1392,320C1344,320 1248,320 1152,320C1056,320 960,320 864,320C768,320 672,320 576,320C480,320 384,320 288,320C192,320 96,320 48,320L0,320Z"
            fill="rgba(255,255,255,0.1)"
          />
        </svg>
      </div>

    </div>
  );
};

export default Hero;