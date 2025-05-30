import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const UploadForm = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 1. Gestore drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  // 2. useDropzone con open + noClick
  const {
    getRootProps,
    getInputProps,
    open, // <-- da usare nel bottone
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
    },
    multiple: false,
    noClick: true, // impedisce apertura automatica cliccando sul riquadro
  });

  // 3. Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select an image');
      return;
    }
    console.log('Uploading file:', selectedFile.name);
    // Qui metterai la logica vera di upload
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        {...getRootProps()}
        className="h-72 w-full border-2 border-dashed border-indigo-400 rounded-2xl p-8 bg-gray-50 dark:bg-gray-800 flex flex-col justify-center items-center"
      >
        <input {...getInputProps()} />
        <p className="text-xl font-bold text-indigo-600">Upload Your Image</p>
        <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
          Drag & drop a file here
        </p>

        {selectedFile && (
          <p className="mt-4 text-sm text-green-600">
            Selected: <strong>{selectedFile.name}</strong>
          </p>
        )}
      </div>

<div className="flex justify-center mt-4">
  <button
    type="button"
    onClick={() => open?.()}
    className="px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all text-sm font-semibold"
  >
    Choose Image
  </button>
</div>

      {/* 5. Bottone Submit */}
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full"
      >
        Generate 3D
      </button>
    </form>
  );
};

export default UploadForm;
