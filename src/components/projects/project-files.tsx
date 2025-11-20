"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Upload, FileText, Image as ImageIcon, X, Download } from "lucide-react";

interface ProjectFilesProps {
  projectId: Id<"projects">;
}

export function ProjectFiles({ projectId }: ProjectFilesProps) {
  const files = useQuery(api.projectFiles.list, { projectId });
  const generateUploadUrl = useMutation(api.projectFiles.generateUploadUrl);
  const saveFile = useMutation(api.projectFiles.saveFile);
  const removeFile = useMutation(api.projectFiles.remove);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(selectedFiles)) {
        // Validate file type
        const validTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];

        if (!validTypes.includes(file.type)) {
          alert(`File type not supported: ${file.name}`);
          continue;
        }

        // Generate upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        const { storageId } = await result.json();

        // Save file metadata
        await saveFile({
          projectId,
          storageId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (fileId: Id<"projectFiles">) => {
    if (confirm("Are you sure you want to delete this file?")) {
      await removeFile({ id: fileId });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Files</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="h-8 gap-2"
        >
          <Upload className="h-3 w-3" />
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <ScrollArea className="h-[200px] rounded-md border">
        {files && files.length > 0 ? (
          <div className="space-y-1 p-2">
            {files.map((file) => (
              <FileItem
                key={file._id}
                file={file}
                onDelete={handleDelete}
                getFileIcon={getFileIcon}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No files uploaded yet
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function FileItem({
  file,
  onDelete,
  getFileIcon,
  formatFileSize,
}: {
  file: any;
  onDelete: (id: Id<"projectFiles">) => void;
  getFileIcon: (fileType: string) => React.ReactElement;
  formatFileSize: (bytes: number) => string;
}) {
  const fileUrl = useQuery(api.projectFiles.getUrl, {
    storageId: file.storageId,
  });

  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 p-2 hover:bg-muted">
      <div className="flex items-center gap-2 overflow-hidden">
        {getFileIcon(file.fileType)}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.fileName}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.fileSize)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {fileUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => window.open(fileUrl, "_blank")}
          >
            <Download className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onDelete(file._id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
