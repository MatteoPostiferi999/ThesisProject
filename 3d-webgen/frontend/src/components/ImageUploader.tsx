import { useState, useRef } from "react";
import { toast } from "@/components/ui/sonner";
import { ModelType } from "./ModelSelector";
import { useImageUpload, getModelName } from "@/hooks/useImageUpload";
import UploadDropzone from "./upload/UploadDropzone";
import ImagePreview from "./upload/ImagePreview";
import Generate3DButton from "@/components/generate3DButton";
import axios from "axios";
import ProcessingStatus from "@/components/ProcessingStatus";
import { getJobStatus } from "@/services/api/jobService"; 
import { uploadImage } from "@/services/api/jobService";
import { Link } from "react-router-dom";



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
      const data = await getJobStatus(jobId); 
      const jobStatus = data.status;
      const jobProgress = data.progress ?? 0;

      console.log("[POLL] Job status:", jobStatus);
      console.log("[POLL] Full response:", data);

      if (jobStatus === "COMPLETED") {
        clearInterval(interval);

        if (!data.mesh_url) {
          setStatus("error");
          toast.error("Mesh URL missing from response.");
          return;
        }

        setModelUrl(data.mesh_url);
        setStatus("completed");
        toast.success("3D model ready!");

        const token = localStorage.getItem("authToken");
        if (!token || !uploadedImage || !selectedModel) {
          toast.error("Missing info for saving model.");
          return;
        }

        try {
          await axios.post(
            "/api/generated-models/save/",
            {
              input_image: uploadedImage,
              output_model: data.mesh_url,
              model_name: selectedModel,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          toast.success("Model saved to your history!");
          console.log("✅ Model saved to history");
        } catch (saveErr) {
          console.error("❌ Failed to save model:", saveErr);
          toast.error("Could not save model to history.");
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

  try {
    const response = await fetch(uploadedImage);
    const blob = await response.blob();
    const file = new File([blob], "image.jpg", { type: blob.type });

    const formData = new FormData();
    formData.append("image", file);

    const uploadResponse = await uploadImage(formData); 
    pollJobStatus(uploadResponse.job_id);              
  } catch (err) {
    console.error("Upload failed:", err);
    toast.error("Failed to upload image.");
    setStatus("error");
  }
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
  <>
    <UploadDropzone
      onDrop={handleFileDrop}
      isDragging={isDragging}
      setIsDragging={setIsDragging}
      error={error}
    />
    <Link
      to="/history"
      className="mt-6 inline-block bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-sm"
    >
      View My History
    </Link>
  </>
)

}

    </div>
  );
};

export default ImageUploader;
