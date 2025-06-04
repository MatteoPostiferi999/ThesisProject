
import { Download, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModelActionButtonsProps {
  onModelDelete?: () => void;
  modelUrl: string; // ⬅️ nuova prop per il download
}

const downloadFileViaBlob = async (url: string, filename: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


const ModelActionButtons = ({ onModelDelete, modelUrl }: ModelActionButtonsProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-3">
         <Button 
          className="group transition-all"
          onClick={() => downloadFileViaBlob(modelUrl, 'generated_model.obj')}
         >
          <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
          Download 3D Model
        </Button>
      <Button variant="outline" className="group transition-all">
        <Eye className="mr-2 h-4 w-4 group-hover:scale-110" />
        View in AR
      </Button>
      {onModelDelete && (
        <Button 
          variant="outline"
          className="group transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20"
          onClick={onModelDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Model
        </Button>
      )}
    </div>
  );
};

export default ModelActionButtons;
