import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useState, useRef, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three-stdlib";
import * as THREE from "three";
import ModelControls from "@/components/viewer/ModelControls";

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

// NoModelPlaceholder component
const NoModelPlaceholder = ({ isModal = false }) => (
  <div className={`flex items-center justify-center ${isModal ? 'h-64' : 'h-96'} bg-gray-50 dark:bg-gray-800 rounded-xl`}>
    <div className="text-center">
      <Box className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        No 3D Model Loaded
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        Upload or generate a 3D model to begin viewing
      </p>
    </div>
  </div>
);

// Enhanced OBJ Model Component
const OBJModel = ({ 
  url, 
  rotation, 
  autoRotate, 
  scale = 1.5,
  onLoad,
  onError
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

  // Center and normalize the model
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
      
      obj.position.sub(center);
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const normalizedScale = scale / maxDim;
      ref.current.scale.setScalar(normalizedScale);
      
      console.log("📏 Applied scale:", normalizedScale);
    }
  }, [obj, scale]);

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
  isModal?: boolean; // ✅ NUOVA PROP
}

const Viewer3D = ({ modelUrl, onModelDelete, isModal = false }: Viewer3DProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [autoRotate, setAutoRotate] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef<any>(null);

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

  // Gestione del tasto ESC e dell'evento fullscreenchange
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    const handleFullscreenChange = () => {
      // Controlla se siamo ancora in fullscreen usando type casting per vendor-specific properties
      const doc = document as any;
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      
      setIsFullScreen(isCurrentlyFullscreen);
    };

    // Aggiungi i listener
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Cleanup
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
    <div className="relative h-full">
      
      {/* Background Effects - SOLO SE NON È MODAL */}
      {!isModal && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900/50 dark:via-blue-950/20 dark:to-indigo-950/30 rounded-3xl blur-3xl -z-10" />
      )}
      
      <Card className={`relative h-full ${
        isModal 
          ? 'bg-transparent border-none shadow-none' // ✅ Modal: trasparente
          : 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl transition-all duration-500 hover:shadow-3xl'
      }`}>
        <CardContent className={`h-full ${isModal ? "p-0" : "p-8"}`}> {/* ✅ Modal: no padding */}
          
          {/* Header - SOLO SE NON È MODAL */}
          {!isModal && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    3D Model Viewer
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Interactive preview and controls
                  </p>
                </div>
              </div>
              
              {/* Quick Actions */}
              {modelUrl && !isLoading && !loadError && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetView}
                    className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    title="Reset View"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleFullScreen}
                    className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {!modelUrl ? (
            <div className="relative">
              <NoModelPlaceholder isModal={isModal} />
            </div>
          ) : (
            <div className={`h-full ${isModal ? 'space-y-2' : 'space-y-6'} ${
              isModal 
                ? 'rounded-xl p-2 bg-white/10 backdrop-blur-sm' 
                : 'border-2 border-gray-800 dark:border-gray-700 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'
            }`}>
              
              {/* 3D Viewer Container */}
              <div
                id="viewer-container"
                className="relative w-full bg-gradient-to-br from-blue-100 to-slate-300 dark:from-slate-600 dark:to-blue-800 rounded-xl overflow-hidden shadow-inner"
                style={{ 
                  aspectRatio: isModal ? '16/10' : '1 / 1', // ✅ Modal: ratio più largo
                  height: isModal ? '100%' : 'auto' // ✅ Modal: altezza piena
                }}
              >
                
                {/* 3D Canvas */}
                <Canvas
                  camera={{ position: [0, 0, 5], fov: 50 }}
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
                  
                  {/* 3D Model */}
                  <Suspense fallback={null}>
                    <OBJModel 
                      url={modelUrl} 
                      rotation={rotation} 
                      autoRotate={autoRotate}
                      scale={1.8}
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
                  
                  {/* Controls */}
                  <OrbitControls 
                    ref={controlsRef}
                    enableDamping
                    dampingFactor={0.05}
                    enableZoom
                    enablePan
                    maxDistance={10}
                    minDistance={2}
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
                <div className="flex justify-center gap-3">
                  
                  {/* Download Button */}
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = modelUrl;
                      link.download = 'model.obj';
                      link.click();
                      toast.success("Model download started!");
                    }}
                    className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium rounded-lg border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download OBJ
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={handleDeleteModel}
                    className="px-5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 font-medium rounded-lg border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Model
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