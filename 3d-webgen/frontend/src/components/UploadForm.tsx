import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';

type UploadFormProps = {
  setModelUrl: (url: string) => void;
};

const UploadForm: React.FC<UploadFormProps> = ({ setModelUrl }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const pollJobStatus = (jobId: number) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/job/${jobId}/`);
        const status = response.data.status;

        if (status === 'COMPLETED') {
          clearInterval(interval);
          setModelUrl(response.data.mesh_url);
          toast.success('3D model ready!');
        } else if (status === 'FAILED') {
          clearInterval(interval);
          toast.error('Failed to generate 3D model.');
        }
      } catch (err) {
        clearInterval(interval);
        toast.error('Error checking job status.');
      }
    }, 3000);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
  if (acceptedFiles.length > 0) {
    const file = acceptedFiles[0];

    // Se c'è già un'immagine, rilascia l'oggetto URL precedente
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  }
}, [previewImage]);


  const {
    getRootProps,
    getInputProps,
    open,
  } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    noClick: true,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage('⚠️ Please upload a 2D image first.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('http://localhost:8000/api/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Image uploaded successfully!');
      pollJobStatus(response.data.job_id);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
            <div
        {...getRootProps()}
        className="relative h-72 w-full border-2 border-dashed border-indigo-400 rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden"
      >
        <input {...getInputProps()} />

        {previewImage ? (
          <img
            src={previewImage}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-4">
            <p className="text-xl font-bold text-indigo-600">Upload Your Image</p>
            <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
              Drag & drop a file here
            </p>
          </div>
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

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full"
      >
        {loading ? 'Uploading...' : 'Generate 3D'}
      </button>

      {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
    </form>
  );
};

export default UploadForm;
