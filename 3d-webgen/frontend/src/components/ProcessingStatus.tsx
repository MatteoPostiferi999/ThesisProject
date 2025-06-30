import { Loader } from "lucide-react";

interface ProcessingStatusProps {
  status?: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress?: number;
  isPolling?: boolean;
  hasStartedGeneration?: boolean;
  isProcessing?: boolean;
}

const ProcessingStatus = ({ 
  status = 'idle',
  hasStartedGeneration = false,
  isProcessing = false 
}: ProcessingStatusProps) => {

  // Don't render anything - component is disabled
  return null;
};

export default ProcessingStatus;