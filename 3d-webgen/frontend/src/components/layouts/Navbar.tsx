// src/components/layout/Navbar.tsx

import React from 'react';
import logo from '@/assets/logo.avif'; // Usa alias se hai impostato @
import { Button } from '../ui/button';
import { ModeToggle } from './ModeToggle'; // lo creiamo tra poco

const Navbar: React.FC = () => {
  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Titolo */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="h-9 w-9 rounded-full" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">3D Generator</span>
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:flex space-x-4">
          <Button variant="ghost" className="text-sm">Try it now</Button>
          <Button variant="ghost" className="text-sm">Learn more</Button>
        </nav>

        {/* Dark Mode Toggle */}
        <ModeToggle />
      </div>
    </header>
  );
};

export default Navbar;
