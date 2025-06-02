
import { useState, useCallback } from "react";
import { toast } from "../components/ui/sonner";
import type { ModelType } from "../components/features/ModelSelector";

interface UseImageUploadProps {
  onImageUploaded: (imageDataUrl: string) => void;
}

export const useImageUpload = ({ onImageUploaded }: UseImageUploadProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file");
      toast.error("Invalid file format", {
        description: "Please upload a JPG, PNG or WEBP image file"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onImageUploaded(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [onImageUploaded]);

  return {
    error,
    isDragging,
    setIsDragging,
    handleFileDrop
  };
};


export const getModelName = (selectedModel: ModelType): string => {
  switch (selectedModel) {
    case "hunyuan-mini-turbo":
      return "Hunyuan3D-DiT-v2-mini-Turbo";
    case "hunyuan-mini-fast":
      return "Hunyuan3D-DiT-v2-mini-Fast";
    case "hunyuan-mini":
      return "Hunyuan3D-DiT-v2-mini";
    case "hunyuan-mv-turbo":
      return "Hunyuan3D-DiT-v2-mv-Turbo";
    case "hunyuan-mv-fast":
      return "Hunyuan3D-DiT-v2-mv-Fast";
    case "hunyuan-mv":
      return "Hunyuan3D-DiT-v2-mv";
    case "hunyuan-v2-0-turbo":
      return "Hunyuan3D-DiT-v2-0-Turbo";
    case "hunyuan-v2-0-fast":
      return "Hunyuan3D-DiT-v2-0-Fast";
    case "hunyuan-v2-0":
      return "Hunyuan3D-DiT-v2-0";
    default:
      return "Unknown model";
  }
};
