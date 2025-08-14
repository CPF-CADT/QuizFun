import { useImageUpload } from "../hook/useImageUpload"; 

export default function ImageUploader() {
  const {
    isUploading,
    uploadedImageUrl,
    selectedFile,
    fileInputRef,
    handleSelectFileClick,
    handleFileSelect,
    handleUpload,
  } = useImageUpload();

  const imagePreviewUrl = selectedFile
    ? URL.createObjectURL(selectedFile)
    : uploadedImageUrl;

  return (
    <div className="mt-2 space-y-3">
      <div className="flex items-center gap-4">
        {imagePreviewUrl ? (
          <img
            src={imagePreviewUrl}
            alt="Preview"
            className="w-20 h-20 rounded-md object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center">
            No Image
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSelectFileClick}
            disabled={isUploading}
            className="px-4 py-2 text-sm text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 disabled:opacity-50"
          >
            Select Image
          </button>

          {selectedFile && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="px-4 py-2 text-sm text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}