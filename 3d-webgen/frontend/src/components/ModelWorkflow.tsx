import { useState } from "react";
import ImageUploader from "./ImageUploader";
import ProcessingStatus from "./ProcessingStatus";
import Viewer3D from "./Viewer3D";
import TechnicalDetails from "./TechnicalDetails";
import ModelSelector, { ModelType } from "./ModelSelector";

const ModelWorkflow = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [model3DUrl, setModel3DUrl] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [selectedModel, setSelectedModel] = useState<ModelType>("hunyuan-mini-turbo");
  const [hasStartedGeneration, setHasStartedGeneration] = useState<boolean>(false);

  const handleImageUpload = (imageDataUrl: string) => {
    setUploadedImage(imageDataUrl);
    setModel3DUrl(null);
    setHasStartedGeneration(false);
  };

  const handleGenerate3D = () => {
    if (!uploadedImage) return;

    setHasStartedGeneration(true);
    setIsProcessing(true);
    setProcessingProgress(0);

    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        const next = prev + Math.random() * 10;
        return next > 100 ? 100 : next;
      });
    }, 500);

    const processingTimeMap: Record<ModelType, number> = {
      "hunyuan-mini-turbo": 5000,
      "hunyuan-mini-fast": 6000,
      "hunyuan-mini": 7000,
      "hunyuan-mv-turbo": 8000,
      "hunyuan-mv-fast": 9000,
      "hunyuan-mv": 10000,
      "hunyuan-v2-0-turbo": 11000,
      "hunyuan-v2-0-fast": 12000,
      "hunyuan-v2-0": 13000,
    };

    setTimeout(() => {
      clearInterval(interval);
      setProcessingProgress(100);
      setIsProcessing(false);
      setModel3DUrl(`${selectedModel}-model`);
    }, processingTimeMap[selectedModel]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} />
        <ImageUploader
          onImageUploaded={handleImageUpload}
          onImageDelete={() => setUploadedImage(null)}
          uploadedImage={uploadedImage}
          selectedModel={selectedModel}
          setModelUrl={setModel3DUrl}
          onGenerate={handleGenerate3D}
          isProcessing={isProcessing}
        />
        <ProcessingStatus
          hasStartedGeneration={hasStartedGeneration}
          isProcessing={isProcessing}
          progress={processingProgress}
        />
      </div>
      <div>
        {model3DUrl && !isProcessing && (
          <Viewer3D modelUrl={model3DUrl} onModelDelete={() => setModel3DUrl(null)} />
        )}
      </div>
    </div>
  );
};

export default ModelWorkflow;
