import { useState, useRef, useCallback, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import { apiService } from "../service/api";

// Defines the shape of the object returned by the hook for better type safety.
interface UseImageUploadReturn {
  isUploading: boolean;
  uploadedImageUrl: string;
  selectedFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleSelectFileClick: () => void;
  handleFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => Promise<void>;
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSelectFileClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadedImageUrl("");
    }
  };

  const handleUpload = useCallback(async (): Promise<void> => {
    if (!selectedFile) {
      toast.error("Please select an image file first.");
      return;
    }

    setIsUploading(true);
    const uploadPromise = apiService.uploadImageToCloudinary(selectedFile);

    toast.promise(uploadPromise, {
      loading: "Uploading image...",
      success: (url: string) => {
        setUploadedImageUrl(url);
        setSelectedFile(null);
        setIsUploading(false);
        return "✅ Image uploaded!";
      },
      error: (err: Error) => {
        setIsUploading(false);
        return `❌ Upload failed: ${err.message || "Please try again."}`;
      },
    });

    await uploadPromise.catch((err) => console.error("Upload failed:", err));
  }, [selectedFile]);

  return {
    isUploading,
    uploadedImageUrl,
    selectedFile,
    fileInputRef,
    handleSelectFileClick,
    handleFileSelect,
    handleUpload,
  };
}
