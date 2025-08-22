// src/pages/SettingsPage.tsx

import React, { useState, useEffect, type ChangeEvent } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { PasswordSettings } from '../components/settings/PasswordSettings';
import { AccountStatus } from '../components/settings/AccountStatus';
import { SettingsHeader } from '../components/settings/SettingsHeader';
import Sidebar from '../components/dashboard/Sidebar';
import { useAuth } from '../context/AuthContext';
import { type IUser } from '../service/api';
import { useImageUpload } from '../hook/useImageUpload';
import { Menu } from 'lucide-react';
export interface Passwords {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  const [activeSection, setActiveSection] = useState<string>('settings');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const currentTime = new Date();

  const [userData, setUserData] = useState<IUser | null>(user || null);
  const [originalUserData, setOriginalUserData] = useState<IUser | null>(user || null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [passwords, setPasswords] = useState<Passwords>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const imageUploadProps = useImageUpload();

  useEffect(() => {
    if (imageUploadProps.uploadedImageUrl && userData) {
      setUserData({ ...userData, profileUrl: imageUploadProps.uploadedImageUrl });
    }
  }, [imageUploadProps.uploadedImageUrl, userData]);

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => prev ? { ...prev, [name]: value } : prev);
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userData) return;

    let finalUserData = { ...userData };

    try {
      if (imageUploadProps.selectedFile) {
        const newImageUrl = await imageUploadProps.handleUpload();
        if (newImageUrl) {
            finalUserData.profileUrl = newImageUrl;
        } else {
            // Optional: handle cases where upload fails but doesn't throw
            toast.error("Could not get the new image URL after upload.");
            return; 
        }
      }

      // await apiService.updateUserProfile(finalUserData); // Your backend call here
      
      setOriginalUserData(finalUserData);
      setUserData(finalUserData);
      setIsEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setUserData(originalUserData);
    imageUploadProps.setSelectedFile(null); 
    setIsEditMode(false);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    toast.success('Password changed successfully!');
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const resendVerificationEmail = () => {
    toast.success('Verification email sent!');
  };

  if (!userData) return null;

  return (
   <>
  {/* Mobile Header (shown only on small screens) */}
  <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
    <button
      onClick={() => setSidebarOpen(true)}
      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
    >
      <Menu className="w-5 h-5 text-gray-600" />
    </button>
  </div>

  {/* Page Layout */}
  <div className="flex min-h-screen">
    {/* Sidebar */}
    <Sidebar
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      currentTime={currentTime}
    />

    {/* Main Content */}
    <div className="flex-1 relative p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Background effects container */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Actual Page Content */}
      <div className="max-w-4xl mx-auto relative z-10">
        <SettingsHeader />

        <main className="space-y-8 mt-6">
          <ProfileSettings
            userData={userData}
            isEditMode={isEditMode}
            onProfileChange={handleProfileChange}
            onUpdateProfile={handleUpdateProfile}
            onSetEditMode={setIsEditMode}
            onCancelEdit={handleCancelEdit}
            imageUploadProps={imageUploadProps}
          />

          <PasswordSettings
            passwords={passwords}
            onPasswordChange={handlePasswordChange}
            onChangePassword={handleChangePassword}
          />

          <AccountStatus
            isVerified={userData.isVerified}
            role={userData.role}
            onResendVerification={resendVerificationEmail}
          />

          {/* Logout */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </main>
      </div>
    </div>
  </div>
</>

  );
};

export default SettingsPage;