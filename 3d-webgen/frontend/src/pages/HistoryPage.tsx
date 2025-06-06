import { useEffect, useState } from "react";
import { getUserModels } from "@/services/api/modelService";
import { GeneratedModel } from "@/types/models";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
// import '@google/model-viewer'; // ← scommenta se usi <model-viewer>

const HistoryPage = () => {
  const [models, setModels] = useState<GeneratedModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    getUserModels()
      .then((data) => setModels(data))
      .catch(() => toast.error("Failed to load models"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Your 3D Models</h2>
        <Link to="/home" className="text-indigo-600 hover:underline text-sm">
          ← Back to Home
        </Link>
      </div>

      {/* Contenuto */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : models.length === 0 ? (
        <p className="text-gray-500">No models generated yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <Card
              key={model.id}
              className="p-4 space-y-3 transition transform hover:-translate-y-1 hover:shadow-lg"
            >
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
                  {new Date(model.created_at).toLocaleDateString()} -{" "}
                  {new Date(model.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Viewer 3D opzionale */}
              {/* <model-viewer
                src={model.output_model}
                alt="3D Preview"
                camera-controls
                auto-rotate
                class="w-full h-[300px] rounded border"
              /> */}

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
