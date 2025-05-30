import React, { useState } from 'react';

interface ModelOption {
  id: string;
  name: string;
  description: string;
}

const models: ModelOption[] = [
  {
    id: 'hunyuan',
    name: 'Hunyuan 3D',
    description: 'Fast, reliable and accurate on general objects',
  },
  {
    id: 'magic123',
    name: 'Magic123',
    description: 'High quality, but slower to process',
  },
  {
    id: 'shapeGen',
    name: 'ShapeGen Mini',
    description: 'Optimized for small symmetric objects like cups',
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
