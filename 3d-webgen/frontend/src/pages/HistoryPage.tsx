import { useEffect, useState } from "react";
import { getUserModels, deleteModel } from "@/services/api/modelService";
import { GeneratedModel } from "@/types/models";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Trash2, Filter, SortDesc } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const modelOptions = [
  { value: "all", label: "All models" },
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

const HistoryPage = () => {
  const [models, setModels] = useState<GeneratedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  const fetchModels = () => {
    setLoading(true);
    getUserModels({ model_name: selectedModel, order: sortOrder })
      .then((data) => setModels(data))
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
      setModels((prev) => prev.filter((m) => m.id !== id));
    } catch {
      toast.error("Failed to delete model");
    }
  };

  return (
    <section className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold">Your 3D Models</h2>
        <Link to="/home" className="text-indigo-600 hover:underline text-sm">
          ← Back to Home
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter by model
          </label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
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
        <div className="w-52">
          <label className="text-sm font-medium mb-1 flex items-center gap-2">
            <SortDesc className="w-4 h-4" />
            Sort by date
          </label>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger>
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest first</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : models.length === 0 ? (
        <p className="text-gray-500">No models generated yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <Card
              key={model.id}
              className="relative p-4 space-y-3 transition transform hover:-translate-y-1 hover:shadow-lg"
            >
              <button
                onClick={() => handleDelete(model.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Delete model"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <img
                src={model.input_image}
                alt="Input"
                className="rounded-md w-full h-48 object-cover border"
              />

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-medium">
                  {model.model_name}
                </span>
                <span>
                  {new Date(model.created_at).toLocaleDateString()}{" "}
                  {new Date(model.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <a
                href={model.output_model}
                target="_blank"
                rel="noreferrer"
                className="block text-center mt-2 text-indigo-600 hover:underline text-sm font-medium"
              >
                View 3D Model →
              </a>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default HistoryPage;
