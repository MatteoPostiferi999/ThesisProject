import React from 'react';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-indigo-700 to-purple-600 text-white dark:from-gray-800 dark:to-gray-900 py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI-assisted Design: 2D to 3D Reconstruction for Rapid Prototyping
        </h1>
        <a
          href="#upload"
          className="inline-block bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full shadow-md hover:bg-indigo-100 transition"
        >
          Get Started
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
