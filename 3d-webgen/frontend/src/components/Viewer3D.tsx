

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

import { useState, MouseEvent as ReactMouseEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import ModelControls from "@/components/viewer/ModelControls";
import ModelActionButtons from "@/components/viewer/ModelActionButtons";
import NoModelPlaceholder from "@/components/viewer/NoModelPlaceholder";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three-stdlib";

const OBJModel = ({ url }: { url: string }) => {
  if (!url) return null;
  const obj = useLoader(OBJLoader, url);
  return <primitive object={obj} scale={1.5} />;
};


interface Viewer3DProps {
  modelUrl: string | null;
  onModelDelete?: () => void;
}



const Viewer3D = ({ modelUrl, onModelDelete }: Viewer3DProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Opzionalmente disattiva zoom/rotazione se non ti servono più
  const handleFullScreen = () => {
    const container = document.getElementById("viewer-container");
    if (!container) return;

    if (!isFullScreen) container.requestFullscreen?.();
    else document.exitFullscreen?.();

    setIsFullScreen(!isFullScreen);
  };

  const handleDeleteModel = () => {
    if (onModelDelete) {
      onModelDelete();
      toast.info("3D model deleted", {
        description: "You can generate a new model with the current or a different model type.",
      });
    }
  };

return (
  <Card className="h-full transition-all duration-300 hover:shadow-lg">
    <CardContent className="p-6">
      <h2 className="text-2xl font-semibold mb-4">3D Model Preview</h2>

      {!modelUrl ? (
        <NoModelPlaceholder />
      ) : (
        <div className="space-y-4">
          {/* Messaggio di loading fuori dal Canvas */}
          <p className="text-sm text-muted-foreground text-center">
            Loading 3D model...
          </p>

          <div
            id="viewer-container"
            className="relative aspect-square w-full bg-muted/10 rounded-md overflow-hidden"
          >
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} />
              <Suspense fallback={null}>
                <OBJModel url={modelUrl} />
              </Suspense>
              <OrbitControls enableZoom />
            </Canvas>

            <ModelControls
              isFullScreen={isFullScreen}
              rotation={0}
              autoRotate={false}
              zoom={1}
              onRotationChange={() => {}}
              onZoomIn={() => {}}
              onZoomOut={() => {}}
              onFullScreen={handleFullScreen}
              onAutoRotateToggle={() => {}}
            />
          </div>

          <ModelActionButtons onModelDelete={handleDeleteModel} />
        </div>
      )}
    </CardContent>
  </Card>
);

}

export default Viewer3D;
