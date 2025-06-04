import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/auth");
  };

  return (
    <div className="relative">
      {/* Bottone Logout in alto a destra */}
      <div className="absolute top-6 right-6 z-10">
        <Button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </Button>
      </div>

      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/10 rounded-lg p-2">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-300">
                AI-Powered 3D Generation
              </span>
            </div>

            <h1
              className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-500 text-white ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              2D to 3D
              <br />
              <span className="text-slate-300">Generation</span>
            </h1>

            <p
              className={`text-xl md:text-2xl mb-8 text-slate-300 leading-relaxed transition-all duration-500 delay-200 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              Transform your 2D images into 3D models using AI technology.
            </p>

            <div
              className={`flex flex-wrap gap-4 transition-all duration-500 delay-400 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 transition-colors text-lg px-8 py-4 font-medium"
                onClick={() => {
                  document
                    .getElementById("uploader-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Start Creating
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-900 bg-white hover:bg-slate-100 transition-colors text-lg px-8 py-4"
                onClick={() => {
                  document
                    .getElementById("technical-details")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
