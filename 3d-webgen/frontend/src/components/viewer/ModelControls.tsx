import { 
  Maximize, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Play,
  Pause,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Home,
  Minimize
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  const resetRotation = () => {
    onRotationChange({ x: 0, y: 0, z: 0 });
  };

  const resetToDefault = () => {
    onRotationChange({ x: 0, y: 0, z: 0 });
    // Could also reset zoom to default if that function was available
  };

  const formatAngle = (radians: number) => {
    return Math.round(radians * (180 / Math.PI));
  };

  return (
    <>
      {/* 🎮 Top Control Bar */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-2 p-2 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
          
          {/* 🔍 Zoom Controls - SENZA PERCENTUALE */}
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-9 w-9 p-0 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 hover:scale-110"
              onClick={onZoomIn}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-9 w-9 p-0 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 hover:scale-110"
              onClick={onZoomOut}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Separatori e controlli aggiuntivi solo se NON è fullscreen */}
          {!isFullScreen && (
            <>
              {/* 📐 Separator */}
              <div className="w-px h-6 bg-white/20" />

              {/* 🔄 Rotation Controls */}
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-9 w-9 p-0 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 hover:scale-110"
                onClick={resetRotation}
                title="Reset Rotation"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              {/* 📐 Separator */}
              <div className="w-px h-6 bg-white/20" />
            </>
          )}

          {/* Separatore prima dei controlli sempre visibili */}
          {isFullScreen && <div className="w-px h-6 bg-white/20" />}

          {/* 👁️ Visibility Toggle */}
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-9 w-9 p-0 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 hover:scale-110"
            onClick={() => setIsControlsVisible(!isControlsVisible)}
            title={isControlsVisible ? "Hide Controls" : "Show Controls"}
          >
            {isControlsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>

          {/* 📐 Separator */}
          <div className="w-px h-6 bg-white/20" />

          {/* ⚙️ Advanced Settings */}
          <Button 
            size="sm" 
            variant="ghost" 
            className={`h-9 w-9 p-0 rounded-xl transition-all duration-300 hover:scale-110 ${
              showAdvanced 
                ? "bg-blue-500/80 text-white" 
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            onClick={() => setShowAdvanced(!showAdvanced)}
            title="Advanced Controls"
          >
            <Settings className={`h-4 w-4 ${showAdvanced ? 'animate-spin' : ''}`} />
          </Button>

          {/* 📐 Separator */}
          <div className="w-px h-6 bg-white/20" />

          {/* 🖥️ Fullscreen */}
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-9 w-9 p-0 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 hover:scale-110"
            onClick={onFullScreen}
            title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* 🎛️ Bottom Control Panel */}
      {isControlsVisible && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            
            {/* 🎮 Main Controls */}
            <div className="p-4">
              
              {/* 🔄 Auto-Rotate Toggle - RIMOSSA ICONA SUONO */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl">
                    <div className={`w-2 h-2 rounded-full ${autoRotate ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-white text-sm font-medium">
                      {autoRotate ? "Auto Rotating" : "Manual Control"}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                      autoRotate 
                        ? "bg-orange-500/80 hover:bg-orange-600/80 text-white" 
                        : "bg-green-500/80 hover:bg-green-600/80 text-white"
                    }`}
                    onClick={onAutoRotateToggle}
                  >
                    {autoRotate ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Auto Rotate
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* 🎚️ Rotation Sliders */}
              <div className="space-y-3">
                {(["x", "y", "z"] as const).map((axis, index) => (
                  <div key={axis} className="group">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <div className={`w-3 h-3 rounded-full ${
                          axis === 'x' ? 'bg-red-400' : axis === 'y' ? 'bg-green-400' : 'bg-blue-400'
                        }`} />
                        <span className="text-white text-sm font-medium capitalize">
                          {axis}-Axis
                        </span>
                      </div>
                      
                      <div className="flex-1 relative">
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
                      
                      <div className="min-w-[60px] text-right">
                        <span className="text-white text-sm font-mono bg-white/10 px-2 py-1 rounded-lg">
                          {formatAngle(rotation[axis])}°
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ⚙️ Advanced Controls Panel - RIMOSSA SEZIONE CURRENT STATUS */}
            {showAdvanced && (
              <div className="border-t border-white/10 bg-black/20 p-4 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Advanced Controls
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  
                  {/* 🎯 Preset Views */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-auto flex-col py-3"
                    onClick={() => onRotationChange({ x: 0, y: 0, z: 0 })}
                  >
                    <Home className="h-4 w-4 mb-1" />
                    <span className="text-xs">Front</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-auto flex-col py-3"
                    onClick={() => onRotationChange({ x: 0, y: Math.PI/2, z: 0 })}
                  >
                    <Eye className="h-4 w-4 mb-1" />
                    <span className="text-xs">Side</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-auto flex-col py-3"
                    onClick={() => onRotationChange({ x: Math.PI/2, y: 0, z: 0 })}
                  >
                    <RotateCcw className="h-4 w-4 mb-1" />
                    <span className="text-xs">Top</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-auto flex-col py-3"
                    onClick={() => onRotationChange({ x: Math.PI/4, y: Math.PI/4, z: 0 })}
                  >
                    <RefreshCw className="h-4 w-4 mb-1" />
                    <span className="text-xs">Isometric</span>
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 💡 Quick Help Tooltip */}
      {!isControlsVisible && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 text-white text-xs animate-pulse">
            Click the eye icon to show controls
          </div>
        </div>
      )}
    </>
  );
};

export default ModelControls;