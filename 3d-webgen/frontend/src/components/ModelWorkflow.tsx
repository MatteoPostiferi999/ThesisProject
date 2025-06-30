import { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";
import Viewer3D from "./Viewer3D";
import ModelSelector, { ModelType } from "./ModelSelector";
import NoModelPlaceholder from "./viewer/NoModelPlaceholder";
import TechnicalDetails from "./TechnicalDetails";
import { 
  CheckCircle2, 
  Sparkles
} from "lucide-react";

type WorkflowStep = 'select' | 'upload' | 'generate' | 'view';

const ModelWorkflow = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>("hunyuan-mini");
  const [model3DUrl, setModel3DUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('select');
  const [isProcessing, setIsProcessing] = useState(false);

  // Update current step based on state
  useEffect(() => {
    if (model3DUrl) {
      setCurrentStep('view');
    } else if (uploadedImage) {
      setCurrentStep('generate');
    } else {
      setCurrentStep('upload');
    }
  }, [uploadedImage, model3DUrl]);

  const handleImageUploaded = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setModel3DUrl(null); // Reset 3D model when new image is uploaded
  };

  const handleImageDelete = () => {
    setUploadedImage(null);
    setModel3DUrl(null);
  };

  const handleGenerate = () => {
    setIsProcessing(true);
    // The processing will be handled by ImageUploader component
  };

  const handleModelDelete = () => {
    setModel3DUrl(null);
    setIsProcessing(false);
  };

  return (
    <div className="relative">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/5 dark:to-purple-950/10 rounded-3xl blur-3xl -z-10" />
      
      <div className="relative">
        
        {/* Main Workflow Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Left Column - Input */}
          <div className="space-y-6">
            
            {/* Model Selection */}
            <div className="relative">
              <ModelSelector 
                selectedModel={selectedModel} 
                onModelSelect={setSelectedModel} 
              />
              {/* Completion Badge */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            </div>

            {/* Image Upload */}
            <div className="relative">
              <ImageUploader
                onImageUploaded={handleImageUploaded}
                onImageDelete={handleImageDelete}
                uploadedImage={uploadedImage}
                selectedModel={selectedModel}
                setModelUrl={setModel3DUrl}
                onGenerate={handleGenerate}
                isProcessing={isProcessing}
              />
              {uploadedImage && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="relative">
            
            {/* 3D Viewer or Placeholder */}
            <div className="sticky top-8">
              {model3DUrl ? (
                <div className="relative">
                  <Viewer3D 
                    modelUrl={model3DUrl} 
                    onModelDelete={handleModelDelete}
                  />
                  {/* Success Badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  
                  {/* Success Message */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-200">
                          Generation Complete
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your 3D model is ready for viewing and download.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <NoModelPlaceholder />
              )}
            </div>
          </div>
        </div>

        {/* Technical Details Section */}
        <div className="mt-12">
          <TechnicalDetails />
        </div>

      </div>
    </div>
  );
};

export default ModelWorkflow;