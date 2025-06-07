import { useState } from "react";
import ImageUploader from "./ImageUploader";
import Viewer3D from "./Viewer3D";
import ModelSelector, { ModelType } from "./ModelSelector";

const ModelWorkflow = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>("hunyuan-mini-turbo");
  const [model3DUrl, setModel3DUrl] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} />
        <ImageUploader
          onImageUploaded={setUploadedImage}
          onImageDelete={() => setUploadedImage(null)}
          uploadedImage={uploadedImage}
          selectedModel={selectedModel}
          setModelUrl={setModel3DUrl}
          onGenerate={() => {}} 
          isProcessing={false}  
        />
      </div>
      <div>
        {model3DUrl && (
          <Viewer3D modelUrl={model3DUrl} onModelDelete={() => setModel3DUrl(null)} />
        )}
      </div>
    </div>
  );
};

export default ModelWorkflow;
