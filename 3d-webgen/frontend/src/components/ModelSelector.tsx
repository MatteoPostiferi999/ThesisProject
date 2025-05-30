import React, { useState } from 'react';

interface ModelOption {
  id: string;
  name: string;
  description: string;
}

const models: ModelOption[] = [
  {
    id: 'hunyuan-mini-turbo',
    name: 'Hunyuan3D-DiT-v2-mini-Turbo',
    description: 'Step Distillation Version – 0.6B – 2025-03-19',
  },
  {
    id: 'hunyuan-mini-fast',
    name: 'Hunyuan3D-DiT-v2-mini-Fast',
    description: 'Guidance Distillation Version – 0.6B – 2025-03-18',
  },
  {
    id: 'hunyuan-mini',
    name: 'Hunyuan3D-DiT-v2-mini',
    description: 'Mini Image to Shape Model – 0.6B – 2025-03-18',
  },
  {
    id: 'hunyuan-mv-turbo',
    name: 'Hunyuan3D-DiT-v2-mv-Turbo',
    description: 'Step Distillation Version – 1.1B – 2025-03-19',
  },
  {
    id: 'hunyuan-mv-fast',
    name: 'Hunyuan3D-DiT-v2-mv-Fast',
    description: 'Guidance Distillation Version – 1.1B – 2025-03-18',
  },
  {
    id: 'hunyuan-mv',
    name: 'Hunyuan3D-DiT-v2-mv',
    description: 'Multiview Image to Shape Model – 1.1B – 2025-03-18',
  },
  {
    id: 'hunyuan-v2-0-turbo',
    name: 'Hunyuan3D-DiT-v2-0-Turbo',
    description: 'Step Distillation Model – 1.1B – 2025-03-19',
  },
  {
    id: 'hunyuan-v2-0-fast',
    name: 'Hunyuan3D-DiT-v2-0-Fast',
    description: 'Guidance Distillation Model – 1.1B – 2025-02-03',
  },
  {
    id: 'hunyuan-v2-0',
    name: 'Hunyuan3D-DiT-v2-0',
    description: 'Image to Shape Model – 1.1B – 2025-01-21',
  },
];


const ModelSelector = () => {
  const [selectedModel, setSelectedModel] = useState<ModelOption>(models[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (model: ModelOption) => {
    setSelectedModel(model);
    setIsOpen(false);
    // Puoi sollevare lo stato al componente genitore se necessario
  };

  

  return (
    <div className="relative w-full max-w-md mx-auto">
      <p className="text-lg font-semibold text-indigo-600 text-center mb-4">
          Select your model
      </p>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md px-4 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {selectedModel.name}
        </span>
        <span className="block text-xs text-gray-500 dark:text-gray-400">
          {selectedModel.description}
        </span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          {models.map((model) => (
            <li
              key={model.id}
              onClick={() => handleSelect(model)}
              className="px-4 py-3 hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer"
            >
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {model.name}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                {model.description}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ModelSelector;
