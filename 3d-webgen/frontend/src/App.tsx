import React, { useState } from 'react';
import Navbar from './components/layouts/Navbar';
import HeroSection from './components/layouts/HeroSection';
import ModelSelector from './components/features/ModelSelector';
import UploadForm from './components/features/UploadForm';
import ModelPreview from './components/features/ModelPreview';
import TechnicalInfo from './components/features/TechnicalInfo';
import Footer from './components/layouts/Footer';
import ThemeToggle from './components/ThemeToggle';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';



function App() {
  // Dati tecnici di esempio (da sostituire con reali)
  const modelData = {
    modelUsed: 'Hunyuan 3D',
    vertices: 14836,
    faces: 29284,
    fileSizeMB: 4.62,
    generationTime: 11,
  };

  // 1. Stato in App.tsx
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <Navbar />
      <ThemeToggle />

      {/* Hero */}
      <HeroSection />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Selezione + Upload */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
            <ModelSelector />
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
            <UploadForm setModelUrl={setModelUrl} />
          </div>
        </div>

        {/* Right: Preview + Info */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
           <ModelPreview modelUrl={modelUrl} />
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
            <TechnicalInfo {...modelData} />
          </div>
        </div>
        <div className="h-[2000px] bg-red-100 col-span-2 text-center text-black">
    Scroll test — scroll down to see if the footer appears correctly!
  </div>
      </main>

      {/* Footer */}
      <Footer />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
    
  );
  
}

export default App;
