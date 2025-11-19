import { X, FileText, Image as ImageIcon, Music, File } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilePreviewChipProps {
  file: File;
  onRemove: () => void;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) {
    return <ImageIcon className="h-4 w-4" />;
  }
  if (fileType.startsWith("audio/")) {
    return <Music className="h-4 w-4" />;
  }
  if (
    fileType.includes("pdf") ||
    fileType.includes("document") ||
    fileType.includes("text")
  ) {
    return <FileText className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePreviewChip({ file, onRemove }: FilePreviewChipProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary/70 rounded-lg border border-border transition-colors group">
      <div className="text-muted-foreground">{getFileIcon(file.type)}</div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
          {file.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-5 w-5 rounded-full hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
