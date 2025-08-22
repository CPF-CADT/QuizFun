import React from 'react';
import { Shield } from 'lucide-react';
import { Card } from '../ui/Card';
import { ActionButton } from '../ui/ActionButton';

interface AccountStatusProps {
    isVerified: boolean;
    role: string;
    onResendVerification: () => void;
}

export const AccountStatus: React.FC<AccountStatusProps> = ({ isVerified, role, onResendVerification }) => (
    <Card title="Account Status" icon={Shield}>
        <div className={`p-4 rounded-lg flex items-center justify-between ${isVerified ? 'bg-green-100 border-green-200' : 'bg-yellow-100 border-yellow-200'} border`}>
            <div>
                <h3 className={`font-bold ${isVerified ? 'text-green-800' : 'text-yellow-800'}`}>
                    {isVerified ? 'Email Verified' : 'Verification Pending'}
                </h3>
                <p className={`text-sm ${isVerified ? 'text-green-700' : 'text-yellow-700'}`}>
                    {isVerified ? 'Your account is fully active.' : 'Please check your email to verify your account.'}
                </p>
            </div>
            {!isVerified && (
                <ActionButton onClick={onResendVerification} variant="secondary">
                    Resend Email
                </ActionButton>
            )}
        </div>
        <div className="mt-4 p-4 rounded-lg bg-blue-100 border border-blue-200 flex items-center">
            <p className="text-blue-800">Your current role is: <span className="font-bold capitalize">{role}</span></p>
        </div>
    </Card>
);