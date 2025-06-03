
import { MoveDown } from "lucide-react";

const NoModelPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg bg-muted/20 p-4 text-center">
      <h3 className="text-lg font-medium mb-2">No model yet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Upload an image to generate a 3D model
      </p>
      <MoveDown className="h-10 w-10 text-muted-foreground opacity-50 animate-bounce" />
    </div>
  );
};

export default NoModelPlaceholder;
