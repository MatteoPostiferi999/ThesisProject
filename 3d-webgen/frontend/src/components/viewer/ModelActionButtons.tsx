import { 
  Download, 
  Trash2, 
  Share2, 
  Eye, 
  Copy,
  CheckCircle2,
  ExternalLink,
  FileDown,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";

interface ModelActionButtonsProps {
  onModelDelete?: () => void;
  modelUrl: string;
  modelName?: string;
}

const downloadFileViaBlob = async (url: string, filename: string) => {
  try {
    toast.loading("📥 Preparing download...", { id: "download-toast" });
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.dismiss("download-toast");
    toast.success("🎉 Model downloaded successfully!", {
      description: `${filename} saved to your downloads folder.`
    });
  } catch (error) {
    toast.dismiss("download-toast");
    toast.error("❌ Download failed", {
      description: "Please check your connection and try again."
    });
  }
};

const ModelActionButtons = ({ 
  onModelDelete, 
  modelUrl, 
  modelName = "generated_model" 
}: ModelActionButtonsProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDownload = async (format: 'obj' | 'ply' | 'stl' = 'obj') => {
    setIsDownloading(true);
    const filename = `${modelName}_3d_model.${format}`;
    await downloadFileViaBlob(modelUrl, filename);
    setIsDownloading(false);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(modelUrl);
      setUrlCopied(true);
      toast.success("🔗 Model URL copied!", {
        description: "You can now share this link with others."
      });
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (error) {
      toast.error("❌ Failed to copy URL");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my 3D Model!',
          text: 'I just generated this amazing 3D model from a 2D image!',
          url: modelUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        handleCopyUrl();
      }
    } else {
      handleCopyUrl();
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onModelDelete?.();
      setShowDeleteConfirm(false);
      toast.success("🗑️ Model deleted", {
        description: "The 3D model has been removed from your history."
      });
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const openInNewTab = () => {
    window.open(modelUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* 📥 Primary Download Section */}
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          🎉 Your 3D Model is Ready!
        </h3>
        
        {/* Main Download Button */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
          <Button 
            size="lg"
            className="relative px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            onClick={() => handleDownload('obj')}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <FileDown className="mr-3 h-5 w-5 animate-bounce" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-3 h-5 w-5 group-hover:animate-bounce" />
                Download 3D Model (.OBJ)
              </>
            )}
          </Button>
        </div>

        {/* Format Options */}
        <div className="flex justify-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Other formats:
          </span>
          <button
            onClick={() => handleDownload('ply')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            disabled={isDownloading}
          >
            .PLY
          </button>
          <span className="text-gray-400">•</span>
          <button
            onClick={() => handleDownload('stl')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            disabled={isDownloading}
          >
            .STL
          </button>
        </div>
      </div>

      {/* 🎮 Action Buttons Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* 👁️ View Model */}
        <Button
          variant="outline"
          className="group px-4 py-3 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 transition-all duration-300"
          onClick={openInNewTab}
        >
          <div className="flex flex-col items-center gap-1">
            <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">View</span>
          </div>
        </Button>

        {/* 📋 Copy URL */}
        <Button
          variant="outline"
          className="group px-4 py-3 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-400 transition-all duration-300"
          onClick={handleCopyUrl}
        >
          <div className="flex flex-col items-center gap-1">
            {urlCopied ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 animate-pulse" />
            ) : (
              <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs font-medium">
              {urlCopied ? "Copied!" : "Copy URL"}
            </span>
          </div>
        </Button>

        {/* 🔗 Share */}
        <Button
          variant="outline"
          className="group px-4 py-3 bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-400 transition-all duration-300"
          onClick={handleShare}
        >
          <div className="flex flex-col items-center gap-1">
            <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">Share</span>
          </div>
        </Button>

        {/* 🗑️ Delete */}
        <Button
          variant="outline"
          className={`group px-4 py-3 bg-white dark:bg-gray-800 border-2 transition-all duration-300 ${
            showDeleteConfirm
              ? "border-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse"
              : "border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400"
          }`}
          onClick={handleDelete}
        >
          <div className="flex flex-col items-center gap-1">
            {showDeleteConfirm ? (
              <AlertTriangle className="h-4 w-4 text-red-500 animate-bounce" />
            ) : (
              <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs font-medium">
              {showDeleteConfirm ? "Confirm?" : "Delete"}
            </span>
          </div>
        </Button>

      </div>

      {/* 💡 Quick Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
              💡 What's next?
            </h4>
            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
              <li>• Open .OBJ files in Blender, Maya, or 3DS Max</li>
              <li>• Use .STL for 3D printing</li>
              <li>• Share the URL to let others view your model</li>
              <li>• Import into Unity/Unreal for game development</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 📊 Model Info */}
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Model generated • Ready for download and sharing
        </p>
      </div>

    </div>
  );
};

export default ModelActionButtons;