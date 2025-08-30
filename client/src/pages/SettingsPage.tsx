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
    <div className="lg:hidden flex items-center justify-between p-6 bg-white/95 backdrop-blur-2xl border-b border-gray-200/60 shadow-lg">
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-3 hover:bg-gray-50 rounded-2xl transition-all duration-300 hover:scale-105 group shadow-sm hover:shadow-md"
      >
        <Menu className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
      </button>
    </div>

    {/* Page Layout */}
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
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
          {/* Animated gradient orbs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-r from-purple-500/25 to-pink-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute -bottom-20 right-1/3 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/60 rounded-full animate-ping delay-300"></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-purple-400/60 rounded-full animate-ping delay-500"></div>
          <div className="absolute bottom-1/3 left-2/3 w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-ping delay-1000"></div>
          
          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-900/10 to-transparent"></div>
        </div>

        {/* Actual Page Content */}
        <div className="max-w-4xl mx-auto relative z-10">
          <SettingsHeader />
          <main className="space-y-6 mt-8">            

            <div className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 space-y-6">
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
            </div>

            {/* Logout */}
            <div className="pt-6 border-t border-gray-200/60">
              <button
                onClick={logout}
                className="group relative px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/25 font-medium tracking-wide"
              >
                <span className="relative z-10">Logout</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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