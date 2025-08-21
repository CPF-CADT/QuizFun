import React from 'react';
import { User, Mail, Edit3, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { InputField } from '../ui/InputField';
import { ActionButton } from '../ui/ActionButton';
import type { IUser } from '../../service/api';
import { useImageUpload } from '../../hook/useImageUpload'; 
const ImageUploader: React.FC<Partial<ReturnType<typeof useImageUpload>>> = ({
  isUploading,
  uploadedImageUrl,
  selectedFile,
  fileInputRef,
  handleSelectFileClick,
  handleFileSelect,
}) => {
  const imagePreviewUrl = selectedFile
    ? URL.createObjectURL(selectedFile)
    : uploadedImageUrl;

  return (
    <div className="relative">
      <img
        src={imagePreviewUrl || ''}
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/128x128/E0E7FF/4F46E5?text=??'; }}
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      <button
        type="button"
        onClick={handleSelectFileClick}
        disabled={isUploading}
        className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-indigo-700 transition"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ProfileSettingsProps {
  userData: IUser;
  isEditMode: boolean;
  onProfileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateProfile: (e: React.FormEvent<HTMLFormElement>) => void;
  onSetEditMode: (isEditing: boolean) => void;
  onCancelEdit: () => void;
  imageUploadProps: ReturnType<typeof useImageUpload>;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  userData,
  isEditMode,
  onProfileChange,
  onUpdateProfile,
  onSetEditMode,
  onCancelEdit,
  imageUploadProps,
}) => {
  return (
    <Card
      title="Profile Information"
      icon={User}
      extraHeaderContent={!isEditMode && (
        <ActionButton onClick={() => onSetEditMode(true)} variant="secondary" icon={Edit3}>
          Edit Profile
        </ActionButton>
      )}
    >
      <form onSubmit={onUpdateProfile} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {isEditMode ? (
            <ImageUploader {...imageUploadProps} />
          ) : (
            <img
              src={userData.profileUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
          )}

          {isEditMode ? (
            <div className="flex-grow w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField id="name" name="name" label="Full Name" type="text" value={userData.name} onChange={onProfileChange} icon={User} />
              <InputField id="email" name="email" label="Email Address" type="email" value={userData.email} onChange={onProfileChange} icon={Mail} />
            </div>
          ) : (
            <div className="flex-grow space-y-2">
              <h3 className="text-2xl font-bold text-gray-800">{userData.name}</h3>
              <p className="text-gray-600 flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" />{userData.email}</p>
            </div>
          )}
        </div>
        {isEditMode && (
          <div className="flex justify-end space-x-3">
            <ActionButton onClick={onCancelEdit} variant="secondary" icon={X}>Cancel</ActionButton>
            <ActionButton type="submit" icon={imageUploadProps.isUploading ? undefined : Upload}>
              {imageUploadProps.isUploading ? "Uploading..." : "Save Changes"}
            </ActionButton>
          </div>
        )}
      </form>
    </Card>
  );
};