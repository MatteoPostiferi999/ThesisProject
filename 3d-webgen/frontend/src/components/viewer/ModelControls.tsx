
import { Eye, Download, Maximize, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Slider } from "../../components/ui/slider";

interface ModelControlsProps {
  isFullScreen: boolean;
  rotation: number;
  autoRotate: boolean;
  zoom: number;
  onRotationChange: (value: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullScreen: () => void;
  onAutoRotateToggle: () => void;
  onModelDelete?: () => void;
}

const ModelControls = ({
  isFullScreen,
  rotation,
  autoRotate,
  zoom,
  onRotationChange,
  onZoomIn,
  onZoomOut,
  onFullScreen,
  onAutoRotateToggle,
  onModelDelete
}: ModelControlsProps) => {
  return (
    <>
      {/* Top controls - zoom and fullscreen buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm text-white hover:bg-white/20" 
          onClick={onZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm text-white hover:bg-white/20" 
          onClick={onZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm text-white hover:bg-white/20" 
          onClick={onFullScreen}
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Bottom controls - rotation slider */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg p-2 flex items-center gap-4 text-white">
        <span className="text-xs">Rotation</span>
        <Slider
          value={[rotation * 30]}
          min={0}
          max={360}
          step={1}
          onValueChange={(value: number[]) => {
          onRotationChange(value[0] / 30);
          }}

          className="flex-1"
        />
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs px-2 text-white hover:bg-white/20"
          onClick={onAutoRotateToggle}
        >
          {autoRotate ? "Manual" : "Auto"}
        </Button>
      </div>
    </>
  );
};

export default ModelControls;