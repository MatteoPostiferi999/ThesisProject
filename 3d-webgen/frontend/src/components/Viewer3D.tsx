import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useState, useRef, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three-stdlib";
import * as THREE from "three";
import ModelControls from "@/components/viewer/ModelControls";
import NoModelPlaceholder from "@/components/viewer/NoModelPlaceholder";

import { 
  Eye, 
  Maximize, 
  Download, 
  RotateCcw, 
  Loader2,
  Sparkles,
  Box,
  Zap,
  Camera,
  Trash2
} from "lucide-react";

// Simplified toast system
const toast = {
  success: (message, options = {}) => {
    console.log('✅', message, options);
  },
  error: (message, options = {}) => {
    console.error('❌', message, options);
  },
  info: (message, options = {}) => {
    console.log('ℹ️', message, options);
  }
};

// Card components (simplified)
const Card = ({ className, children }) => (
  <div className={`rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ className, children }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// Enhanced OBJ Model Component with responsive scaling
const OBJModel = ({ 
  url, 
  rotation, 
  autoRotate, 
  scale = 1.5,
  onLoad,
  onError,
  isFullScreen = false
}) => {
  console.log("🎯 OBJModel attempting to load:", url);
  
  let obj;
  try {
    obj = useLoader(OBJLoader, url);
    console.log("✅ OBJModel loaded successfully:", obj);
    
    useEffect(() => {
      if (obj && onLoad) {
        console.log("📢 Notifying parent: model loaded");
        onLoad();
      }
    }, [obj, onLoad]);
    
  } catch (error) {
    console.error("❌ OBJModel failed to load:", error);
    console.error("❌ Failed URL:", url);
    
    useEffect(() => {
      if (onError) {
        console.log("📢 Notifying parent: model error");
        onError(error);
      }
    }, [onError]);
    
    throw error;
  }
  
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    if (ref.current && !autoRotate) {
      ref.current.rotation.set(rotation.x, rotation.y, rotation.z);
    }
  }, [rotation, autoRotate]);

  // Auto-rotation animation
  useEffect(() => {
    if (!autoRotate || !ref.current) return;
    
    const interval = setInterval(() => {
      if (ref.current) {
        ref.current.rotation.y += 0.01;
      }
    }, 16);
    
    return () => clearInterval(interval);
  }, [autoRotate]);

  // ✅ FIXED: Dynamic scaling based on container and fullscreen mode
  useEffect(() => {
    if (obj && ref.current) {
      console.log("🎯 Centering and scaling model...");
      
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      console.log("📦 Model dimensions:", {
        x: size.x, 
        y: size.y, 
        z: size.z
      });
      console.log("📍 Model center:", {
        x: center.x, 
        y: center.y, 
        z: center.z
      });
      
      // Center the model
      obj.position.sub(center);
      
      // ✅ DYNAMIC SCALING: Different scale for fullscreen vs normal vs modal
      const maxDim = Math.max(size.x, size.y, size.z);
      let targetScale;
      
      if (isFullScreen) {
        // In fullscreen, use a more conservative scale
        targetScale = 2.5 / maxDim;
      } else {
        // In normal view or modal, use original scale logic
        targetScale = scale / maxDim;
      }
      
      ref.current.scale.setScalar(targetScale);
      
      console.log("📏 Applied scale:", targetScale, "| Fullscreen:", isFullScreen);
    }
  }, [obj, scale, isFullScreen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up OBJ model resources...");
      if (obj) {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      }
    };
  }, [obj]);

  return (
    <group ref={ref}>
      <primitive object={obj} />
    </group>
  );
};

// Loading Component
const Loading3D = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50/90 to-indigo-100/90 dark:from-gray-900/90 dark:to-blue-950/90 backdrop-blur-sm rounded-lg">
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
          <Box className="w-8 h-8 text-white" />
        </div>
        <div className="absolute inset-0 w-16 h-16 bg-blue-400 rounded-full animate-ping opacity-20" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Loading 3D Model
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Preparing your masterpiece...
        </p>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        <span className="text-xs text-gray-500">Please wait</span>
      </div>
    </div>
  </div>
);

interface Viewer3DProps {
  modelUrl: string | null;
  onModelDelete?: () => void;
  isModal?: boolean;
  isProcessing?: boolean;
  processingStatus?: string;
}

const Viewer3D = ({ 
  modelUrl, 
  onModelDelete, 
  isModal = false,
  isProcessing = false,
  processingStatus = "Generating 3D Model..."
}: Viewer3DProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [autoRotate, setAutoRotate] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef<any>(null);

  // ✅ RESPONSIVE: Dynamic camera position based on screen size and viewer mode
  const getCameraPosition = (): [number, number, number] => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    
    if (isFullScreen) {
      return [0, 0, 4]; // Closer camera for fullscreen
    } else if (isModal) {
      // Modal: closer on mobile for better view
      return screenWidth < 640 ? [0, 0, 3] : [0, 0, 3.5];
    }
    // Normal view: responsive distance
    return screenWidth < 640 ? [0, 0, 4] : [0, 0, 5];
  };

  // ✅ RESPONSIVE: Dynamic scale based on screen size and container
  const getModelScale = () => {
    // Get screen width for responsive scaling
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    
    if (isFullScreen) {
      return 1.2; // Smaller base scale for fullscreen
    } else if (isModal) {
      // Modal: scale based on screen size
      return screenWidth < 640 ? 1.8 : 2.2; // Smaller on mobile, larger on desktop
    }
    // Normal view: scale based on screen size
    return screenWidth < 640 ? 1.5 : 1.8; // Responsive scaling
  };

  // Handle fullscreen
  const handleFullScreen = () => {
    const container = document.getElementById("viewer-container");
    if (!container) return;

    try {
      if (!isFullScreen) {
        container.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullScreen(!isFullScreen);
    } catch (error) {
      console.error("Fullscreen error:", error);
      toast.error("Fullscreen not supported");
    }
  };

  // ✅ FIXED: Reset view and dimensions when switching fullscreen mode
  useEffect(() => {
    if (controlsRef.current && controlsRef.current.reset) {
      // Small delay to ensure the transition is complete
      setTimeout(() => {
        controlsRef.current.reset();
        // ✅ Force reset zoom to default when changing fullscreen mode
        setZoom(1);
        console.log("🔄 Camera controls reset for mode:", isFullScreen ? 'fullscreen' : 'normal');
      }, 100);
    }
  }, [isFullScreen]);

  // ✅ RESPONSIVE: Update scale and camera when window resizes
  useEffect(() => {
    const handleResize = () => {
      // Force re-render to update responsive values
      if (controlsRef.current && controlsRef.current.update) {
        controlsRef.current.update();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gestione del tasto ESC e dell'evento fullscreenchange
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    const handleFullscreenChange = () => {
      const doc = document as any;
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      
      setIsFullScreen(isCurrentlyFullscreen);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isFullScreen]);

  // Handle model deletion
  const handleDeleteModel = () => {
    if (onModelDelete) {
      onModelDelete();
      toast.success("🗑️ 3D model deleted", {
        description: "You can generate a new model anytime!"
      });
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (controlsRef.current) {
      const newZoom = Math.min(zoom * 1.2, 3);
      setZoom(newZoom);
      if (controlsRef.current.dollyOut) {
        controlsRef.current.dollyOut(0.8);
      }
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      const newZoom = Math.max(zoom * 0.8, 0.5);
      setZoom(newZoom);
      if (controlsRef.current.dollyIn) {
        controlsRef.current.dollyIn(0.8);
      }
    }
  };

  // Reset view
  const resetView = () => {
    setRotation({ x: 0, y: 0, z: 0 });
    setZoom(1);
    if (controlsRef.current && controlsRef.current.reset) {
      controlsRef.current.reset();
    }
    toast.info("🔄 View reset to default");
  };

  // Handle loading states
  const handleModelLoad = () => {
    setIsLoading(false);
    setLoadError(false);
    toast.success("✨ 3D model loaded successfully!");
  };

  const handleModelError = () => {
    setIsLoading(false);
    setLoadError(true);
    toast.error("❌ Failed to load 3D model");
  };

  // Reset states when model changes
  useEffect(() => {
    if (modelUrl) {
      setIsLoading(true);
      setLoadError(false);
      setRotation({ x: 0, y: 0, z: 0 });
      setZoom(1);
      setAutoRotate(false);
    }
  }, [modelUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current = null;
      }
      if (controlsRef.current && controlsRef.current.dispose) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (modelUrl) {
      console.log("🔍 Viewer3D received modelUrl:", modelUrl);
    }
  }, [modelUrl]);

  return (
    <div className="relative w-full h-full min-h-0 overflow-hidden">
      
      {/* Background Effects - SOLO SE NON È MODAL */}
      {!isModal && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900/50 dark:via-blue-950/20 dark:to-indigo-950/30 rounded-3xl blur-3xl -z-10" />
      )}
      
      <Card className={`relative w-full h-full min-h-0 ${
        isModal 
          ? 'bg-transparent border-none shadow-none' 
          : 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl transition-all duration-500 hover:shadow-3xl'
      }`}>
        <CardContent className={`w-full h-full min-h-0 flex flex-col ${isModal ? "p-0" : "p-4 sm:p-6 lg:p-8"}`}>
          
          {/* Header - SOLO SE NON È MODAL */}
          {!isModal && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    3D Model Viewer
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Interactive preview and controls
                  </p>
                </div>
              </div>
              
              {/* Quick Actions */}
              {modelUrl && !isLoading && !loadError && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetView}
                    className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-colors"
                    title="Reset View"
                  >
                    <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={handleFullScreen}
                    className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg sm:rounded-xl transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {!modelUrl ? (
            <div className="relative flex-1 min-h-0">
              <NoModelPlaceholder 
                isProcessing={isProcessing}
                processingStatus={processingStatus}
              />
            </div>
          ) : (
            /* ✅ FIXED: Remove flex-1 to prevent stretching and set fixed dimensions */
            <div className={`flex flex-col ${isModal ? 'gap-1 sm:gap-2' : 'gap-4 sm:gap-6'} ${
              isModal 
                ? 'rounded-lg sm:rounded-xl p-1 sm:p-2 bg-white/10 backdrop-blur-sm' 
                : 'border-2 border-gray-800 dark:border-gray-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'
            }`}>
              
              {/* ✅ RESPONSIVE: 3D Viewer Container that adapts to all screen sizes */}
              <div
                id="viewer-container"
                className="relative w-full bg-gradient-to-br from-blue-800 to-blue-900 dark:from-blue-900 dark:to-blue-950 rounded-lg sm:rounded-xl overflow-hidden shadow-inner"
                style={{ 
                  // ✅ RESPONSIVE: Adaptive sizing for all devices
                  ...(isModal ? {
                    // Modal mode: Fill the container completely
                    height: '100%',
                    minHeight: 'min(400px, 70vh)', // Responsive minimum
                    aspectRatio: '1/1' // Square for modal
                  } : {
                    // Normal mode: Responsive dimensions
                    aspectRatio: '4/3',
                    height: 'clamp(250px, 50vh, 500px)', // Responsive height
                    minHeight: '250px', // Mobile minimum
                    maxHeight: '500px'  // Desktop maximum
                  })
                }}
              >
                
                {/* ✅ FIXED: Dynamic Canvas with responsive camera */}
                <Canvas
                  camera={{ 
                    position: getCameraPosition(), 
                    fov: isFullScreen ? 60 : 50 // Wider FOV for fullscreen
                  }}
                  gl={{ 
                    antialias: true, 
                    alpha: true,
                    preserveDrawingBuffer: false,
                    powerPreference: "high-performance"
                  }}
                  shadows
                  onCreated={({ gl }) => {
                    gl.toneMapping = THREE.ACESFilmicToneMapping;
                    gl.toneMappingExposure = 1.2;
                  }}
                  onError={(error) => {
                    console.error("🚨 Canvas error:", error);
                    setLoadError(true);
                    setIsLoading(false);
                  }}
                >
                  {/* Environment Lighting */}
                  <Environment preset="studio" />
                  
                  {/* Enhanced Lighting */}
                  <ambientLight intensity={0.6} />
                  <directionalLight 
                    position={[10, 10, 5]} 
                    intensity={1.5} 
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                  />
                  <pointLight position={[-10, -10, -5]} intensity={0.8} />
                  
                  {/* Camera */}
                  <PerspectiveCamera ref={cameraRef} makeDefault />
                  
                  {/* ✅ FIXED: 3D Model with responsive scaling */}
                  <Suspense fallback={null}>
                    <OBJModel 
                      url={modelUrl} 
                      rotation={rotation} 
                      autoRotate={autoRotate}
                      scale={getModelScale()} // ✅ Dynamic scale
                      isFullScreen={isFullScreen} // ✅ Pass fullscreen state
                      onLoad={() => {
                        console.log("🎉 Model loaded - hiding loading screen");
                        setIsLoading(false);
                        setLoadError(false);
                      }}
                      onError={(error) => {
                        console.error("💥 Model error - showing error screen");
                        setIsLoading(false);
                        setLoadError(true);
                      }}
                    />
                  </Suspense>
                  
                  {/* ✅ FIXED: Controls with adjusted distances for each mode */}
                  <OrbitControls 
                    ref={controlsRef}
                    enableDamping
                    dampingFactor={0.05}
                    enableZoom
                    enablePan
                    maxDistance={isFullScreen ? 8 : 10} // ✅ Different max distances
                    minDistance={isFullScreen ? 1.5 : 2} // ✅ Different min distances
                    autoRotate={autoRotate}
                    autoRotateSpeed={2}
                    onStart={() => setAutoRotate(false)}
                  />
                </Canvas>

                {/* Loading Overlay */}
                {isLoading && <Loading3D />}
                
                {/* Error Overlay */}
                {loadError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 dark:bg-red-950/90 backdrop-blur-sm rounded-lg">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                          Failed to Load Model
                        </h3>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          The 3D model could not be loaded. Please try again.
                        </p>
                        <p className="text-xs text-red-500 mt-2 font-mono break-all">
                          URL: {modelUrl}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Model Controls - AGGIUNTO QUI PER FULLSCREEN */}
                {modelUrl && !isLoading && !loadError && isFullScreen && (
                  <ModelControls
                    isFullScreen={isFullScreen}
                    rotation={rotation}
                    autoRotate={autoRotate}
                    zoom={zoom}
                    onRotationChange={setRotation}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onFullScreen={handleFullScreen}
                    onAutoRotateToggle={() => setAutoRotate(!autoRotate)}
                    onModelDelete={handleDeleteModel}
                  />
                )}

                {/* Model Info Badge - Solo in fullscreen */}
                {modelUrl && !isLoading && !loadError && isFullScreen && (
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-black/30 backdrop-blur-md rounded-xl text-white text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>3D Model Ready</span>
                    </div>
                  </div>
                )}

                {/* Performance Info - Solo in fullscreen */}
                {modelUrl && !isLoading && !loadError && isFullScreen && (
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-md rounded-xl text-white text-xs">
                      <Camera className="w-3 h-3" />
                      <span>WebGL Rendering</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons - SOLO SE NON È MODAL */}
              {!isModal && !isLoading && !loadError && (
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mt-auto pt-3 sm:pt-4">
                  
                  {/* Download Button */}
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = modelUrl;
                      link.download = 'model.obj';
                      link.click();
                      toast.success("Model download started!");
                    }}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium rounded-lg border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span className="sm:inline">Download OBJ</span>
                  </button>

                </div>
              )}

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Viewer3D;