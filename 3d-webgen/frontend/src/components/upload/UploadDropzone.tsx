import React, { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Image as ImageIcon, 
  AlertCircle
} from "lucide-react";

interface UploadDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  error: string | null;
}

const UploadDropzone = ({ 
  onDrop, 
  isDragging, 
  setIsDragging, 
  error 
}: UploadDropzoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB limit
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false)
  });

  const supportedFormats = [
    { name: "JPG", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
    { name: "PNG", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
    { name: "WEBP", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
    { name: "GIF", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" }
  ];

  return (
    <>
      {/* Main Upload Area */}
      <Card 
        className={`relative overflow-hidden transition-all duration-500 transform hover:scale-[1.01] ${
          isDragActive || isDragging
            ? "border-4 border-blue-400 dark:border-blue-500 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50"
            : "border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 shadow-xl hover:shadow-2xl"
        } rounded-3xl w-full max-w-2xl mx-auto h-[350px]`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white/30 to-blue-50/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-blue-950/50" />
        
        {/* Floating Animation Elements */}
        {(isDragActive || isDragging) && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-bounce`}
                style={{
                  left: `${25 + i * 12}%`,
                  top: `${30 + (i % 3) * 15}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        )}

        <CardContent className="relative p-0 h-full">
          <div
            {...getRootProps()}
            className={`w-full h-full flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 p-8 ${
              isDragging || isDragActive
                ? "bg-gradient-to-br from-blue-50/80 to-indigo-100/80 dark:from-blue-950/80 dark:to-indigo-950/80"
                : isHovered 
                ? "bg-gradient-to-br from-gray-50/80 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-950/30"
                : ""
            }`}
          >
            <input {...getInputProps()} ref={fileInputRef} />

            {/* Dynamic Upload Icon - RIMOSSA SPARKLES */}
            <div className={`relative mb-6 transition-all duration-500 ${
              isDragActive ? "scale-110 rotate-12" : isHovered ? "scale-105" : ""
            }`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                isDragActive || isDragging
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-lg hover:shadow-xl"
              }`}>
                {isDragActive ? (
                  <ImageIcon className="h-10 w-10 text-white animate-pulse" />
                ) : (
                  <Upload className={`h-10 w-10 transition-colors duration-300 ${
                    isHovered 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-600 dark:text-gray-400"
                  }`} />
                )}
              </div>
            </div>

            {/* Dynamic Text */}
            <div className="space-y-3 mb-6">
              <h3 className={`text-xl font-bold transition-all duration-300 ${
                isDragActive 
                  ? "text-blue-700 dark:text-blue-300 scale-105" 
                  : "text-gray-900 dark:text-gray-100"
              }`}>
                {isDragActive ? "Drop to Upload" : "Upload Image"}
              </h3>
              
              <p className={`text-sm transition-colors duration-300 ${
                isDragActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-600 dark:text-gray-400"
              }`}>
                {isDragActive 
                  ? "Release to upload your image" 
                  : "Drag & drop your image here, or click to browse"
                }
              </p>
            </div>

            {/* Upload Button */}
            <Button
              variant="outline"
              size="lg"
              className={`mb-6 px-6 py-3 font-semibold transition-all duration-300 transform hover:scale-105 ${
                isDragActive
                  ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600 shadow-xl"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>

            {/* Supported Formats */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Supported formats:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {supportedFormats.map((format, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-110 ${format.color}`}
                  >
                    {format.name}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </CardContent>

        {/* Size Limit Indicator */}
        <div className="absolute bottom-3 right-3">
          <div className="px-2 py-1 bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full text-xs text-gray-600 dark:text-gray-400">
            Max 10MB
          </div>
        </div>

      </Card>

      {/* Error Display */}
      {error && (
        <div className="mt-4 animate-in slide-in-from-top-4 duration-300">
          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-l-4 border-red-500 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200 text-sm">
                  Upload Error
                </h4>
                <p className="text-red-700 dark:text-red-300 text-xs">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadDropzone;