import React from 'react';
import logo from '../assets/logo.avif'; // Assicurati che il percorso sia corretto

const Navbar = () => {
  return (
    <nav className="bg-indigo-700 text-white px-6 py-4 shadow-md dark:bg-gray-900">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo + titolo */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="h-8 w-8 rounded-full" />
          <span className="text-xl font-bold">3D Generator</span>
        </div>

        {/* Menu */}
        <div className="space-x-6 text-sm hidden md:flex">
          <a href="#" className="hover:underline">Try it now</a>
          <a href="#" className="hover:underline">Learn more</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
