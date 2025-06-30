import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon,
  Wand2,
  ArrowRight,
  Zap,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";

// Define the props interface
interface NoModelPlaceholderProps {
  modelUrl?: string;
  onModelDelete?: () => void;
  isProcessing?: boolean; // AGGIUNTA PROP PER LOADING
  processingStatus?: string; // AGGIUNTA PROP PER STATUS
}

const NoModelPlaceholder: React.FC<NoModelPlaceholderProps> = ({ 
  modelUrl, 
  onModelDelete,
  isProcessing = false, // DEFAULT FALSE
  processingStatus = "Processing..." // DEFAULT STATUS
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Upload,
      title: "Upload Image",
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      icon: Wand2,
      title: "AI Processing",
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30"
    },
    {
      icon: Sparkles,
      title: "3D Model",
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    }
  ];

  // Cycle through steps automatically (solo se non sta processando)
  useEffect(() => {
    if (!isProcessing) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
      }, 2500);
      
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  // Se sta processando, mostra lo stato di loading
  if (isProcessing) {
    return (
      <div className="relative overflow-hidden">
        
        {/* Animated Background per Loading */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 opacity-70 animate-pulse" />
        
        {/* Floating Elements Animati */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-bounce`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 15}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: '2s',
              }}
            />
          ))}
        </div>

        <div className="relative flex flex-col items-center justify-center h-[350px] border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-8 text-center">
          
          {/* Loading Icon Container */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
            
            {/* Rotating Ring */}
            <div className="absolute inset-0 w-20 h-20 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin opacity-30" />
          </div>

          {/* Loading Content */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
              {processingStatus}
            </h3>
            <p className="text-blue-600 dark:text-blue-400 max-w-sm text-sm animate-pulse">
              Your 3D model is being generated. This may take a few minutes...
            </p>
          </div>

          {/* Processing Steps Indicator */}
          <div className="flex items-center gap-4 mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-1000 ${
                  index <= 1 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <step.icon className={`h-4 w-4 transition-colors duration-1000 ${
                    index <= 1 ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                </div>
                
                {index < steps.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-blue-300 dark:text-blue-600" />
                )}
              </div>
            ))}
          </div>

          {/* Progress Hint */}
          <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-300 dark:border-blue-600 animate-pulse">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              ✨ AI is working its magic...
            </span>
          </div>

        </div>
      </div>
    );
  }

  // Stato normale (non in processing)
  return (
    <div className="relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 opacity-50" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-pulse`}
            style={{
              left: `${25 + i * 20}%`,
              top: `${40 + (i % 2) * 20}%`,
              animationDelay: `${i * 1}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center justify-center h-[350px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-8 text-center">
        
        {/* Main Icon Container */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center shadow-lg">
            <div className="relative">
              <ImageIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Zap className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            2D to 3D Generation
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm text-sm">
            Upload an image to generate a 3D model using AI-powered reconstruction techniques.
          </p>
        </div>

        {/* Process Steps */}
        <div className="flex items-center gap-6 mb-6">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              
              {/* Step Icon */}
              <div className={`relative transition-all duration-500 ${
                currentStep === index ? 'scale-110' : 'scale-90 opacity-60'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                  currentStep === index ? step.bgColor : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <step.icon className={`h-5 w-5 transition-colors duration-500 ${
                    currentStep === index ? step.color : 'text-gray-400'
                  }`} />
                </div>
                
                {/* Active Indicator */}
                {currentStep === index && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 animate-pulse" />
                )}
              </div>

              {/* Step Text */}
              <div className={`transition-all duration-500 ${
                currentStep === index ? 'opacity-100' : 'opacity-50'
              }`}>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {step.title}
                </div>
              </div>

              {/* Arrow Between Steps */}
              {index < steps.length - 1 && (
                <ArrowRight className="h-3 w-3 text-gray-300 dark:text-gray-600 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Action Hint */}
        <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Select a model above and upload your image to begin
          </span>
        </div>

        {/* Debug info (you can remove this) */}
        {modelUrl && (
          <div className="mt-4 text-xs text-gray-500">
            Model URL: {modelUrl}
          </div>
        )}

      </div>
    </div>
  );
};

export default NoModelPlaceholder;