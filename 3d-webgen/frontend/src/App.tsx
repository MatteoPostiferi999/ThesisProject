import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ModelSelector from './components/ModelSelector';
import UploadForm from './components/UploadForm';
import ModelPreview from './components/ModelPreview';
import TechnicalInfo from './components/TechnicalInfo';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';

function App() {
  // Dati tecnici di esempio (da sostituire con reali)
  const modelData = {
    modelUsed: 'Hunyuan 3D',
    vertices: 14836,
    faces: 29284,
    fileSizeMB: 4.62,
    generationTime: 11,
  };

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
            <UploadForm />
          </div>
        </div>

        {/* Right: Preview + Info */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
            <ModelPreview />
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
    </div>
  );
}

export default App;
