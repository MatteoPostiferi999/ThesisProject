// src/pages/HistoryPage.tsx
import { useEffect, useState } from "react";
import { getUserModels } from "@/services/api/modelService";
import { GeneratedModel } from "@/types/models";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

const HistoryPage = () => {
  const [models, setModels] = useState<GeneratedModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    getUserModels(token)
      .then((data) => setModels(data))
      .catch(() => toast.error("Failed to load models"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Your 3D Models</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : models.length === 0 ? (
        <p className="text-gray-500">No models generated yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <Card key={model.id} className="p-4 space-y-2">
              <img
                src={model.input_image}
                alt="Input"
                className="rounded-md w-full h-48 object-cover"
              />
              <div className="text-sm">
                <p className="font-semibold">Model: {model.model_name}</p>
                <p className="text-gray-500">
                  {new Date(model.created_at).toLocaleString()}
                </p>
              </div>
              <a
                href={model.output_model}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline text-sm"
              >
                View 3D Model
              </a>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default HistoryPage;
