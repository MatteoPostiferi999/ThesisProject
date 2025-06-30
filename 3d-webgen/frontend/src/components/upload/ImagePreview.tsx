import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  Image as ImageIcon,
  Eye,
  Maximize2
} from "lucide-react";
import { ModelType } from "@/components/ModelSelector";
import { getModelName } from "@/hooks/useImageUpload";

interface ImagePreviewProps {
  imageSrc: string;
  selectedModel: ModelType;
  onReplaceClick: (e: React.MouseEvent) => void;
  onDeleteClick: () => void;
  fileInputRef?: React.RefObject<HTMLInputElement>; 
}

const ImagePreview = ({
  imageSrc,
  selectedModel,
  onReplaceClick,
  onDeleteClick,
  fileInputRef
}: ImagePreviewProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    // Smooth transition when model changes
    const timer = setTimeout(() => setImageLoaded(true), 150);
    return () => clearTimeout(timer);
  }, [selectedModel, imageSrc]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleReplaceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Opzione 1: Se fileInputRef è passato come prop
    if (fileInputRef?.current) {
      fileInputRef.current.click();
    } else {
      // Opzione 2: Trova l'input file nel DOM
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      } else {
        // Opzione 3: Chiama la funzione parent
        onReplaceClick(e);
      }
    }
  };

  const toggleFullscreen = () => {
    setShowFullscreen(!showFullscreen);
  };

  return (
    <>
      {/* Main Preview Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800 shadow-xl hover:shadow-2xl transition-all duration-500">
        
        {/* Success Animation Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-emerald-400/5 to-green-400/10 animate-pulse" />
        
        <CardContent className="relative p-0">
          
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-white/20 rounded-full animate-bounce">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">
                  Image Uploaded Successfully
                </h3>
                <p className="text-green-100 text-sm">
                  Ready for {getModelName(selectedModel)} processing
                </p>
              </div>
            </div>
          </div>

          {/* Image Container */}
          <div className="p-6">
            <div
              className={`relative group cursor-pointer transition-all duration-500 transform hover:scale-[1.02] ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              style={{ height: "400px" }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={toggleFullscreen}
            >
              
              {/* BORDO BLU UNIFORME - CAMBIATO */}
              <div className="absolute inset-0 bg-blue-500 rounded-2xl p-1">
                <div className="w-full h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                  
                  {/* Main Image */}
                  {!imageError ? (
                    <img
                      src={imageSrc}
                      alt="Uploaded preview"
                      className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                      <div className="text-center space-y-2">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-gray-500">Failed to load image</p>
                      </div>
                    </div>
                  )}

                  {/* Model Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm">
                      {getModelName(selectedModel)}
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  {isHovered && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-lg">
                        <Maximize2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Click to enlarge</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Info Overlay */}
              <div className="absolute bottom-4 left-4">
                <div className="px-3 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
                  <Eye className="w-3 h-3 inline mr-1" />
                  Preview Mode
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              
              {/* Replace Button */}
              <Button
                variant="outline"
                size="sm"
                className="group px-6 py-3 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 transition-all duration-300"
                onClick={handleReplaceClick}
              >
                <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Replace Image
              </Button>

              {/* Delete Button */}
              <Button
                variant="outline"
                size="sm"
                className="group px-6 py-3 bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 transition-all duration-300"
                onClick={onDeleteClick}
              >
                <Trash2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Delete Image
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={toggleFullscreen}
        >
          <div className="relative max-w-6xl max-h-full">
            <img
              src={imageSrc}
              alt="Fullscreen preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            <button
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/70 text-white rounded-full text-sm">
              Click anywhere to close
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreview;