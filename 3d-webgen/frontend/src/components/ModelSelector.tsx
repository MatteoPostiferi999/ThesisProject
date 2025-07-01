import { 
  Cpu, 
  ChevronDown
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export type ModelType =
  | 'hunyuan-mini-turbo'
  | 'hunyuan-mini-fast'
  | 'hunyuan-mini'
  | 'hunyuan-mv-turbo'
  | 'hunyuan-mv-fast'
  | 'hunyuan-mv'
  | 'hunyuan-v2-0-turbo'
  | 'hunyuan-v2-0-fast'
  | 'hunyuan-v2-0';

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelSelect: (model: ModelType) => void;
}

const ModelSelector = ({ selectedModel, onModelSelect }: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const models = [
    {
      id: 'hunyuan-mini-turbo',
      name: 'Hunyuan3D Mini Turbo'
    },
    {
      id: 'hunyuan-mini-fast',
      name: 'Hunyuan3D Mini Fast'
    },
    {
      id: 'hunyuan-mini',
      name: 'Hunyuan3D Mini'
    },
    {
      id: 'hunyuan-v2-0-turbo',
      name: 'Hunyuan3D v2.0 Turbo'
    },
    {
      id: 'hunyuan-v2-0-fast',
      name: 'Hunyuan3D v2.0 Fast'
    },
    {
      id: 'hunyuan-v2-0',
      name: 'Hunyuan3D v2.0'
    },
  ];

  const getSelectedModel = () => {
    return models.find(model => model.id === selectedModel);
  };

  const selectedModelData = getSelectedModel();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleModelSelect = (modelId: string) => {
    onModelSelect(modelId as ModelType);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef} style={{ zIndex: isOpen ? 10000 : 'auto' }}>
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20 rounded-3xl blur-3xl -z-10" />
      
      <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Choose AI Model
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Select the model for your generation
            </p>
          </div>
        </div>

        {/* Custom Dropdown */}
        <div className="relative">
          
          {/* Trigger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-800 border-2 border-blue-300 dark:border-blue-600" />
                
                <div className="flex-1 text-left">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedModelData?.name || 'Hunyuan3D Mini'}
                  </span>
                </div>
              </div>
              
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                isOpen ? 'rotate-180' : ''
              }`} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl backdrop-blur-xl overflow-hidden"
              style={{ zIndex: 9999 }}
            >
              <div className="p-2">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className="w-full p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] min-h-[60px] flex items-center cursor-pointer mb-2 last:mb-0 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-800 border-2 border-blue-300 dark:border-blue-600 flex-shrink-0" />
                      
                      <div className="flex-1 text-left">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {model.name}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ModelSelector;