import { useState, useRef } from "react";
import { toast } from "@/components/ui/sonner";
import { ModelType } from "./ModelSelector";
import { useImageUpload, getModelName } from "@/hooks/useImageUpload";
import UploadDropzone from "./upload/UploadDropzone";
import ImagePreview from "./upload/ImagePreview";
import Generate3DButton from "@/components/generate3DButton";
import ProcessingStatus from "@/components/ProcessingStatus";
import { getJobStatus, uploadImage } from "@/api/services/jobs";
import { apiClient } from "@/api";
import { Link } from "react-router-dom";
import { History, Upload, Image as ImageIcon } from "lucide-react";

// Types & Interfaces
type StatusType = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

interface ImageUploaderProps {
  onImageUploaded: (imageDataUrl: string) => void;
  onImageDelete: () => void;
  uploadedImage: string | null;
  selectedModel: ModelType;
  setModelUrl: (url: string) => void; 
  onGenerate: () => void;
  isProcessing: boolean;
}

const ImageUploader = ({ 
  onImageUploaded, 
  onImageDelete, 
  uploadedImage, 
  selectedModel,
  setModelUrl,
  onGenerate,
  isProcessing
}: ImageUploaderProps) => {
  // State Management
  const [status, setStatus] = useState<StatusType>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [hasSavedToHistory, setHasSavedToHistory] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Smart Job Status Polling
  const pollJobStatus = async (jobId: number, imageUrl: string) => {
    setStatus("processing");
    setIsPolling(true);
    setHasSavedToHistory(false);

    const maxAttempts = 300;
    let attempts = 0;

    const poll = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        setStatus("error");
        setIsPolling(false);
        toast.error("Processing timeout. Please try again.");
        return;
      }

      try {
        const data = await getJobStatus(jobId);
        const { status: jobStatus, progress: jobProgress = 0, mesh_url } = data;

        console.log(`[POLL ${attempts + 1}] Status: ${jobStatus}, Progress: ${jobProgress}%`);

        if (jobStatus === "COMPLETED") {
          setIsPolling(false);
          
          if (!mesh_url) {
            setStatus("error");
            toast.error("Model generation completed but file is missing.");
            return;
          }

          try {
            console.log("🔍 Checking file accessibility:", mesh_url);
            const fileResponse = await fetch(mesh_url, { method: 'HEAD' });
            
            if (!fileResponse.ok) {
              console.error(`❌ File not accessible: ${mesh_url} (Status: ${fileResponse.status})`);
              setStatus("error");
              toast.error(`Model file is not accessible (Error ${fileResponse.status}). Please try again.`);
              return;
            }
            
            console.log("✅ File is accessible");
          } catch (fileError) {
            console.error(`❌ File check failed:`, fileError);
            setStatus("error");
            toast.error("Unable to verify model file. Please try again.");
            return;
          }

          // Success flow - SOLO se il file è accessibile
          setModelUrl(mesh_url);
          setStatus("completed");
          toast.success("Your 3D model is ready!", {
            description: "Model generated successfully and ready to view."
          });

          // Save to history SOLO SE NON È GIÀ STATO SALVATO E IL FILE È VALIDO
          if (!hasSavedToHistory) {
            setHasSavedToHistory(true);
            await saveModelToHistory(imageUrl, mesh_url, selectedModel);
          }
          
        } else if (jobStatus === "FAILED") {
          setIsPolling(false);
          setStatus("error");
          toast.error("Model generation failed.", {
            description: "Please try again with a different image."
          });
          
        } else {
          setProgress(Math.min(jobProgress, 99));
          attempts++;
          
          const delay = Math.min(1000 + (attempts * 100), 3000);
          setTimeout(poll, delay);
        }

      } catch (error) {
        console.error("[POLL] Error:", error);
        setIsPolling(false);
        setStatus("error");
        toast.error("Error checking generation status.");
      }
    };

    await poll();
  };

  // Save Model to History
  const saveModelToHistory = async (inputImage: string, outputModel: string, modelName: string) => {
    try {
      console.log("🔄 Saving model to history...", {
        inputImage,
        outputModel,
        modelName
      });
      
      const response = await apiClient.post("/api/generated-models/save/", {
        input_image: inputImage,
        output_model: outputModel,
        model_name: modelName,
      });

      if (response.status === 201 || response.status === 200) {
        console.log("✅ Model saved to history successfully");
        toast.success("Model saved to history!", {
          description: "You can view it anytime in your history page."
        });
      }

    } catch (error) {
      console.error("❌ Save to history failed:", error);
      
      // Controlla se è un errore di duplicato
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('già')) {
        console.log("ℹ️ Model already exists in history");
        toast.info("Model already in history", {
          description: "This model was already saved previously."
        });
      } else {
        toast.warning("Model generated but couldn't save to history.", {
          description: "The model is still available for download."
        });
      }
    }
  };

  // Generate 3D Model
  const handleGenerate3D = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image first.");
      return;
    }

    // ✅ CHIAMA onGenerate() ALL'INIZIO per attivare lo spinner nel ModelWorkflow
    onGenerate();

    setStatus("uploading");
    setHasStartedGeneration(true);
    setProgress(0);
    setHasSavedToHistory(false);

    try {
      const response = await fetch(uploadedImage);
      const blob = await response.blob();
      const file = new File([blob], "uploaded-image.jpg", { type: blob.type });

      const formData = new FormData();
      formData.append("image", file);
      formData.append('model_id', selectedModel);

      toast.loading("Uploading image...", { id: "upload-toast" });
      
      const uploadResponse = await uploadImage(formData);
      
      toast.dismiss("upload-toast");
      toast.success("Upload complete! Starting generation...");

      setImageUrl(uploadResponse.imageUrl);
      await pollJobStatus(uploadResponse.jobId, uploadResponse.imageUrl);

    } catch (error) {
      console.error("Generation failed:", error);
      setStatus("error");
      toast.error("Failed to start 3D generation.", {
        description: "Please check your image and try again."
      });
    }
  };

  // Image Upload Handler
  const { error, isDragging, setIsDragging, handleFileDrop } = useImageUpload({
    onImageUploaded: (imageDataUrl) => {
      onImageUploaded(imageDataUrl);
      setStatus("idle");
      setHasStartedGeneration(false);
      setProgress(0);
      setHasSavedToHistory(false);
      
      toast.success("Image uploaded successfully!", {
        description: `Ready for ${getModelName(selectedModel)} processing.`,
      });
    }
  });

  // Delete Image Handler
  const handleDeleteImage = () => {
    onImageDelete();
    setStatus("idle");
    setHasStartedGeneration(false);
    setProgress(0);
    setImageUrl(null);
    setHasSavedToHistory(false);
    
    toast.info("Image removed", {
      description: "Upload a new image to get started."
    });
  };

  // Replace Image Handler
  const handleReplaceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handler per il file input nascosto
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileDrop(Array.from(files));
    }
    e.target.value = '';
  };

  return (
    <div className="relative">
      {/* File Input Nascosto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        multiple={false}
      />

      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20 rounded-3xl blur-3xl -z-10" />
      
      <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-2xl">
        
        {/* Header Section - SEMPLIFICATO */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Upload Your Image
            </h2>
          </div>
          
          {/* RIMOSSO IL BADGE DEL MODELLO */}
        </div>

        {/* Upload Area */}
        {uploadedImage ? (
          <div className="space-y-6">
            {/* Image Preview with Enhanced Styling */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
              <div className="relative">
                <ImagePreview 
                  imageSrc={uploadedImage}
                  selectedModel={selectedModel}
                  onReplaceClick={handleReplaceClick}
                  onDeleteClick={handleDeleteImage}
                  fileInputRef={fileInputRef}
                />
              </div>
            </div>

            {/* Generation Controls */}
            <div className="space-y-4">
              <Generate3DButton
                status={status}
                progress={progress}
                hasModel={status === "completed"}
                onGenerate={handleGenerate3D}
                onRetry={handleGenerate3D}
                disabled={status === "uploading" || status === "processing"}
              />

              {/* Processing Status */}
              {(status === "processing" || status === "uploading") && (
                <div className="mt-4">
                  <ProcessingStatus 
                    status={status}
                    progress={progress}
                    isPolling={isPolling}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 rounded-2xl" />
            <UploadDropzone
              onDrop={handleFileDrop}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              error={error}
            />
          </div>
        )}

        {/* History Link - Always Visible */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/history"
            className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
              <History className="w-4 h-4" />
            </div>
            <span>View History</span>
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default ImageUploader;