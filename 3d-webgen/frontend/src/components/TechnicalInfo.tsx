import React from 'react';

interface TechnicalInfoProps {
  modelUsed: string;
  vertices: number;
  faces: number;
  fileSizeMB: number;
  generationTime: number; // in seconds
}

const TechnicalInfo: React.FC<TechnicalInfoProps> = ({
  modelUsed,
  vertices,
  faces,
  fileSizeMB,
  generationTime,
}) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 my-6">
      <h2 className="text-xl font-bold mb-4 text-indigo-600">Technical Information</h2>
      <ul className="space-y-2 text-gray-700">
        <li><span className="font-semibold">Model Used:</span> {modelUsed}</li>
        <li><span className="font-semibold">Vertices:</span> {vertices.toLocaleString()}</li>
        <li><span className="font-semibold">Faces:</span> {faces.toLocaleString()}</li>
        <li><span className="font-semibold">File Size:</span> {fileSizeMB.toFixed(2)} MB</li>
        <li><span className="font-semibold">Generation Time:</span> {generationTime}s</li>
      </ul>
    </div>
  );
};

export default TechnicalInfo;
