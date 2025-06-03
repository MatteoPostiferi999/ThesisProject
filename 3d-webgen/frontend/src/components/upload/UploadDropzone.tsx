
import React, { useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false)
  });

  return (
    <>
      <Card className={`border-2 transition-colors ${
        isDragging || isDragActive 
          ? 'border-slate-400 bg-slate-50 dark:bg-slate-900/50' 
          : 'border-dashed border-slate-300 hover:border-slate-400'} rounded-lg`}>
        
        <CardContent className="p-0">
          <div 
            {...getRootProps()}
            className="flex flex-col items-center justify-center p-12 text-center cursor-pointer"
          >
            <input {...getInputProps()} ref={fileInputRef} />
            
            <div className="w-16 h-16 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Upload className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              {isDragActive ? 'Drop your image here' : 'Upload Your Image'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Drag & drop or click to browse files
            </p>
            
            <Button 
              variant="outline"
              className="mb-4 border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={(e) => {
                e.stopPropagation();
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
            >
              <Upload className="h-4 w-4 mr-2" /> 
              Choose Image
            </Button>
            
            <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
              <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">JPG</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">PNG</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">WEBP</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {error && (
        <div className="mt-4 p-4 text-red-700 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          {error}
        </div>
      )}
    </>
  );
};

export default UploadDropzone;
