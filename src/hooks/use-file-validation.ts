import { useState, useCallback } from "react";

const SUPPORTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "audio/mpeg",
  "audio/wav",
  "audio/m4a",
  "audio/webm",
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export function useFileValidation() {
  const [fileTypeError, setFileTypeError] = useState<string | null>(null);

  const validateFiles = useCallback((files: File[]): File[] => {
    // First check file types
    const invalidFiles = files.filter(file => !SUPPORTED_TYPES.includes(file.type));

    if (invalidFiles.length > 0) {
      setFileTypeError("File type not supported. Supported types: PDF, Images (PNG, JPG, WEBP, GIF), Audio (MP3, WAV, M4A, WEBM)");
      setTimeout(() => setFileTypeError(null), 3000);
      return [];
    }

    // Then check file sizes
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);

    if (oversizedFiles.length > 0) {
      const fileSizeMB = (oversizedFiles[0].size / (1024 * 1024)).toFixed(1);
      setFileTypeError(`File "${oversizedFiles[0].name}" exceeds 15MB limit (${fileSizeMB}MB)`);
      setTimeout(() => setFileTypeError(null), 3000);
      return [];
    }

    setFileTypeError(null);
    return files;
  }, []);

  const clearError = useCallback(() => {
    setFileTypeError(null);
  }, []);

  return {
    fileTypeError,
    validateFiles,
    clearError,
    SUPPORTED_TYPES,
    MAX_FILE_SIZE,
  };
}
