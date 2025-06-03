import { Card, CardContent } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Box } from "lucide-react";

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
  const models = [
    {
      id: 'hunyuan-mini-turbo',
      name: 'Hunyuan3D-DiT-v2-mini-Turbo',
      description: 'Step Distillation Version – 0.6B ',
    },
    {
      id: 'hunyuan-mini-fast',
      name: 'Hunyuan3D-DiT-v2-mini-Fast',
      description: 'Guidance Distillation Version – 0.6B ',
    },
    {
      id: 'hunyuan-mini',
      name: 'Hunyuan3D-DiT-v2-mini',
      description: 'Mini Image to Shape Model – 0.6B ',
    },
    {
      id: 'hunyuan-mv-turbo',
      name: 'Hunyuan3D-DiT-v2-mv-Turbo',
      description: 'Step Distillation Version – 1.1B ',
    },
    {
      id: 'hunyuan-mv-fast',
      name: 'Hunyuan3D-DiT-v2-mv-Fast',
      description: 'Guidance Distillation Version – 1.1B ',
    },
    {
      id: 'hunyuan-mv',
      name: 'Hunyuan3D-DiT-v2-mv',
      description: 'Multiview Image to Shape Model – 1.1B ',
    },
    {
      id: 'hunyuan-v2-0-turbo',
      name: 'Hunyuan3D-DiT-v2-0-Turbo',
      description: 'Step Distillation Model – 1.1B ',
    },
    {
      id: 'hunyuan-v2-0-fast',
      name: 'Hunyuan3D-DiT-v2-0-Fast',
      description: 'Guidance Distillation Model – 1.1B ',
    },
    {
      id: 'hunyuan-v2-0',
      name: 'Hunyuan3D-DiT-v2-0',
      description: 'Image to Shape Model – 1.1B ',
    },
  ];

  const getModelDescription = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    return model?.description || "";
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-2">Scegli il modello AI</h2>
      <Card className="p-0">
        <CardContent className="pt-3 pb-2 px-3">
          <Select
            value={selectedModel}
            onValueChange={(value) => onModelSelect(value as ModelType)}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Box className="mr-2 h-4 w-4 text-indigo-600" />
                <SelectValue placeholder="Seleziona un modello" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {model.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedModel && (
            <p className="text-xs text-muted-foreground mt-2 ml-1">
              {getModelDescription(selectedModel)}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelSelector;
