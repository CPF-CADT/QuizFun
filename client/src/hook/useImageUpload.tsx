import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { apiService } from '../service/api'; 

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (): Promise<string | undefined> => {
    if (!selectedFile) {
      toast.error("No file selected for upload.");
      return;
    }

    setIsUploading(true);
    try {
      const newUrl = await apiService.uploadImageToCloudinary(selectedFile);
      setUploadedImageUrl(newUrl);
      setSelectedFile(null); 
      toast.success("Image uploaded successfully!");
      return newUrl; 
    } catch (error: any) {
      toast.error(error.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadedImageUrl,
    selectedFile,
    setSelectedFile, 
    fileInputRef,
    handleSelectFileClick,
    handleFileSelect,
    handleUpload,
  };
};