
import { useEffect, useRef, useState } from "react";

interface UseModelRendererProps {
  modelUrl: string | null;
  rotation: number;
  zoom: number;
  autoRotate: boolean;
}

export const useModelRenderer = ({ modelUrl, rotation, zoom, autoRotate }: UseModelRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!modelUrl || !canvasRef.current) return;
    
    // This would be where you initialize the 3D viewer with the actual model
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Determine which model type was selected
    const modelType = modelUrl.split('-')[0];
    
    // For demo purposes, let's draw a simple cube or other shape based on model type
    const drawDemoModel = (time: number) => {
      if (!ctx || !canvasRef.current) return;
      
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      
      ctx.clearRect(0, 0, width, height);
      
      // Set different colors based on model type
      const colors = modelType === 'standard' ? 
                    ['#4338ca', '#6366f1', '#818cf8', '#a5b4fc'] :
                    modelType === 'enhanced' ? 
                    ['#0f766e', '#14b8a6', '#2dd4bf', '#99f6e4'] :
                    ['#9f1239', '#e11d48', '#fb7185', '#fda4af'];
      
      // Calculate center of canvas
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Size of the model
      const size = Math.min(width, height) * 0.4 * zoom;
      
      // Current rotation angle
      const currentRotation = autoRotate ? time * 0.0005 + rotation : rotation;
      const cosAngle = Math.cos(currentRotation);
      const sinAngle = Math.sin(currentRotation);
      
      // Define model vertices
      const vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
      ].map(([x, y, z]) => {
        // Apply rotation around Y axis
        const rotX = x * cosAngle - z * sinAngle;
        const rotZ = x * sinAngle + z * cosAngle;
        
        // Apply rotation around X axis
        const rotY = y * Math.cos(time * 0.0003) - rotZ * Math.sin(time * 0.0003);
        const finalZ = y * Math.sin(time * 0.0003) + rotZ * Math.cos(time * 0.0003);
        
        // Apply perspective
        const scale = 400 / (400 + finalZ * size);
        
        return {
          x: centerX + rotX * size * scale,
          y: centerY + rotY * size * scale,
          z: finalZ
        };
      });
      
      // Define faces (each face is defined by 4 vertices)
      const faces = [
        [0, 1, 2, 3], // front
        [4, 5, 6, 7], // back
        [0, 4, 7, 3], // left
        [1, 5, 6, 2], // right
        [0, 1, 5, 4], // bottom
        [3, 2, 6, 7]  // top
      ];
      
      // For artistic model, make more complex shape
      if (modelType === 'artistic') {
        // For artistic, add some distortion to vertices
        vertices.forEach(v => {
          v.x += Math.sin(time * 0.002 + v.z * 3) * 20;
          v.y += Math.cos(time * 0.0015 + v.x * 2) * 15;
        });
      }
      
      // Draw faces with depth sorting
      faces
        .map((face, i) => ({
          face,
          avgZ: face.reduce((sum, vIdx) => sum + vertices[vIdx].z, 0) / face.length,
          colorIdx: i
        }))
        .sort((a, b) => a.avgZ - b.avgZ)
        .forEach(({ face, colorIdx }) => {
          ctx.beginPath();
          ctx.moveTo(vertices[face[0]].x, vertices[face[0]].y);
          for (let i = 1; i < face.length; i++) {
            ctx.lineTo(vertices[face[i]].x, vertices[face[i]].y);
          }
          ctx.closePath();
          
          ctx.fillStyle = colors[colorIdx % colors.length];
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = modelType === 'enhanced' ? 2 : 1;
          ctx.stroke();
        });
      
      // Add animated pulse effect on the model
      if (modelType === 'highres' || modelType === 'realistic') {
        const pulseSize = Math.sin(time * 0.001) * 5 + 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 1.2 + pulseSize, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${modelType === 'highres' ? '99, 102, 241' : '20, 184, 166'}, 0.3)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      animationRef.current = requestAnimationFrame(drawDemoModel);
    };
    
    animationRef.current = requestAnimationFrame(drawDemoModel);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [modelUrl, rotation, zoom, autoRotate]);

  return { canvasRef };
};