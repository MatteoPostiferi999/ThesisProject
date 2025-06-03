import React from "react";
import { Loader2, RefreshCw, XCircle, Zap, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
          text: 'Uploading Image...',
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          variant: 'default' as const,
          action: onCancel || (() => {}),
          showProgress: false,
        };

      case 'processing':
        return {
          text: `Processing... ${progress > 0 ? `${Math.round(progress)}%` : ''}`,
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          variant: 'default' as const,
          action: onCancel || (() => {}),
          showProgress: true,
        };

      case 'completed':
        return {
          text: hasModel ? 'Regenerate 3D Model' : 'Generate 3D Model',
          icon: hasModel ? <RefreshCw className="w-4 h-4" /> : <Zap className="w-4 h-4" />,
          variant: hasModel ? ('outline' as const) : ('default' as const),
          action: onGenerate,
          showProgress: false,
        };

      case 'error':
        return {
          text: 'Retry Generation',
          icon: <XCircle className="w-4 h-4" />,
          variant: 'destructive' as const,
          action: onRetry || onGenerate,
          showProgress: false,
        };

      case 'idle':
      default:
        return {
          text: hasModel ? 'Regenerate 3D Model' : 'Generate 3D Model',
          icon: hasModel ? <RefreshCw className="w-4 h-4" /> : <Zap className="w-4 h-4" />,
          variant: hasModel ? ('outline' as const) : ('default' as const),
          action: onGenerate,
          showProgress: false,
        };
    }
  };

  const config = getButtonConfig();
  const isProcessing = loading || status === 'uploading' || status === 'processing';

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main Action Button */}
      <Button
        onClick={config.action}
        disabled={disabled || (isProcessing && !onCancel)}
        variant={config.variant}
        className="w-full"
        size="lg"
      >
        {config.icon}
        <span className="ml-2">{config.text}</span>
      </Button>

      {/* Progress Bar */}
      {config.showProgress && progress > 0 && (
        <div className="space-y-1">
          <Progress value={progress} className="w-full h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(progress)}% complete
          </p>
        </div>
      )}

      {/* Secondary Actions */}
      {status === 'completed' && hasModel && onDownload && (
        <Button
          onClick={onDownload}
          variant="secondary"
          className="w-full"
        >
          <Download className="w-4 h-4" />
          <span className="ml-2">Download Model</span>
        </Button>
      )}
    </div>
  );
};

export default Generate3DButton;
