import { 
  Upload, 
  Sparkles, 
  Image,
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
  processingStatus = "Generating 3D Model..." // DEFAULT STATUS
}) => {
  // Se sta processando, mostra solo lo spinner pulito
  if (isProcessing) {
    return (
      <div className="relative overflow-hidden">
        
        {/* Sfondo minimale per il loading */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20" />

        <div className="relative flex flex-col items-center justify-center h-[350px] border-2 border-dashed border-blue-300/50 dark:border-blue-600/50 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 text-center">
          
          {/* Spinner Container */}
          <div className="relative mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            
            {/* Ring esterno rotante */}
            <div className="absolute inset-0 w-16 h-16 border-2 border-blue-300/30 border-t-blue-500 rounded-full animate-spin" style={{animationDuration: '3s'}} />
          </div>

          {/* Testo di caricamento minimo */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {processingStatus}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please wait...
            </p>
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
              <Image className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Zap className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            3D Model Viewer
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm text-sm">
            Your generated 3D model will appear here. Upload an image to start the generation process.
          </p>
        </div>

        {/* Action Hint */}
        <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Select a model and upload your image to begin
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