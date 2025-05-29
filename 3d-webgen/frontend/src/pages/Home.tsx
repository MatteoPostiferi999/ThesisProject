import React from 'react';
import UploadForm from '../components/UploadForm';
import MeshViewer from '../viewer/MeshViewer';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <UploadForm />
      <MeshViewer />
    </div>
  );
};

export default Home;
