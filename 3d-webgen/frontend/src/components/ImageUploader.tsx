import { useState, useRef } from "react";
import { toast } from "@/components/ui/sonner";
import { ModelType } from "./ModelSelector";
import { useImageUpload, getModelName } from "@/hooks/useImageUpload";
import UploadDropzone from "./upload/UploadDropzone";
import ImagePreview from "./upload/ImagePreview";
import Generate3DButton from "@/components/generate3DButton";
import axios from "axios";
import ProcessingStatus from "@/components/ProcessingStatus";


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
  const [status, setStatus] = useState<StatusType>("idle");
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);


const pollJobStatus = (jobId: number) => {
  setStatus("processing");

  const interval = setInterval(async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/job/${jobId}/`);
      const jobStatus = response.data.status;
      const jobProgress = response.data.progress ?? 0;

      console.log("[POLL] Job status:", jobStatus);
      console.log("[POLL] Full response:", response.data);

      if (jobStatus === "COMPLETED") {
        clearInterval(interval);

        console.log("[POLL] Job completed ✅");
        console.log("[POLL] mesh_url:", response.data.mesh_url);
        console.log("[POLL] Simulated model3DUrl:", response.data.mesh_url);
        console.log("[POLL] hasStartedGeneration: true");
        console.log("[POLL] isProcessing: false");

        if (response.data.mesh_url) {
          setModelUrl(response.data.mesh_url);
          setStatus("completed");
          toast.success("3D model ready!");
        } else {
          setStatus("error");
          toast.error("Mesh URL missing from response.");
        }

      } else if (jobStatus === "FAILED") {
        clearInterval(interval);
        setStatus("error");
        toast.error("Failed to generate 3D model.");
      } else {
        setProgress(jobProgress);
        console.log("[POLL] Progress:", jobProgress);
      }

    } catch (err) {
      clearInterval(interval);
      setStatus("error");
      console.error("[POLL] Error during status check:", err);
      toast.error("Error checking job status.");
    }
  }, 1000);
};


const handleGenerate3D = async () => {
  if (!uploadedImage) {
    toast.error("Please upload an image first.");
    return;
  }

  setStatus("uploading");
  setHasStartedGeneration(true);

  // Fai fetch dell’immagine convertita in File
  const response = await fetch(uploadedImage);
  const blob = await response.blob();
  const file = new File([blob], "image.jpg", { type: blob.type });

  // Upload al backend
  const formData = new FormData();
  formData.append("image", file);

  const uploadResponse = await axios.post("http://localhost:8000/api/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // Solo ora: avvia il polling per il job!
  pollJobStatus(uploadResponse.data.job_id);
};

  const { error, isDragging, setIsDragging, handleFileDrop } = useImageUpload({
    onImageUploaded: (imageDataUrl) => {
      onImageUploaded(imageDataUrl);
      setStatus("idle");
      toast.success("Image uploaded successfully!", {
        description: `Ready for ${getModelName(selectedModel)} model processing.`,
      });
    }
  });

  const handleDeleteImage = () => {
    onImageDelete();
    setStatus("idle");
    toast.info("Image deleted", {
      description: "The image has been removed along with any 3D model.",
    });
  };

  const handleReplaceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div id="uploader-section" className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Upload Your Image</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Selected model: <span className="font-medium text-foreground">{getModelName(selectedModel)}</span>
      </p>

      {uploadedImage ? (
  <div className="space-y-4">
    <ImagePreview 
      imageSrc={uploadedImage}
      selectedModel={selectedModel}
      onReplaceClick={handleReplaceClick}
      onDeleteClick={handleDeleteImage}
    />

    {/* <ProcessingStatus
      hasStartedGeneration={hasStartedGeneration}
      progress={progress}
    />
    */}

    <Generate3DButton
      status={status}
      progress={progress}
      hasModel={status === "completed"}
      onGenerate={handleGenerate3D}
      onRetry={handleGenerate3D}
      disabled={status === "uploading" || status === "processing"}
    />
  </div>
) : (
  <UploadDropzone
    onDrop={handleFileDrop}
    isDragging={isDragging}
    setIsDragging={setIsDragging}
    error={error}
  />
)}

    </div>
  );
};

export default ImageUploader;
