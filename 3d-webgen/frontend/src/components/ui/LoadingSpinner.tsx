import React from 'react';
import { ClipLoader } from 'react-spinners';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-32">
      <ClipLoader color="#6366f1" size={48} />
    </div>
  );
};

export default LoadingSpinner;
