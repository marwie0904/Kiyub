import { X, FileText, Image as ImageIcon, Music, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface FileAttachmentCardProps {
  file: File;
  onRemove: () => void;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) {
    return <ImageIcon className="h-8 w-8" />;
  }
  if (fileType.startsWith("audio/")) {
    return <Music className="h-8 w-8" />;
  }
  if (
    fileType.includes("pdf") ||
    fileType.includes("document") ||
    fileType.includes("text")
  ) {
    return <FileText className="h-8 w-8" />;
  }
  return <File className="h-8 w-8" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}

export function FileAttachmentCard({ file, onRemove }: FileAttachmentCardProps) {
  const extension = getFileExtension(file.name);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const isImage = file.type.startsWith("image/");

  useEffect(() => {
    if (isImage) {
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);

      // Cleanup
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [file, isImage]);

  return (
    <div className="relative flex flex-col items-center justify-center w-[100px] h-[110px] bg-secondary/30 hover:bg-secondary/50 rounded-lg border border-border/40 transition-colors group p-2 overflow-hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 rounded-full hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/50"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>

      {isImage && imagePreview ? (
        <div className="flex flex-col items-center w-full h-full">
          <div className="flex-1 w-full flex items-center justify-center overflow-hidden rounded">
            <img
              src={imagePreview}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex flex-col items-center text-center w-full mt-1">
            <span className="text-[10px] text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="text-muted-foreground mb-1.5">
            {getFileIcon(file.type)}
          </div>

          <div className="flex flex-col items-center text-center w-full">
            <span className="text-[11px] font-medium text-foreground truncate max-w-full px-1 mb-0.5">
              {file.name.length > 12 ? `${file.name.slice(0, 9)}...` : file.name}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
            {extension && (
              <span className="text-[9px] text-muted-foreground/70 mt-0.5 px-1.5 py-0.5 bg-secondary/50 rounded">
                {extension}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
