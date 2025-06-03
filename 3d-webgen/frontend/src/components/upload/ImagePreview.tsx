
import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, CheckCircle } from "lucide-react";
import { ModelType } from "@/components/ModelSelector";
import { getModelName } from "@/hooks/useImageUpload";

interface ImagePreviewProps {
  imageSrc: string;
  selectedModel: ModelType;
  onReplaceClick: (e: React.MouseEvent) => void;
  onDeleteClick: () => void;
}

const ImagePreview = ({
  imageSrc,
  selectedModel,
  onReplaceClick,
  onDeleteClick
}: ImagePreviewProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImageLoaded(false);
    setTimeout(() => setImageLoaded(true), 100);
  }, [selectedModel]);

  return (
    <Card className="border-2 border-green-300 rounded-lg">
      <CardContent className="p-0">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-lg font-medium text-green-700 dark:text-green-400">
              Image uploaded successfully
            </p>
          </div>
          
          <div className={`relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}>
            <img 
              src={imageSrc} 
              alt="Uploaded preview" 
              className="object-cover w-full h-full"
            />
            
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
              {getModelName(selectedModel)}
            </div>
          </div>
          
          <div className="mt-6 flex justify-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm flex items-center gap-2"
              onClick={onReplaceClick}
            >
              <RefreshCw className="h-4 w-4" />
              Replace image
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="text-sm flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              onClick={onDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
              Delete image
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImagePreview;
