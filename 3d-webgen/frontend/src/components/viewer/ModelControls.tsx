import { Maximize, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ModelControlsProps {
  isFullScreen: boolean;
  rotation: { x: number; y: number; z: number };
  autoRotate: boolean;
  zoom: number;
  onRotationChange: (rotation: { x: number; y: number; z: number }) => void;
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
      {/* Top buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/20 text-white" onClick={onZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/20 text-white" onClick={onZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/20 text-white" onClick={onFullScreen}>
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Rotation sliders */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg p-2 flex flex-col gap-2 text-white">
        {(["x", "y", "z"] as const).map((axis) => (
          <div key={axis} className="flex items-center gap-4">
            <span className="text-xs w-12 capitalize">Rot {axis}</span>
            <Slider
              value={[rotation[axis] * (180 / Math.PI)]}
              min={0}
              max={360}
              step={1}
              onValueChange={(v) => {
                onRotationChange({
                  ...rotation,
                  [axis]: v[0] * (Math.PI / 180),
                });
              }}
              className="flex-1"
            />
          </div>
        ))}

        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs px-2 text-white hover:bg-white/20 mt-2 self-end"
          onClick={onAutoRotateToggle}
        >
          {autoRotate ? "Manual" : "Auto"}
        </Button>
      </div>
    </>
  );
};

export default ModelControls;
