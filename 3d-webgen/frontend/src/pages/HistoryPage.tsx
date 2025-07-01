import { useEffect, useState } from "react";
import { getUserModels, deleteModel } from "@/api/services/models";
import { GeneratedModel } from "@/types/models";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Viewer3D from "@/components/Viewer3D";
import { 
  Trash2, 
  Filter, 
  SortDesc, 
  ArrowLeft, 
  Eye, 
  Calendar,
  Cpu,
  Image as ImageIcon,
  User,
  X,
  Zap,
  Crown,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const modelOptions = [
  { value: "all", label: "All Models" },
  { value: "hunyuan-mini-turbo", label: "Hunyuan Mini Turbo" },
  { value: "hunyuan-mini-fast", label: "Hunyuan Mini Fast" },
  { value: "hunyuan-mini", label: "Hunyuan Mini" },
  { value: "hunyuan-mv-turbo", label: "Hunyuan MV Turbo" },
  { value: "hunyuan-mv-fast", label: "Hunyuan MV Fast" },
  { value: "hunyuan-mv", label: "Hunyuan MV" },
  { value: "hunyuan-v2-0-turbo", label: "Hunyuan v2.0 Turbo" },
  { value: "hunyuan-v2-0-fast", label: "Hunyuan v2.0 Fast" },
  { value: "hunyuan-v2-0", label: "Hunyuan v2.0" },
];

// ✅ Funzione per formattare il nome del modello
const formatModelName = (modelName: string): string => {
  // Mappa dei nomi modelli per display più chiari
  const modelDisplayNames: Record<string, string> = {
    'hunyuan-mini': 'Hunyuan3D Mini',
    'hunyuan-standard': 'Hunyuan3D Standard', 
    'hunyuan-pro': 'Hunyuan3D Pro',
    'hunyuan3d-dit-v2-mini': 'Hunyuan3D DiT v2 Mini',
    'hunyuan-dit-v2-mini': 'Hunyuan3D DiT v2 Mini',
    'stable-fast-3d': 'Stable Fast 3D',
    'zero123plus': 'Zero123Plus',
    'hunyuan-mini-turbo': 'Hunyuan3D Mini Turbo',
    'hunyuan-mini-fast': 'Hunyuan3D Mini Fast',
    'hunyuan-mv': 'Hunyuan3D MV',
    'hunyuan-mv-turbo': 'Hunyuan3D MV Turbo',
    'hunyuan-mv-fast': 'Hunyuan3D MV Fast',
    'hunyuan-v2-0': 'Hunyuan3D v2.0',
    'hunyuan-v2-0-turbo': 'Hunyuan3D v2.0 Turbo',
    'hunyuan-v2-0-fast': 'Hunyuan3D v2.0 Fast',
  };

  // Se c'è una corrispondenza esatta, usala
  if (modelDisplayNames[modelName]) {
    return modelDisplayNames[modelName];
  }

  // Altrimenti, formatta il nome automaticamente
  return modelName
    .replace(/^hunyuan3?d?-?/i, 'Hunyuan3D ') // Sostituisce prefisso hunyuan
    .replace(/-dit-?/i, ' DiT ') // Sostituisce -dit- con DiT
    .replace(/-v(\d+)/i, ' v$1') // Formatta versioni (v2, v3, etc.)
    .replace(/-/g, ' ') // Sostituisce trattini con spazi
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalizza ogni parola
    .trim();
};

const HistoryPage = () => {
  const [models, setModels] = useState<GeneratedModel[]>([]);
  const [allModels, setAllModels] = useState<GeneratedModel[]>([]); // ✅ TUTTI i modelli dell'utente
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [viewerModel, setViewerModel] = useState<string | null>(null);

  // ✅ FIXED: Calcola i limiti sui TUTTI i modelli, non sui filtrati
  const FREE_GENERATION_LIMIT = 8;
  const generationsUsed = allModels.length; // ✅ Usa allModels invece di models
  const generationsRemaining = Math.max(0, FREE_GENERATION_LIMIT - generationsUsed);
  const isLimitReached = generationsUsed >= FREE_GENERATION_LIMIT;

  const fetchModels = () => {
    setLoading(true);
    
    // ✅ Fetch prima TUTTI i modelli per calcolare i limiti
    Promise.all([
      getUserModels({ model_name: "all", order: sortOrder }), // Tutti i modelli
      getUserModels({ model_name: selectedModel, order: sortOrder }) // Modelli filtrati
    ])
      .then(([allData, filteredData]) => {
        console.log("🔍 All models received:", allData);
        console.log("🔍 Filtered models received:", filteredData);
        setAllModels(allData); // ✅ Salva tutti i modelli
        setModels(filteredData); // ✅ Salva modelli filtrati
      })
      .catch(() => toast.error("Failed to load models"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchModels();
  }, [selectedModel, sortOrder]);

  const handleDelete = async (id: number) => {
    try {
      await deleteModel(id);
      toast.success("Model deleted successfully");
      
      // ✅ Aggiorna entrambi gli array
      setModels((prev) => prev.filter((m) => m.id !== id));
      setAllModels((prev) => prev.filter((m) => m.id !== id));
      
      // ✅ Calcola le generazioni rimanenti DOPO l'aggiornamento
      const newTotal = allModels.length - 1;
      const newRemaining = Math.max(0, FREE_GENERATION_LIMIT - newTotal);
      toast.info(`You now have ${newRemaining} generations remaining`);
    } catch {
      toast.error("Failed to delete model");
    }
  };

  const handleView3D = (modelUrl: string) => {
    // ✅ Chiudi viewer precedente prima di aprire nuovo
    setViewerModel(null);
    
    setTimeout(() => {
      console.log("🔍 Opening 3D model:", modelUrl);
      setViewerModel(modelUrl);
    }, 100); // Piccolo delay per cleanup
  };

  const closeViewer = () => {
    setViewerModel(null);
  };

  // ✅ LIMITS: Helper function for limit status
  const getLimitStatus = () => {
    if (generationsRemaining > 3) {
      return {
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        borderColor: "border-green-200 dark:border-green-800",
        icon: CheckCircle2,
        message: "Good to go!"
      };
    } else if (generationsRemaining > 0) {
      return {
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
        borderColor: "border-orange-200 dark:border-orange-800",
        icon: AlertCircle,
        message: "Running low"
      };
    } else {
      return {
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        borderColor: "border-red-200 dark:border-red-800",
        icon: AlertCircle,
        message: "Limit reached"
      };
    }
  };

  const limitStatus = getLimitStatus();

  return (
    <div className="relative min-h-screen">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/5 dark:to-purple-950/10 rounded-3xl blur-3xl -z-10" />
      
      <div className="relative max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Generated Models
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Manage your 3D generation history
                </p>
              </div>
            </div>
            
            <Link 
              to="/home" 
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* ✅ LIMITS: Generation Limit Card */}
        <div className={`bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border ${limitStatus.borderColor} p-6 shadow-xl mb-6`}>
          <div className="flex items-center justify-between">
            
            {/* Left side - Current status */}
            <div className="flex items-center gap-4">
              <div className={`p-3 ${limitStatus.bgColor} rounded-2xl`}>
                <limitStatus.icon className={`w-6 h-6 ${limitStatus.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Free Generations
                  </h3>
                  <span className={`px-3 py-1 ${limitStatus.bgColor} ${limitStatus.color} rounded-full text-sm font-medium`}>
                    {limitStatus.message}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {generationsUsed}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      / {FREE_GENERATION_LIMIT} used
                    </span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className={`font-medium ${limitStatus.color}`}>
                    {generationsRemaining} remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Progress bar and upgrade */}
            <div className="flex items-center gap-6">
              
              {/* Progress bar */}
              <div className="flex flex-col items-end gap-2">
                <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      generationsRemaining > 3 
                        ? 'bg-gradient-to-r from-green-400 to-green-500' 
                        : generationsRemaining > 0
                        ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                        : 'bg-gradient-to-r from-red-400 to-red-500'
                    }`}
                    style={{ width: `${(generationsUsed / FREE_GENERATION_LIMIT) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round((generationsUsed / FREE_GENERATION_LIMIT) * 100)}% used
                </span>
              </div>

              {/* Upgrade button (for future) */}
              <div className="flex flex-col items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg opacity-50 cursor-not-allowed">
                  <Crown className="w-4 h-4" />
                  <span>Upgrade</span>
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Coming soon
                </span>
              </div>
            </div>
          </div>

          {/* Warning message when limit is reached */}
          {isLimitReached && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-red-800 dark:text-red-200 font-medium">
                    Generation limit reached
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    You've used all {FREE_GENERATION_LIMIT} free generations. Delete some models to free up space, or upgrade to Premium for unlimited generations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Model
              </label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full h-12 rounded-xl border-2 bg-white dark:bg-gray-800">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <SortDesc className="w-4 h-4" />
                Sort by Date
              </label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full h-12 rounded-xl border-2 bg-white dark:bg-gray-800">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-12 shadow-xl text-center">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading models...</p>
            </div>
          </div>
        ) : models.length === 0 ? (
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-12 shadow-xl text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Models Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {selectedModel === "all" 
                ? "Generate your first 3D model to see it here" 
                : `No models found for ${modelOptions.find(opt => opt.value === selectedModel)?.label}`
              }
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-sm">
              <Zap className="w-4 h-4" />
              <span>{generationsRemaining} free generations remaining</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {models.map((model) => (
              <Card
                key={model.id}
                className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
              >
                
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(model.id)}
                  className="absolute top-3 right-3 z-10 p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete model"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>

                {/* ✅ IMPROVED: Better Image Container */}
                <div className="relative overflow-hidden aspect-square">
                  <img
                    src={model.input_image}
                    alt="Input Image"
                    className="w-full h-full object-contain bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback per immagini non trovate
                      e.currentTarget.style.objectFit = 'cover';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                    }}
                  />
                  {/* Overlay con gradiente più sottile */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Badge modello nell'angolo */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
                    <span className="text-white text-xs font-medium">
                      {formatModelName(model.model_name)}
                    </span>
                  </div>
                </div>

                {/* ✅ IMPROVED: Compact Content Section */}
                <div className="p-4 space-y-3">
                  
                  {/* User and Date Row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-blue-500" />
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md text-xs font-medium">
                        {model.user || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(model.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleView3D(model.output_model)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View 3D Model</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {models.length > 0 && (
          <div className="mt-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-xl">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>
                  {selectedModel === "all" 
                    ? `${models.length} total models` 
                    : `${models.length} models (${allModels.length} total)`
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Filtered by: {modelOptions.find(opt => opt.value === selectedModel)?.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>{generationsRemaining} generations remaining</span>
              </div>
            </div>
          </div>
        )}

        {/* ✅ 3D Viewer Modal */}
        {viewerModel && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-5xl h-[85vh]">
              
              {/* Pulsante di chiusura fuori dal viewer, in alto */}
              <button
                onClick={closeViewer}
                className="absolute -top-12 right-0 z-20 p-3 bg-black/60 hover:bg-black/80 rounded-full transition-colors backdrop-blur-sm shadow-lg"
                title="Close viewer"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Container del viewer */}
              <div className="w-full h-full bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
                {/* ✅ 3D Viewer Content O */}
                <div className="w-full h-full">
                  <Viewer3D 
                    modelUrl={viewerModel}
                    onModelDelete={() => {
                      toast.info("Use the delete button in the history grid to remove models");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;