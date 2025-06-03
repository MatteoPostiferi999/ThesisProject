
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Loader, CheckCircle } from "lucide-react";

interface ProcessingStatusProps {
  hasStartedGeneration: boolean;
  isProcessing: boolean;
  progress: number;
}



const ProcessingStatus = ({ hasStartedGeneration, isProcessing, progress }: ProcessingStatusProps) => {
  if (!hasStartedGeneration && !isProcessing) {
    return null;
  }

  return (
    <Card className="mb-8 border rounded-lg">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {progress < 100 ? (
              <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-3">
                <Loader className="h-6 w-6 animate-spin text-slate-600 dark:text-slate-400" />
              </div>
            ) : (
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            )}

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {progress < 100
                ? "Processing 3D model..."
                : "3D Model Generated"}
            </h3>
          </div>

          {progress < 100 && (
            <span className="text-xl font-semibold text-slate-600 dark:text-slate-400">
              {Math.round(progress)}%
            </span>
          )}
        </div>

        <Progress
          value={progress}
          className="h-3 mb-6"
        />

        <div className="text-slate-700 dark:text-slate-300">
          {progress < 100 ? (
            <p className="text-center">
              AI is analyzing your image and generating the 3D model...
            </p>
          ) : (
            <div className="text-center">
              <p className="text-green-600 dark:text-green-400 font-medium">
                Your 3D model is ready for preview
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingStatus;