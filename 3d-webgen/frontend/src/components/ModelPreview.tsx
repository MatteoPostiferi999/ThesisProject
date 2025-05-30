import React from 'react';

type ModelPreviewProps = {
  modelUrl?: string; // Es. URL al .glb, .obj o pagina viewer
};

const ModelPreview: React.FC<ModelPreviewProps> = ({ modelUrl }) => {
  return (
    <section className="bg-white dark:bg-gray-900 py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-6">
          3D Model Preview
        </h2>

        {modelUrl ? (
          <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-indigo-200 dark:border-indigo-700 transition-all">
            {/* Puoi sostituire con un visualizzatore reale */}
            <iframe
              src={modelUrl}
              title="3D Model Viewer"
              frameBorder="0"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl border border-dashed border-indigo-400 dark:border-indigo-600">
            <p className="text-lg text-gray-600 dark:text-gray-300 px-4">
              No model available. Please upload a 2D image to generate your 3D preview.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ModelPreview;
