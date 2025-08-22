import React from 'react';

export const SettingsHeader: React.FC = () => (
    <header className="text-center mb-10">
        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
            Account Settings
        </h1>
        <p className="text-lg text-gray-600">Manage your profile, password, and account preferences.</p>
    </header>
);