import React from "react";
import { 
  Loader2, 
  RefreshCw, 
  XCircle, 
  Download, 
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";

type StatusType = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

interface Generate3DButtonProps {
  onGenerate: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
  onDownload?: () => void;
  status: StatusType;
  progress?: number;
  loading?: boolean;
  hasModel: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const Generate3DButton: React.FC<Generate3DButtonProps> = ({
  onGenerate,
  onCancel,
  onRetry,
  onDownload,
  status,
  progress = 0,
  loading,
  hasModel,
  error,
  disabled = false,
  className = '',
}) => {

  const getButtonConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          text: 'Uploading Image',
          subtext: 'Preparing image for processing',
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          bgGradient: 'from-blue-500 to-blue-600',
          hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
          action: onCancel || (() => {}),
        };

      case 'processing':
        return {
          text: 'Processing 3D Reconstruction',
          subtext: 'Analyzing image structure',
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          bgGradient: 'from-purple-500 to-purple-600',
          hoverGradient: 'hover:from-purple-600 hover:to-purple-700',
          action: onCancel || (() => {}),
        };

      case 'completed':
        return {
          text: hasModel ? 'Generate New Model' : 'Generate 3D Model',
          subtext: hasModel ? 'Process another image' : 'Start 3D reconstruction',
          icon: hasModel ? <RefreshCw className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />,
          // COLORI AGGIORNATI PER GENERATE NEW MODEL - PIÙ CHIARI
          bgGradient: hasModel ? 'from-gray-400 to-gray-500' : 'from-green-500 to-green-600',
          hoverGradient: hasModel ? 'hover:from-gray-500 hover:to-gray-600' : 'hover:from-green-600 hover:to-green-700',
          action: onGenerate,
        };

      case 'error':
        return {
          text: 'Retry Generation',
          subtext: 'Process failed, retry operation',
          icon: <AlertTriangle className="w-5 h-5" />,
          bgGradient: 'from-red-500 to-red-600',
          hoverGradient: 'hover:from-red-600 hover:to-red-700',
          action: onRetry || onGenerate,
        };

      case 'idle':
      default:
        return {
          text: hasModel ? 'Generate New Model' : 'Generate 3D Model',
          subtext: hasModel ? 'Process another image' : 'Start 3D reconstruction',
          icon: hasModel ? <RefreshCw className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />,
          // COLORI AGGIORNATI PER GENERATE NEW MODEL - PIÙ CHIARI
          bgGradient: hasModel ? 'from-gray-400 to-gray-500' : 'from-blue-500 to-blue-600',
          hoverGradient: hasModel ? 'hover:from-gray-500 hover:to-gray-600' : 'hover:from-blue-600 hover:to-blue-700',
          action: onGenerate,
        };
    }
  };

  const config = getButtonConfig();
  const isProcessing = loading || status === 'uploading' || status === 'processing';

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Main Action Button */}
      <Button
        onClick={config.action}
        disabled={disabled || (isProcessing && !onCancel)}
        className={`w-full h-auto p-0 bg-gradient-to-r ${config.bgGradient} ${config.hoverGradient} text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
        size="lg"
      >
        <div className="px-6 py-4 flex items-center justify-center gap-3">
          <div className="flex items-center gap-3">
            {config.icon}
            <div className="text-left">
              <div className="text-base font-semibold">
                {config.text}
              </div>
              <div className="text-sm opacity-90">
                {config.subtext}
              </div>
            </div>
          </div>
        </div>
      </Button>

      {/* Secondary Actions - RIMOSSA ICONA VIEW MODEL */}
      {status === 'completed' && hasModel && onDownload && (
        <div className="flex justify-center">
          <Button
            onClick={onDownload}
            variant="outline"
            className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            <span>Download</span>
          </Button>
        </div>
      )}

      {/* Error Message */}
      {status === 'error' && error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200 text-sm">
                Generation Failed
              </h4>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                {error || "Processing failed. Please verify input parameters and retry."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {status === 'completed' && (
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200 text-sm">
                Model Generation Completed
              </h4>
              <p className="text-green-700 dark:text-green-300 text-sm">
                3D reconstruction process finished successfully
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Generate3DButton;